// routes/ledgers.js
const express = require('express');
const router = express.Router();
const { endpoint } = require('../util/endpointBuilder');
const { 
  listLedgers, 
  getLedger, 
  createLedger, 
  updateLedger, 
  deleteLedger 
} = require('../db/ledger-manager');

// GET /api/ledgers - List all ledgers
endpoint('GET', '/')
  .handler((req, res) => {
    const ledgers = listLedgers();
    console.log('📚 Ledgers:', ledgers.length);
    return ledgers;
  })
  .register(router);

// GET /api/ledgers/:id - Get single ledger
endpoint('GET', '/:id')
  .handler((req, res) => {
    const ledger = getLedger(req.params.id);
    
    if (!ledger) {
      res.status(404).json({ error: 'Ledger not found' });
      return;
    }
    
    return ledger;
  })
  .register(router);

// POST /api/ledgers - Create new ledger
endpoint('POST', '/')
  .require('name')
  .handler((req, res) => {
    return createLedger(req.body.name);
  })
  .register(router);

// PATCH /api/ledgers/:id - Update ledger metadata
endpoint('PATCH', '/:id')
  .handler((req, res) => {
    const updates = {};
    
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.currency !== undefined) updates.currency = req.body.currency;
    
    try {
      return updateLedger(req.params.id, updates);
    } catch (error) {
      if (error.message === 'Ledger not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      throw error;
    }
  })
  .register(router);

// DELETE /api/ledgers/:id - Delete ledger
endpoint('DELETE', '/:id')
  .handler((req, res) => {
    try {
      deleteLedger(req.params.id);
      return { message: 'Ledger deleted successfully' };
    } catch (error) {
      if (error.message === 'Ledger not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      throw error;
    }
  })
  .register(router);

module.exports = router;