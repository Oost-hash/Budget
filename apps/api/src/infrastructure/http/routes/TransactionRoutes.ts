import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { TransactionRepository } from '@infrastructure/repositories/TransactionRepository';
import { AccountRepository } from '@infrastructure/repositories/AccountRepository';
import { PayeeRepository } from '@infrastructure/repositories/PayeeRepository';
import { CategoryRepository } from '@infrastructure/repositories/CategoryRepository';
import { CreateTransfer } from '@application/use-cases/transactions/CreateTransfer';
import { CreateIncome } from '@application/use-cases/transactions/CreateIncome';
import { CreateExpense } from '@application/use-cases/transactions/CreateExpense';
import { GetTransactionById } from '@application/use-cases/transactions/GetTransactionById';
import { GetAllTransactions } from '@application/use-cases/transactions/GetAllTransactions';
import { UpdateTransaction } from '@application/use-cases/transactions/UpdateTransaction';
import { DeleteTransaction } from '@application/use-cases/transactions/DeleteTransaction';

export function createTransactionRoutes(dataSource: DataSource): Router {
  const router = Router();
  
  const transactionRepo = new TransactionRepository(dataSource);
  const accountRepo = new AccountRepository(dataSource);
  const payeeRepo = new PayeeRepository(dataSource);
  const categoryRepo = new CategoryRepository(dataSource);

  // GET /transactions - Get all transactions
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllTransactions(transactionRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /transactions/:id - Get transaction by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetTransactionById(transactionRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // POST /transactions/transfer - Create transfer
  router.post('/transfer', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateTransfer(transactionRepo, accountRepo);
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

  // POST /transactions/income - Create income
  router.post('/income', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateIncome(
        transactionRepo, 
        accountRepo, 
        payeeRepo, 
        categoryRepo
      );
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

  // POST /transactions/expense - Create expense
  router.post('/expense', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateExpense(
        transactionRepo, 
        accountRepo, 
        payeeRepo, 
        categoryRepo
      );
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

  // PUT /transactions/:id - Update transaction
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdateTransaction(
        transactionRepo, 
        payeeRepo, 
        categoryRepo
      );
      const result = await useCase.execute({ id, ...req.body });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Transaction not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /transactions/:id - Delete transaction
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeleteTransaction(transactionRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Transaction not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}