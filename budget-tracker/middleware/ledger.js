// middleware/ledger.js
/**
 * Ledger Middleware
 * Attaches ledger database to request
 */
const { openLedger } = require('../db/database');

/**
 * Required ledger middleware
 * Requires ledger_id in query or body
 */
function ledgerMiddleware(req, res, next) {
  const ledgerId = req.query.ledger_id || req.body?.ledger_id;
  
  if (!ledgerId) {
    return res.status(400).json({
      error: 'ledger_id is required',
      message: 'Specify ledger via query parameter or body'
    });
  }
  
  try {
    req.ledgerDb = openLedger(ledgerId);
    req.ledgerId = ledgerId;
    next();
  } catch (error) {
    return res.status(404).json({
      error: 'Ledger not found',
      ledger_id: ledgerId
    });
  }
}

/**
 * Optional ledger middleware
 * Ledger not required
 */
function optionalLedgerMiddleware(req, res, next) {
  const ledgerId = req.query.ledger_id || req.body?.ledger_id;
  
  if (ledgerId) {
    try {
      req.ledgerDb = openLedger(ledgerId);
      req.ledgerId = ledgerId;
    } catch (error) {
      return res.status(404).json({
        error: 'Ledger not found',
        ledger_id: ledgerId
      });
    }
  }
  
  next();
}

module.exports = {
  ledgerMiddleware,
  optionalLedgerMiddleware
};