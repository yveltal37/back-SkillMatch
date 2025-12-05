import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async createCategory(name: string) {
    if (!name || !name.trim())
      throw new BadRequestException('Category name is required');

    const existing = await this.categoryRepo.findOne({ where: { name } });
    if (existing) throw new BadRequestException('Category already exists');

    const category = this.categoryRepo.create({ name });
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    await this.userCategoryRepo.delete({ category: { id } });

    await this.categoryRepo.delete(id);
  }

  async getAllCategories() {
    const categories = await this.categoryRepo.find({ order: { id: 'ASC' } });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  async assignUserCategories(user: User, categoryIds: number[]) {
    console.log("assignUserCategories CALLED");

    const categories = await this.categoryRepo.find({
      where: { id: In(categoryIds) },
      relations: {
        challengeCategories: { challenge: true },
      },
    });
    
    const userCategories = categories.map((c) =>
      this.userCategoryRepo.create({
        user: { id: user.id },
        category: { id: c.id },
      }),
    );

    await this.userCategoryRepo.save(userCategories);
  }

  async getUserCategories(userId: number): Promise<Category[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const userCategories = await this.userCategoryRepo.find({
      where: { user: { id: userId } },
      relations: ['category'],
    });

    return userCategories.map((uc) => uc.category);
  }
}
