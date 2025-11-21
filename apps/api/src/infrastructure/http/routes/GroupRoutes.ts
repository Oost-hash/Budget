import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { GroupRepository } from '@infrastructure/repositories/GroupRepository';
import { CreateGroup } from '@application/use-cases/categories/CreateGroup';
import { GetAllGroups } from '@application/use-cases/categories/GetAllGroups';
import { GetGroup } from '@application/use-cases/categories/GetGroup';
import { UpdateGroup } from '@application/use-cases/categories/UpdateGroup';
import { DeleteGroup } from '@application/use-cases/categories/DeleteGroup';
import { validate } from '@infrastructure/http/middleware/validate';
import { CreateGroupSchema, UpdateGroupSchema } from '@infrastructure/http/schemas/GroupSchemas';

export function createGroupRoutes(dataSource: DataSource): Router {
  const router = Router();
  const groupRepo = new GroupRepository(dataSource);

  // POST /groups - Create new group
  router.post('/', validate(CreateGroupSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreateGroup(groupRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /groups - Get all groups
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllGroups(groupRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /groups/:id - Get single group
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetGroup(groupRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // PUT /groups/:id - Update group
  router.put('/:id', validate(UpdateGroupSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdateGroup(groupRepo);
      const result = await useCase.execute({
        id,
        name: req.body.name
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /groups/:id - Delete group
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeleteGroup(groupRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}