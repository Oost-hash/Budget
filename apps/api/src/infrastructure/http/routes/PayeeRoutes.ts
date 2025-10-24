import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { PayeeRepository } from '@infrastructure/repositories/PayeeRepository';
import { CreatePayee } from '@application/use-cases/payees/CreatePayee';
import { GetAllPayees } from '@application/use-cases/payees/GetAllPayees';
import { GetPayee } from '@application/use-cases/payees/GetPayee';
import { UpdatePayee } from '@application/use-cases/payees/UpdatePayee';
import { DeletePayee } from '@application/use-cases/payees/DeletePayee';

export function createPayeeRoutes(dataSource: DataSource): Router {
  const router = Router();
  const payeeRepo = new PayeeRepository(dataSource);

  // POST /payees - Create new payee
  router.post('/', async (req: Request, res: Response) => {
    try {
      const useCase = new CreatePayee(payeeRepo);
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

  // GET /payees - Get all payees
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllPayees(payeeRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /payees/:id - Get single payee
  router.get('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error && error.message === 'Payee not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PUT /payees/:id - Update payee
  router.put('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error) {
        if (error.message === 'Payee not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /payees/:id - Delete payee
  router.delete('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error && error.message === 'Payee not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}