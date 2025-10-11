const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize database (creates default ledger if needed)
require('./db/ledger-manager');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/ledgers', require('./routes/ledgers'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Budget Tracker running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Multi-ledger system ready`);
});