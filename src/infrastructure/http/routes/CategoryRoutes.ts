import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { CategoryRepository } from '@infrastructure/repositories/CategoryRepository';
import { CreateCategory } from '@application/use-cases/categories/CreateCategory';
import { GetAllCategories } from '@application/use-cases/categories/GetAllCategories';
import { GetCategory } from '@application/use-cases/categories/GetCategory';
import { GetCategoriesByGroup } from '@application/use-cases/categories/GetCategoriesByGroup';
import { UpdateCategory } from '@application/use-cases/categories/UpdateCategory';
import { MoveCategoryToGroup } from '@application/use-cases/categories/MoveCategoryToGroup';
import { DeleteCategory } from '@application/use-cases/categories/DeleteCategory';

export function createCategoryRoutes(dataSource: DataSource): Router {
  const router = Router();
  const categoryRepo = new CategoryRepository(dataSource);

  // POST /categories - Create new category
  router.post('/', async (req: Request, res: Response) => {
    try {
      const useCase = new CreateCategory(categoryRepo);
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

  // GET /categories - Get all categories
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const useCase = new GetAllCategories(categoryRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /categories/by-group/:groupId - Get categories by group
  // Special route BEFORE /:id to avoid conflict
  router.get('/by-group/:groupId', async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      if (!groupId) {
        res.status(400).json({ error: 'Group ID is required' });
        return;
      }

      const useCase = new GetCategoriesByGroup(categoryRepo);
      const result = await useCase.execute({
        groupId: groupId === 'null' ? null : groupId
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /categories/:id - Get single category
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new GetCategory(categoryRepo);
      const result = await useCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // PUT /categories/:id - Update category
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new UpdateCategory(categoryRepo);
      const result = await useCase.execute({
        id,
        name: req.body.name,
        position: req.body.position
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // POST /categories/:id/move - Move category to group
  router.post('/:id/move', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new MoveCategoryToGroup(categoryRepo);
      const result = await useCase.execute({
        categoryId: id,
        targetGroupId: req.body.targetGroupId
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Category not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /categories/:id - Delete category
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'ID is required' });
        return;
      }

      const useCase = new DeleteCategory(categoryRepo);
      await useCase.execute({ id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}