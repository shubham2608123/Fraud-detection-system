import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const formatDate = () => new Date().toLocaleString('en-IN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

const getRiskLevel = (score) => {
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
};

const safe = (v, d = 'N/A') => v != null ? v : d;
const safeN = (v, d = 0) => v != null ? v : d;

export function generatePDFReport(data) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  function header() {
    doc.setFillColor(24, 60, 140);
    doc.rect(0, 0, pw, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FraudShield AI - Investigation Report', pw / 2, 16, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bank of India - Cyber Security Division', pw / 2, 24, { align: 'center' });
    doc.text('Report Generated: ' + formatDate(), pw / 2, 31, { align: 'center' });
    y = 48;
  }

  function secTitle(title) {
    if (y + 15 > 270) { doc.addPage(); y = 20; }
    doc.setFillColor(235, 240, 250);
    doc.rect(14, y - 4, pw - 28, 9, 'F');
    doc.setTextColor(24, 60, 140);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 18, y + 2);
    y += 10;
  }

  function txt(text, opts) {
    opts = opts || {};
    if (y + 6 > 275) { doc.addPage(); y = 20; }
    doc.setTextColor(opts.r || 51, opts.g || 51, opts.b || 51);
    doc.setFontSize(opts.s || 9);
    doc.setFont('helvetica', opts.b ? 'bold' : 'normal');
    doc.text(text, 18, y);
    y += opts.h || 5;
  }

  function space(n) {
    if (y + n > 270) { doc.addPage(); y = 20; }
  }

  // Build report
  header();

  // 1. Executive Summary
  secTitle('1. EXECUTIVE SUMMARY');
  var s = data.summary || {};
  txt('Total Transactions Analyzed: ' + safe(s.total_transactions, '0'), { b: true });
  txt('Total Unique Accounts: ' + safe(s.total_accounts, '0'));
  txt('Mule Accounts Detected: ' + safe(s.mule_accounts_detected, '0'), { b: true, r: 220, g: 38, b: 38 });
  txt('Alerts Generated: ' + safe(s.alerts_generated, '0'));
  txt('Average Risk Score: ' + safe(s.average_risk_score, 'N/A'));
  y += 2;
  txt('Risk Distribution:', { b: true });
  txt('  High Risk: ' + (s.high_risk_count || 0) + ' accounts', { r: 220, g: 38, b: 38 });
  txt('  Medium Risk: ' + (s.medium_risk_count || 0) + ' accounts', { r: 217, g: 119, b: 6 });
  txt('  Low Risk: ' + (s.low_risk_count || 0) + ' accounts', { r: 22, g: 163, b: 74 });
  y += 3;

  // 2. Key Findings
  secTitle('2. KEY FINDINGS & RECOMMENDATIONS');
  var muleAccounts = (data.predictions || []).filter(function(p) { return p.prediction === 1; });
  var highRisk = muleAccounts.filter(function(a) { return (a.risk_score || 0) >= 80; });
  var medRisk = muleAccounts.filter(function(a) { return (a.risk_score || 0) >= 50 && (a.risk_score || 0) < 80; });

  txt('Total Suspicious Accounts: ' + muleAccounts.length, { b: true });
  txt('Critical Priority (Score >= 80): ' + highRisk.length, { r: 220, g: 38, b: 38 });
  txt('Medium Priority (Score 50-79): ' + medRisk.length, { r: 217, g: 119, b: 6 });
  y += 2;
  txt('Recommendations for Law Enforcement:', { b: true, s: 10 });
  txt('1. Immediately investigate all HIGH RISK accounts (score >= 80)');
  txt('2. Freeze transactions for accounts with fraud probability > 90%');
  txt('3. Cross-reference with known fraud patterns and watchlists');
  txt('4. Coordinate with local cyber crime cells in identified cities');
  txt('5. Request bank statements for all flagged accounts');
  txt('6. Monitor accounts with multi-city activity patterns');
  y += 3;

  // 3. City Analysis
  space(40);
  secTitle('3. GEOGRAPHIC ANALYSIS');
  var cityMap = {};
  (data.predictions || []).forEach(function(p) {
    if (p.city) {
      if (!cityMap[p.city]) cityMap[p.city] = { t: 0, h: 0, m: 0, l: 0 };
      cityMap[p.city].t++;
      if ((p.risk_score || 0) >= 80) cityMap[p.city].h++;
      else if ((p.risk_score || 0) >= 50) cityMap[p.city].m++;
      else cityMap[p.city].l++;
    }
  });
  var cityRows = Object.keys(cityMap).map(function(c) {
    return [c, '' + cityMap[c].t, '' + cityMap[c].h, '' + cityMap[c].m, '' + cityMap[c].l];
  }).sort(function(a, b) { return parseInt(b[2]) - parseInt(a[2]) || parseInt(b[1]) - parseInt(a[1]); });

  doc.autoTable({
    startY: y,
    head: [['City', 'Total', 'High Risk', 'Medium', 'Low']],
    body: cityRows,
    theme: 'grid',
    headStyles: { fillColor: [24, 60, 140], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // 4. All Mule Accounts
  space(40);
  secTitle('4. ALL MULE ACCOUNTS');
  txt('Total mule accounts: ' + muleAccounts.length, { b: true, s: 10 });
  y += 2;

  var muleRows = muleAccounts
    .sort(function(a, b) { return (b.risk_score || 0) - (a.risk_score || 0); })
    .map(function(a, i) {
      return [
        '' + (i + 1),
        safe(a.account_id),
        safeN(a.risk_score),
        getRiskLevel(a.risk_score),
        ((a.fraud_probability || 0) * 100).toFixed(1) + '%',
        safe(a.city),
        safe(a.state),
        safeN(a.incoming_count),
        safeN(a.outgoing_count),
        'Rs.' + safeN(a.incoming_amount).toLocaleString(),
        'Rs.' + safeN(a.outgoing_amount).toLocaleString(),
        safeN(a.linked_count),
        safeN(a.city_count),
      ];
    });

  doc.autoTable({
    startY: y,
    head: [['#', 'Account ID', 'Risk', 'Level', 'Fraud%', 'City', 'State', 'In', 'Out', 'In Amt', 'Out Amt', 'Linked', 'Cities']],
    body: muleRows,
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 6 },
    columnStyles: {
      0: { cellWidth: 7 },
      2: { cellWidth: 12 },
      3: { cellWidth: 13 },
      4: { cellWidth: 14 },
      9: { cellWidth: 22 },
      10: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
    didParseCell: function(d) {
      if (d.section === 'body' && d.column.index === 3) {
        var lv = d.cell.raw;
        if (lv === 'HIGH') d.cell.styles.textColor = [220, 38, 38];
        else if (lv === 'MEDIUM') d.cell.styles.textColor = [217, 119, 6];
        else d.cell.styles.textColor = [22, 163, 74];
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  // 5. All Alerts
  space(40);
  secTitle('5. COMPLETE ALERTS LOG');
  var alerts = data.alerts || [];
  txt('Total alerts: ' + alerts.length, { b: true, s: 10 });
  y += 2;

  if (alerts.length > 0) {
    var alertRows = alerts.map(function(a, i) {
      return [
        '' + (i + 1),
        safe(a.alert_id),
        safe(a.account_id),
        safe(a.city),
        safeN(a.risk_score),
        safe(a.severity).toUpperCase(),
        (a.reasons || []).join('; ').substring(0, 60),
        safe(a.timestamp),
        safe(a.status).toUpperCase(),
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['#', 'Alert ID', 'Account', 'City', 'Risk', 'Severity', 'Reason', 'Time', 'Status']],
      body: alertRows,
      theme: 'grid',
      headStyles: { fillColor: [24, 60, 140], fontSize: 7 },
      bodyStyles: { fontSize: 6 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // 6. Transaction Routes
  space(40);
  secTitle('6. SUSPICIOUS TRANSACTION ROUTES');
  var routes = data.routes || [];
  txt('Total inter-city routes: ' + routes.length, { b: true, s: 10 });
  y += 2;

  if (routes.length > 0) {
    var routeRows = routes
      .sort(function(a, b) {
        var o = { high: 0, medium: 1, low: 2 };
        return (o[a.risk_level] || 2) - (o[b.risk_level] || 2);
      })
      .map(function(r, i) {
        return [
          '' + (i + 1),
          safe(r.source_city),
          safe(r.destination_city),
          safeN(r.count),
          safeN(r.suspicious_count),
          'Rs.' + safeN(r.total_amount).toLocaleString(),
          safe(r.risk_level).toUpperCase(),
        ];
      });

    doc.autoTable({
      startY: y,
      head: [['#', 'From', 'To', 'Txns', 'Suspicious', 'Amount', 'Risk']],
      body: routeRows,
      theme: 'grid',
      headStyles: { fillColor: [24, 60, 140], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // 7. Investigation Checklist
  space(60);
  secTitle('7. INVESTIGATION CHECKLIST');
  var items = [
    'Verify account ownership through KYC documents',
    'Request complete transaction history from bank',
    'Cross-reference with national fraud database',
    'Check against RBI watchlist and defaulter lists',
    'Analyze IP addresses and device fingerprints',
    'Coordinate with local police in affected cities',
    'File FIR for accounts with fraud probability > 90%',
    'Monitor real-time transactions for high-risk accounts',
    'Investigate linked accounts for mule network',
    'Document evidence under IT Act, 2000',
    'Coordinate with CERT-In for incident reporting',
    'Prepare charge sheet with forensic accounting evidence',
  ];
  items.forEach(function(item, i) {
    space(8);
    doc.setDrawColor(150, 150, 150);
    doc.rect(18, y - 3, 3.5, 3.5);
    txt((i + 1) + '. ' + item, { s: 8 });
  });

  // Footer
  space(25);
  y += 8;
  doc.setDrawColor(24, 60, 140);
  doc.line(14, y, pw - 14, y);
  y += 6;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.text('CONFIDENTIAL - Generated by FraudShield AI for investigation purposes only.', pw / 2, y, { align: 'center' });
  y += 4;
  doc.text('Report ID: FR-' + Date.now() + ' | Bank of India Cyber Security Division', pw / 2, y, { align: 'center' });

  var fileName = 'FraudShield_Report_' + new Date().toISOString().split('T')[0] + '.pdf';
  doc.save(fileName);
  return fileName;
}

export function generateExcelReport(data) {
  var wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  var s = data.summary || {};
  var summaryRows = [
    ['FRAUDSHIELD AI - INVESTIGATION REPORT'],
    ['Bank of India - Cyber Security Division'],
    ['Report Generated: ' + formatDate()],
    [],
    ['EXECUTIVE SUMMARY'],
    ['Total Transactions', s.total_transactions || 0],
    ['Total Accounts', s.total_accounts || 0],
    ['Mule Accounts Detected', s.mule_accounts_detected || 0],
    ['Alerts Generated', s.alerts_generated || 0],
    ['Average Risk Score', s.average_risk_score || 0],
    [],
    ['RISK DISTRIBUTION'],
    ['High Risk Accounts', s.high_risk_count || 0],
    ['Medium Risk Accounts', s.medium_risk_count || 0],
    ['Low Risk Accounts', s.low_risk_count || 0],
  ];
  var ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
  ws1['!cols'] = [{ wch: 28 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  // Sheet 2: Mule Accounts
  var muleAccounts = (data.predictions || [])
    .filter(function(p) { return p.prediction === 1; })
    .sort(function(a, b) { return (b.risk_score || 0) - (a.risk_score || 0); });

  var muleHead = ['S.No', 'Account ID', 'Risk Score', 'Risk Level', 'Fraud %',
    'City', 'State', 'In Txns', 'Out Txns', 'In Amount',
    'Out Amount', 'Linked', 'Cities'];
  var muleData = muleAccounts.map(function(a, i) {
    return [
      i + 1,
      safe(a.account_id),
      safeN(a.risk_score),
      getRiskLevel(a.risk_score),
      ((a.fraud_probability || 0) * 100).toFixed(1),
      safe(a.city),
      safe(a.state),
      safeN(a.incoming_count),
      safeN(a.outgoing_count),
      safeN(a.incoming_amount),
      safeN(a.outgoing_amount),
      safeN(a.linked_count),
      safeN(a.city_count),
    ];
  });
  var ws2 = XLSX.utils.aoa_to_sheet([muleHead].concat(muleData));
  ws2['!cols'] = muleHead.map(function() { return { wch: 18 }; });
  XLSX.utils.book_append_sheet(wb, ws2, 'Mule Accounts');

  // Sheet 3: Alerts
  var alerts = data.alerts || [];
  var alertHead = ['S.No', 'Alert ID', 'Account ID', 'City', 'Risk Score', 'Severity', 'Reasons', 'Timestamp', 'Status'];
  var alertData = alerts.map(function(a, i) {
    return [
      i + 1,
      safe(a.alert_id),
      safe(a.account_id),
      safe(a.city),
      safeN(a.risk_score),
      safe(a.severity).toUpperCase(),
      (a.reasons || []).join('; '),
      safe(a.timestamp),
      safe(a.status).toUpperCase(),
    ];
  });
  var ws3 = XLSX.utils.aoa_to_sheet([alertHead].concat(alertData));
  ws3['!cols'] = alertHead.map(function() { return { wch: 20 }; });
  XLSX.utils.book_append_sheet(wb, ws3, 'Alerts');

  // Sheet 4: City Analysis
  var cityMap = {};
  (data.predictions || []).forEach(function(p) {
    if (p.city) {
      if (!cityMap[p.city]) cityMap[p.city] = { t: 0, h: 0, m: 0, l: 0, amt: 0 };
      cityMap[p.city].t++;
      if ((p.risk_score || 0) >= 80) cityMap[p.city].h++;
      else if ((p.risk_score || 0) >= 50) cityMap[p.city].m++;
      else cityMap[p.city].l++;
      cityMap[p.city].amt += (p.incoming_amount || 0) + (p.outgoing_amount || 0);
    }
  });
  var cityHead = ['City', 'Total', 'High Risk', 'Medium', 'Low', 'Amount'];
  var cityData = Object.keys(cityMap).map(function(c) {
    return [c, cityMap[c].t, cityMap[c].h, cityMap[c].m, cityMap[c].l, cityMap[c].amt];
  }).sort(function(a, b) { return b[2] - a[2] || b[1] - a[1]; });
  var ws4 = XLSX.utils.aoa_to_sheet([cityHead].concat(cityData));
  ws4['!cols'] = cityHead.map(function() { return { wch: 20 }; });
  XLSX.utils.book_append_sheet(wb, ws4, 'City Analysis');

  // Sheet 5: Routes
  var routes = data.routes || [];
  var routeHead = ['S.No', 'From', 'To', 'Txns', 'Suspicious', 'Amount', 'Risk'];
  var routeData = routes
    .sort(function(a, b) {
      var o = { high: 0, medium: 1, low: 2 };
      return (o[a.risk_level] || 2) - (o[b.risk_level] || 2);
    })
    .map(function(r, i) {
      return [
        i + 1,
        safe(r.source_city),
        safe(r.destination_city),
        safeN(r.count),
        safeN(r.suspicious_count),
        safeN(r.total_amount),
        safe(r.risk_level).toUpperCase(),
      ];
    });
  var ws5 = XLSX.utils.aoa_to_sheet([routeHead].concat(routeData));
  ws5['!cols'] = routeHead.map(function() { return { wch: 20 }; });
  XLSX.utils.book_append_sheet(wb, ws5, 'Routes');

  // Sheet 6: All Transactions
  var allPreds = data.predictions || [];
  var txnHead = ['S.No', 'Account ID', 'Type', 'Risk', 'Level', 'Fraud %',
    'City', 'State', 'In', 'Out', 'In Amt', 'Out Amt', 'Linked', 'Cities'];
  var txnData = allPreds.map(function(p, i) {
    return [
      i + 1,
      safe(p.account_id),
      p.prediction === 1 ? 'MULE' : 'NORMAL',
      safeN(p.risk_score),
      getRiskLevel(p.risk_score),
      ((p.fraud_probability || 0) * 100).toFixed(1),
      safe(p.city),
      safe(p.state),
      safeN(p.incoming_count),
      safeN(p.outgoing_count),
      safeN(p.incoming_amount),
      safeN(p.outgoing_amount),
      safeN(p.linked_count),
      safeN(p.city_count),
    ];
  });
  var ws6 = XLSX.utils.aoa_to_sheet([txnHead].concat(txnData));
  ws6['!cols'] = txnHead.map(function() { return { wch: 16 }; });
  XLSX.utils.book_append_sheet(wb, ws6, 'All Transactions');

  // Sheet 7: Checklist
  var checklistRows = [
    ['INVESTIGATION CHECKLIST'],
    [],
    ['S.No', 'Action Item', 'Status', 'Assigned To', 'Notes'],
  ];
  var checklistItems = [
    'Verify account ownership through KYC documents',
    'Request complete transaction history from bank',
    'Cross-reference with national fraud database',
    'Check against RBI watchlist and defaulter lists',
    'Analyze IP addresses and device fingerprints',
    'Coordinate with local police in affected cities',
    'File FIR for accounts with fraud probability > 90%',
    'Monitor real-time transactions for high-risk accounts',
    'Investigate linked accounts for mule network',
    'Document evidence under IT Act, 2000',
    'Coordinate with CERT-In for incident reporting',
    'Prepare charge sheet with forensic accounting evidence',
  ];
  checklistItems.forEach(function(item, i) {
    checklistRows.push([i + 1, item, 'Pending', '', '']);
  });
  var ws7 = XLSX.utils.aoa_to_sheet(checklistRows);
  ws7['!cols'] = [{ wch: 6 }, { wch: 55 }, { wch: 12 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws7, 'Checklist');

  // Save
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  var blob = new Blob([wbout], { type: 'application/octet-stream' });
  var fileName = 'FraudShield_Report_' + new Date().toISOString().split('T')[0] + '.xlsx';
  saveAs(blob, fileName);
  return fileName;
}
