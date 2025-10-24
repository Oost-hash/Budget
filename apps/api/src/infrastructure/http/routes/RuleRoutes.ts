import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { RuleRepository } from '@infrastructure/repositories/RuleRepository';
import { PayeeRepository } from '@infrastructure/repositories/PayeeRepository';
import { CategoryRepository } from '@infrastructure/repositories/CategoryRepository';
import { CreateRule } from '@application/use-cases/rules/CreateRule';
import { GetAllRules } from '@application/use-cases/rules/GetAllRules';
import { GetRule } from '@application/use-cases/rules/GetRule';
import { GetRulesByPayee } from '@application/use-cases/rules/GetRulesByPayee';
import { GetRecurringRules } from '@application/use-cases/rules/GetRecurringRules';
import { UpdateRule } from '@application/use-cases/rules/UpdateRule';
import { DeleteRule } from '@application/use-cases/rules/DeleteRule';

export function createRuleRoutes(dataSource: DataSource): Router {
  const router = Router();
  const ruleRepo = new RuleRepository(dataSource);
  const payeeRepo = new PayeeRepository(dataSource);
  const categoryRepo = new CategoryRepository(dataSource);

  // POST /rules - Create new rule
  router.post('/', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateRule(ruleRepo, payeeRepo, categoryRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // GET /rules - Get all rules
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllRules(ruleRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /rules/recurring - Get all recurring rules
  router.get('/recurring', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetRecurringRules(ruleRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /rules/payee/:payeeId - Get rules by payee
  router.get('/payee/:payeeId', async (req: Request, res: Response) => {
    try {
      const { payeeId } = req.params;
      if (!payeeId) {
        res.status(400).json({ error: 'Payee ID is required' });
        return;
      }

      const activeOnly = req.query.active_only === 'true';

      const useCase = new GetRulesByPayee(ruleRepo);
      const result = await useCase.execute({ 
        payee_id: payeeId,
        active_only: activeOnly
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /rules/:id - Get single rule
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetRule(ruleRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Rule not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PUT /rules/:id - Update rule
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdateRule(ruleRepo, categoryRepo);
      const result = await useCase.execute({ id, ...req.body });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Rule not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /rules/:id - Delete rule
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeleteRule(ruleRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Rule not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}