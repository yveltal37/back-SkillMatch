import { Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { UserCategory } from '../entities/user_category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
  ) {}

  async createCategory(name: string): Promise<Category> {
    if (!name || !name.trim()) 
      throw new BadRequestException('Category name is required');

    const existing = await this.categoryRepo.findOne({ where: { name } });
    if (existing) 
      throw new BadRequestException('Category already exists');

    const category = this.categoryRepo.create({ name });
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) 
      throw new NotFoundException('Category not found');

    await this.userCategoryRepo.delete({ category: { id } });

    await this.categoryRepo.delete(id);
  }
}
