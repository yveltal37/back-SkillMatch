import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Category } from 'src/entities/category.entity';
import { UserCategory } from '../entities/user_category.entity';
import { UserChallenge } from 'src/entities/user_challenge.entity';
import { log } from 'console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
    @InjectRepository(UserCategory)
    private readonly userChallengeRepo: Repository<UserChallenge>,
  ) {}

  async getAllUsers() {
    return this.userRepo.find({
      select: ['id', 'username', 'isAdmin'],
    });
  }

  async isAdminUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['isAdmin'],
    });

    if (!user) throw new NotFoundException('User not found');

    return user.isAdmin;
  }

  async getUserStatistics(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['userCategories', 'userCategories.category'],
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
      return;
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
