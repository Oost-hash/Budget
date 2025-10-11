const express = require('express');
const router = express.Router();
const { ledgerMiddleware } = require('../middleware/ledger');
const { endpoint } = require('../util/endpointBuilder');

router.use(ledgerMiddleware);

// GET /api/categories?ledger_id=X
endpoint('GET', '/')
  .table('categories')
  .order('group_name', 'ASC')
  .order('name', 'ASC')
  .execute('all')
  .register(router);

// GET /api/categories/:id?ledger_id=X
endpoint('GET', '/:id')
  .table('categories')
  .where('id = ?', 'id')
  .execute('get')
  .notFound('Category not found')
  .register(router);

// POST /api/categories?ledger_id=X
endpoint('POST', '/')
  .table('categories')
  .require('name', 'group_name')
  .insert('name', 'group_name')
  .register(router);

// PATCH /api/categories/:id?ledger_id=X
endpoint('PATCH', '/:id')
  .table('categories')
  .update('name', 'group_name')
  .where('id = ?', 'id')
  .notFound('Category not found')
  .register(router);

// DELETE /api/categories/:id?ledger_id=X
endpoint('DELETE', '/:id')
  .handler((req, res, db) => {
    const { id } = req.params;
    
    // Check usage
    const usageCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM transaction_categories 
      WHERE category_id = ?
    `).get(id);
    
    if (usageCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category in use',
        transaction_count: usageCount.count
      });
    }
    
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error('Category not found');
    }
    
    console.log('✅ Deleted category:', id);
    return { message: 'Category deleted successfully' };
  })
  .register(router);

module.exports = router;