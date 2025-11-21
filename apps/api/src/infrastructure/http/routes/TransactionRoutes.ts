import { Router, Request, Response, NextFunction } from 'express';
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
import { validate } from '@infrastructure/http/middleware/validate';
import { 
  CreateTransferSchema, 
  CreateIncomeSchema, 
  CreateExpenseSchema,
  UpdateTransactionSchema 
} from '@infrastructure/http/schemas/TransactionSchemas';

export function createTransactionRoutes(dataSource: DataSource): Router {
  const router = Router();
  
  const transactionRepo = new TransactionRepository(dataSource);
  const accountRepo = new AccountRepository(dataSource);
  const payeeRepo = new PayeeRepository(dataSource);
  const categoryRepo = new CategoryRepository(dataSource);

  // GET /transactions - Get all transactions
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllTransactions(transactionRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /transactions/:id - Get transaction by ID
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new GetTransactionById(transactionRepo);
      const result = await useCase.execute({ id: id as string });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /transactions/transfer - Create transfer
  router.post('/transfer', validate(CreateTransferSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreateTransfer(transactionRepo, accountRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /transactions/income - Create income
  router.post('/income', validate(CreateIncomeSchema), async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  // POST /transactions/expense - Create expense
  router.post('/expense', validate(CreateExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  });

  // PUT /transactions/:id - Update transaction
  router.put('/:id', validate(UpdateTransactionSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new UpdateTransaction(
        transactionRepo,
        payeeRepo,
        categoryRepo
      );
      const result = await useCase.execute({ id: id as string, ...req.body });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /transactions/:id - Delete transaction
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new DeleteTransaction(transactionRepo);
      await useCase.execute({ id: id as string });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}