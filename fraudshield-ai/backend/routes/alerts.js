const express = require('express');
const Alert = require('../models/Alert');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { severity, status, city, limit } = req.query;
    const filter = { user: req.user.id };

    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (city) filter.city = city;

    let query = Alert.find(filter).sort({ timestamp: -1 });
    if (limit) query = query.limit(parseInt(limit));

    const alerts = await query;
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest alerts' });
  }
});

router.patch('/:alertId', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const alert = await Alert.findOneAndUpdate(
      { user: req.user.id, alert_id: req.params.alertId },
      update,
      { new: true }
    );

    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Alert.deleteMany({ user: req.user.id });
    res.json({ status: 'success', message: 'All alerts cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear alerts' });
  }
});

router.delete('/:alertId', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      user: req.user.id,
      alert_id: req.params.alertId,
    });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ status: 'success', message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id });
    const total = alerts.length;
    const critical = alerts.filter((a) => a.severity === 'critical').length;
    const high = alerts.filter((a) => a.severity === 'high').length;
    const medium = alerts.filter((a) => a.severity === 'medium').length;
    const low = alerts.filter((a) => a.severity === 'low').length;
    const newAlerts = alerts.filter((a) => a.status === 'new').length;
    const investigating = alerts.filter((a) => a.status === 'investigating').length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;

    res.json({ total, critical, high, medium, low, new: newAlerts, investigating, resolved });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert stats' });
  }
});

module.exports = router;
