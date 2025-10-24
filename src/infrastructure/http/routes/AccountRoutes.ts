import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { AccountRepository } from '@infrastructure/repositories/AccountRepository';
import { CreateAccount } from '@application/use-cases/accounts/CreateAccount';
import { GetAllAccounts } from '@application/use-cases/accounts/GetAllAccounts';
import { GetAccount } from '@application/use-cases/accounts/GetAccount';
import { UpdateAccount } from '@application/use-cases/accounts/UpdateAccount';
import { DeleteAccount } from '@application/use-cases/accounts/DeleteAccount';

export function createAccountRoutes(dataSource: DataSource): Router {
  const router = Router();
  const accountRepo = new AccountRepository(dataSource);

  // POST /accounts - Create new account
  router.post('/', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateAccount(accountRepo);
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

  // GET /accounts - Get all accounts
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllAccounts(accountRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /accounts/:id - Get single account
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetAccount(accountRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Account not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PUT /accounts/:id - Update account
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdateAccount(accountRepo);
      const result = await useCase.execute({
        id,
        ...req.body
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Account not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /accounts/:id - Delete account
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeleteAccount(accountRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Account not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}