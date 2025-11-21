import { Router, Request, Response, NextFunction } from 'express';
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
import { validate } from '@infrastructure/http/middleware/validate';
import { CreateRuleSchema, UpdateRuleSchema } from '@infrastructure/http/schemas/RuleSchemas';

export function createRuleRoutes(dataSource: DataSource): Router {
  const router = Router();
  const ruleRepo = new RuleRepository(dataSource);
  const payeeRepo = new PayeeRepository(dataSource);
  const categoryRepo = new CategoryRepository(dataSource);

  // POST /rules - Create new rule
  router.post('/', validate(CreateRuleSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreateRule(ruleRepo, payeeRepo, categoryRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /rules - Get all rules
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllRules(ruleRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /rules/recurring - Get all recurring rules
  router.get('/recurring', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetRecurringRules(ruleRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /rules/payee/:payeeId - Get rules by payee
  router.get('/payee/:payeeId', async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  // GET /rules/:id - Get single rule
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  // PUT /rules/:id - Update rule
  router.put('/:id', validate(UpdateRuleSchema), async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  // DELETE /rules/:id - Delete rule
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  return router;
}