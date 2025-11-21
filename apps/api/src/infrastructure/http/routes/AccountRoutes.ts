import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { AccountRepository } from '@infrastructure/repositories/AccountRepository';
import { CreateAccount } from '@application/use-cases/accounts/CreateAccount';
import { GetAllAccounts } from '@application/use-cases/accounts/GetAllAccounts';
import { GetAccount } from '@application/use-cases/accounts/GetAccount';
import { UpdateAccount } from '@application/use-cases/accounts/UpdateAccount';
import { DeleteAccount } from '@application/use-cases/accounts/DeleteAccount';
import { validate } from '@infrastructure/http/middleware/validate';
import { CreateAccountSchema, UpdateAccountSchema } from '@infrastructure/http/schemas/AccountSchemas';

export function createAccountRoutes(dataSource: DataSource): Router {
  const router = Router();
  const accountRepo = new AccountRepository(dataSource);

  // POST /accounts - Create new account
  router.post('/', validate(CreateAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreateAccount(accountRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /accounts - Get all accounts
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllAccounts(accountRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /accounts/:id - Get single account
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new GetAccount(accountRepo);
      const result = await useCase.execute({ id: id as string }); // ✅ Type assertion
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // PUT /accounts/:id - Update account
  router.put('/:id', validate(UpdateAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new UpdateAccount(accountRepo);
      const result = await useCase.execute({ id: id as string, ...req.body }); // ✅ Type assertion
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /accounts/:id - Delete account
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new DeleteAccount(accountRepo);
      await useCase.execute({ id: id as string }); // ✅ Type assertion
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}