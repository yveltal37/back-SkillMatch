import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { Category } from '../entities/category.entity';
import { ChallengeCategory } from '../entities/challenge_category.entity';
import { User } from '../entities/user.entity';
import { UserChallenge } from '../entities/user_challenge.entity';
import { UserCategory } from '../entities/user_category.entity';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepo: Repository<Challenge>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(ChallengeCategory)
    private challengeCategoryRepo: Repository<ChallengeCategory>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(UserChallenge)
    private userChallengeRepo: Repository<UserChallenge>,

    @InjectRepository(UserCategory)
    private userCategoryRepo: Repository<UserCategory>,
  ) {}

  async createChallenge(
    name: string,
    description: string,
    expirationDate: Date,
    categoryIds: number[],
  ) {
    if (!categoryIds?.length)
      throw new BadRequestException('Categories are required');

    const challenge = this.challengeRepo.create({
      name,
      description,
      expirationDate,
    });
    const savedChallenge = await this.challengeRepo.save(challenge);

    for (const categoryId of categoryIds) {
      const category = await this.categoryRepo.findOne({
        where: { id: categoryId },
      });
      if (!category)
        throw new NotFoundException(`Category ID ${categoryId} not found`);

      await this.challengeCategoryRepo.save(
        this.challengeCategoryRepo.create({
          challenge: savedChallenge,
          category,
        }),
      );
    }

    const userCategories = await this.userCategoryRepo.find({
      where: {
        category: { id: In(categoryIds) },
      },
      relations: ['user'],
    });

    const userIds = userCategories.map((uc) => uc.user.id);

    const userChallenges = userIds.map((userId) =>
      this.userChallengeRepo.create({
        user: { id: userId },
        challenge: { id: challenge.id },
        completed: false,
      }),
    );
    await this.userChallengeRepo.save(userChallenges);

    return savedChallenge;
  }

  async deleteChallenge(name: string) {
    const challenge = await this.challengeRepo.findOne({ where: { name } });
    if (!challenge) throw new NotFoundException('Challenge not found');

    await this.challengeRepo.remove(challenge);

    return { message: 'Challenge deleted successfully' };
  }

  async getUserChallenges(userId: number) {
    const now = new Date();

    const expiredUserChallenges = await this.userChallengeRepo.find({
      where: {
        user: { id: userId },
        challenge: { expirationDate: LessThan(now) },
      },
      relations: ['challenge'],
    });

    const expiredChallenges = expiredUserChallenges.map((uc) => uc.challenge);
    await this.challengeRepo.remove(expiredChallenges);
    

    return this.userChallengeRepo.find({
      where: { user: { id: userId } },
      relations: ['challenge'],
    });
  }
}
