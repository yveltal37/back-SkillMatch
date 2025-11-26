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
}
