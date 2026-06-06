const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Alert = require('../models/Alert');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), filename);

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 120000,
    });

    const result = mlResponse.data;
    const batch_id = `BATCH${Date.now()}`;

    const transaction = new Transaction({
      batch_id,
      user: req.user.id,
      filename,
      upload_time: new Date().toISOString(),
      processing_time: result.processing_time,
      summary: result.summary,
      predictions: result.predictions,
      transactions: result.transactions,
      alerts: result.alerts,
      routes: result.routes,
    });
    await transaction.save();

    const accountDocs = result.predictions.map((p, i) => ({
      account_id: p.account_id,
      batch_id,
      user: req.user.id,
      prediction: p.prediction,
      fraud_probability: p.fraud_probability,
      risk_score: p.risk_score,
      risk_level: p.risk_level,
      city: p.city,
      state: p.state,
      incoming_count: p.incoming_count,
      outgoing_count: p.outgoing_count,
      incoming_amount: p.incoming_amount,
      outgoing_amount: p.outgoing_amount,
      linked_accounts: p.linked_accounts,
      linked_count: p.linked_count,
      destination_cities: p.destination_cities,
      cities_involved: p.cities_involved,
      city_count: p.city_count,
      row_index: p.row_index,
    }));
    await Account.insertMany(accountDocs);

    const alertDocs = result.alerts.map((a) => ({
      alert_id: a.alert_id,
      batch_id,
      user: req.user.id,
      account_id: a.account_id,
      city: a.city,
      risk_score: a.risk_score,
      reasons: a.reasons,
      timestamp: a.timestamp || new Date().toISOString(),
      status: a.status || 'new',
      severity: a.severity,
    }));
    if (alertDocs.length > 0) {
      await Alert.insertMany(alertDocs);
    }

    try { fs.unlinkSync(filePath); } catch (e) {}

    if (req.app.get('io')) {
      req.app.get('io').emit('new-upload', {
        batch_id,
        filename,
        summary: result.summary,
      });
    }

    res.json({
      status: 'success',
      batch_id,
      filename,
      processing_time: result.processing_time,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({
      error: 'Failed to process file',
      detail: error.response?.data?.detail || error.message,
    });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const batches = await Transaction.find({ user: req.user.id })
      .sort({ upload_time: -1 })
      .select('batch_id filename upload_time processing_time summary');
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const latest = await Transaction.findOne({ user: req.user.id })
      .sort({ upload_time: -1 });
    if (!latest) return res.json(null);
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest data' });
  }
});

router.get('/mule-accounts', authMiddleware, async (req, res) => {
  try {
    const mules = await Account.find({ user: req.user.id, prediction: 1 })
      .sort({ risk_score: -1 });
    res.json(mules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mule accounts' });
  }
});

router.get('/account/:accountId', authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      user: req.user.id,
      account_id: req.params.accountId,
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const latest = await Transaction.findOne({ user: req.user.id })
      .sort({ upload_time: -1 });
    const accountTransactions = latest
      ? latest.transactions.filter(
          (t) => t.source === req.params.accountId || t.destination === req.params.accountId
        )
      : [];

    res.json({ account, transactions: accountTransactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

router.get('/network/:accountId', authMiddleware, async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const account = await Account.findOne({ user: req.user.id, account_id: accountId });
    if (!account) return res.json({ nodes: [], edges: [] });

    const latest = await Transaction.findOne({ user: req.user.id })
      .sort({ upload_time: -1 });
    if (!latest) return res.json({ nodes: [], edges: [] });

    const nodes = [];
    const edges = [];
    const nodeIds = new Set();

    nodes.push({
      id: accountId,
      type: 'mule',
      data: {
        label: accountId,
        city: account.city,
        risk_score: account.risk_score,
        fraud_probability: account.fraud_probability,
      },
    });
    nodeIds.add(accountId);

    const linkedTxns = latest.transactions.filter(
      (t) => t.source === accountId || t.destination === accountId
    );

    for (const txn of linkedTxns) {
      const linkedId = txn.source === accountId ? txn.destination : txn.source;
      if (!nodeIds.has(linkedId)) {
        const linkedAccount = await Account.findOne({
          user: req.user.id,
          account_id: linkedId,
        });
        const nodeType = linkedAccount?.prediction === 1 ? 'mule' : 'connected';
        nodes.push({
          id: linkedId,
          type: nodeType,
          data: {
            label: linkedId,
            city: linkedAccount?.city || 'Unknown',
            risk_score: linkedAccount?.risk_score || 0,
            fraud_probability: linkedAccount?.fraud_probability || 0,
          },
        });
        nodeIds.add(linkedId);
      }
      edges.push({
        id: `${txn.source}-${txn.destination}`,
        source: txn.source,
        target: txn.destination,
        data: {
          amount: txn.amount,
          risk_score: txn.risk_score,
          is_suspicious: txn.is_suspicious,
        },
      });
    }

    res.json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network' });
  }
});

router.get('/:batchId', authMiddleware, async (req, res) => {
  try {
    const batch = await Transaction.findOne({
      user: req.user.id,
      batch_id: req.params.batchId,
    });
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Transaction.deleteMany({ user: req.user.id });
    await Account.deleteMany({ user: req.user.id });
    await Alert.deleteMany({ user: req.user.id });
    if (req.app.get('io')) {
      req.app.get('io').emit('data-cleared');
    }
    res.json({ status: 'success', message: 'All data cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

module.exports = router;
