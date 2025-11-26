import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserCategory } from '../entities/user_category.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
  ) {}

  async getAllUsers() {
    return this.userRepo.find({
      select: ['id', 'username', 'isAdmin', 'createdAt'],
    });
  }

  async getUserStatistics(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['userCategories'],
    });
    if (!user) throw new NotFoundException('User not found');

    return user.userCategories.map((uc) => ({
      categoryName: uc.category.name,
      completedChallenges: uc.completedCount,
    }));
  }

  async updateUserCategoryCounter(
    userId: number,
    categoryId: number,
    isCompleted: boolean,
  ) {
    const userCategory = await this.userCategoryRepo.findOne({
      where: { user: { id: userId }, category: { id: categoryId } },
    });

    if (!userCategory) {
      throw new NotFoundException(
        `UserCategory not found for user ${userId} and category ${categoryId}`,
      );
    }

    if (isCompleted) {
      userCategory.completedCount++;
    } else {
      userCategory.completedCount = Math.max(
        0,
        userCategory.completedCount - 1,
      );
    }

    this.userCategoryRepo.save(userCategory);
  }

  async getUserIdsByCategoryIds(categoryIds: number[]): Promise<number[]> {
    const userCategories = await this.userCategoryRepo.find({
      where: { category: { id: In(categoryIds) } },
      relations: ['user'],
    });

    return userCategories.map((uc) => uc.user.id);
  }
}
