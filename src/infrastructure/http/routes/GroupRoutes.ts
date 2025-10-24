import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { GroupRepository } from '@infrastructure/repositories/GroupRepository';
import { CreateGroup } from '@application/use-cases/categories/CreateGroup';
import { GetAllGroups } from '@application/use-cases/categories/GetAllGroups';
import { GetGroup } from '@application/use-cases/categories/GetGroup';
import { UpdateGroup } from '@application/use-cases/categories/UpdateGroup';
import { DeleteGroup } from '@application/use-cases/categories/DeleteGroup';

export function createGroupRoutes(dataSource: DataSource): Router {
  const router = Router();
  const groupRepo = new GroupRepository(dataSource);

  // POST /groups - Create new group
  router.post('/', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateGroup(groupRepo);
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

  // GET /groups - Get all groups
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllGroups(groupRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /groups/:id - Get single group
  router.get('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error && error.message === 'Group not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PUT /groups/:id - Update group
  router.put('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error) {
        if (error.message === 'Group not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /groups/:id - Delete group
  router.delete('/:id', async (req: Request, res: Response) => {
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
      if (error instanceof Error && error.message === 'Group not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}