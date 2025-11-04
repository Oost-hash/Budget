import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { PayeeRepository } from '@infrastructure/repositories/PayeeRepository';
import { CreatePayee } from '@application/use-cases/payees/CreatePayee';
import { GetAllPayees } from '@application/use-cases/payees/GetAllPayees';
import { GetPayee } from '@application/use-cases/payees/GetPayee';
import { UpdatePayee } from '@application/use-cases/payees/UpdatePayee';
import { DeletePayee } from '@application/use-cases/payees/DeletePayee';
import { validate } from '@infrastructure/http/middleware/validate';
import { CreatePayeeSchema, UpdatePayeeSchema } from '@infrastructure/http/schemas/PayeeSchemas';

export function createPayeeRoutes(dataSource: DataSource): Router {
  const router = Router();
  const payeeRepo = new PayeeRepository(dataSource);

  // POST /payees - Create new payee
  router.post('/', validate(CreatePayeeSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreatePayee(payeeRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /payees - Get all payees
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllPayees(payeeRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /payees/:id - Get single payee
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetPayee(payeeRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // PUT /payees/:id - Update payee
  router.put('/:id', validate(UpdatePayeeSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdatePayee(payeeRepo);
      const result = await useCase.execute({
        id,
        ...req.body
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /payees/:id - Delete payee
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeletePayee(payeeRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}