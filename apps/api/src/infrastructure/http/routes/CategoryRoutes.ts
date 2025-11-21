import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { CategoryRepository } from '@infrastructure/repositories/CategoryRepository';
import { CreateCategory } from '@application/use-cases/categories/CreateCategory';
import { GetAllCategories } from '@application/use-cases/categories/GetAllCategories';
import { GetCategory } from '@application/use-cases/categories/GetCategory';
import { GetCategoriesByGroup } from '@application/use-cases/categories/GetCategoriesByGroup';
import { UpdateCategory } from '@application/use-cases/categories/UpdateCategory';
import { MoveCategoryToGroup } from '@application/use-cases/categories/MoveCategoryToGroup';
import { DeleteCategory } from '@application/use-cases/categories/DeleteCategory';
import { validate } from '@infrastructure/http/middleware/validate';
import { CreateCategorySchema, UpdateCategorySchema, MoveCategorySchema } from '@infrastructure/http/schemas/CategorySchemas';

export function createCategoryRoutes(dataSource: DataSource): Router {
  const router = Router();
  const categoryRepo = new CategoryRepository(dataSource);

  // POST /categories - Create new category
  router.post('/', validate(CreateCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new CreateCategory(categoryRepo);
      const result = await useCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /categories - Get all categories
  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const useCase = new GetAllCategories(categoryRepo);
      const result = await useCase.execute();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /categories/by-group/:groupId - Get categories by group
  router.get('/by-group/:groupId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupId } = req.params;
      const useCase = new GetCategoriesByGroup(categoryRepo);
      const result = await useCase.execute({
        groupId: groupId === 'null' ? null : groupId as string
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // GET /categories/:id - Get single category
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new GetCategory(categoryRepo);
      const result = await useCase.execute({ id: id as string });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // PUT /categories/:id - Update category
  router.put('/:id', validate(UpdateCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new UpdateCategory(categoryRepo);
      const result = await useCase.execute({
        id: id as string,
        name: req.body.name,
        position: req.body.position
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // POST /categories/:id/move - Move category to group
  router.post('/:id/move', validate(MoveCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new MoveCategoryToGroup(categoryRepo);
      const result = await useCase.execute({
        categoryId: id as string,
        targetGroupId: req.body.targetGroupId
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /categories/:id - Delete category
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const useCase = new DeleteCategory(categoryRepo);
      await useCase.execute({ id: id as string });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}