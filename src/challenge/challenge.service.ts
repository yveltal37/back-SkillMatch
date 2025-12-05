import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, In } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { Category } from '../entities/category.entity';
import { ChallengeCategory } from '../entities/challenge_category.entity';
import { UserChallenge } from '../entities/user_challenge.entity';
import { CreateChallengeDto, ChallengeDto } from './challenge-dto';
import { UserService } from '../user/user.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(Challenge)
    private challengeRepo: Repository<Challenge>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(ChallengeCategory)
    private challengeCategoryRepo: Repository<ChallengeCategory>,
    @InjectRepository(UserChallenge)
    private userChallengeRepo: Repository<UserChallenge>,
    private readonly userService: UserService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async createChallenge(dto: CreateChallengeDto) {
    const { name, description, expirationDate, categoryIds } = dto;

    if (!categoryIds?.length)
      throw new BadRequestException('Categories are required');

    const challenge = this.challengeRepo.create({
      name,
      description,
      expirationDate: new Date(expirationDate),
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

    await this.assignChallengeToUsers(savedChallenge.id, categoryIds);
  }

  async assignChallengeToUsers(challengeId: number, categoryIds: number[]) {
    const userIds = await this.userService.getUserIdsByCategoryIds(categoryIds);

    for (const userId of userIds) {
      const existing = await this.userChallengeRepo.findOne({
        where: { user: { id: userId }, challenge: { id: challengeId } },
      });
      if (!existing) {
        const userChallenge = this.userChallengeRepo.create({
          user: { id: userId },
          challenge: { id: challengeId },
        });
        await this.userChallengeRepo.save(userChallenge);

        this.realtime.sendChallengeToUser(userId, {
          challengeId,
          message: 'New Challenge Assigned!',
        });
      }
    }
  }

  async deleteChallenge(id: number) {
    const challenge = await this.challengeRepo.findOne({ where: { id } });
    if (!challenge) throw new NotFoundException('Challenge not found');

    await this.challengeRepo.remove(challenge);

    return { message: 'Challenge deleted successfully' };
  }

  async getUserChallenges(userId: number): Promise<ChallengeDto[]> {
    const now = new Date();

    const isAdminUser = await this.userService.isAdminUser(userId);

    await this.challengeRepo.delete({
      expirationDate: LessThan(now),
    });

    if (isAdminUser) {
      const activeChallenges = this.challengeRepo.find({
        relations: ['challengeCategories', 'challengeCategories.category'],
      });

      return (await activeChallenges).map((challenge) => ({
        name: challenge.name,
        description: challenge.description,
        expirationDate: challenge.expirationDate.toISOString(),
        categoryIds:
          challenge.challengeCategories.map((cc) => cc.category.id) ?? [],
        categories:
          challenge.challengeCategories.map((cc) => cc.category.name) ?? [],
        id: challenge.id,
        isComplete: false,
      }));
    }

    const activeUserChallenges = await this.userChallengeRepo.find({
      where: { user: { id: userId } },
      relations: [
        'challenge',
        'challenge.challengeCategories',
        'challenge.challengeCategories.category',
      ],
    });

    return activeUserChallenges.map((uc) => ({
      id: uc.challenge.id,
      name: uc.challenge.name,
      description: uc.challenge.description,
      expirationDate: uc.challenge.expirationDate.toISOString(),
      categoryIds:
        uc.challenge.challengeCategories.map((cc) => cc.category.id) ?? [],
      categories:
        uc.challenge.challengeCategories.map((cc) => cc.category.name) ?? [],
      isComplete: uc.isCompleted,
    }));
  }

  async completeChallengeToggle(userId: number, challengeid: number) {
    const challenge = await this.challengeRepo.findOne({
      where: { id: challengeid },
      relations: ['challengeCategories', 'challengeCategories.category'],
    });

    if (!challenge) throw new NotFoundException('Challenge not found');

    const userChallenge = await this.userChallengeRepo.findOne({
      where: {
        user: { id: userId },
        challenge: { id: challenge.id },
      },
    });

    if (!userChallenge)
      throw new NotFoundException('User does not have this challenge');

    userChallenge.isCompleted = !userChallenge.isCompleted;
    await this.userChallengeRepo.save(userChallenge);

    for (const cc of challenge.challengeCategories) {
      await this.userService.updateUserCategoryCounter(
        userId,
        cc.category.id,
        userChallenge.isCompleted,
      );
    }
    return userChallenge;
  }

  async assignUserChallenges(userId: number, categoryIds: number[]) {
    const categories = await this.categoryRepo.find({
      where: { id: In(categoryIds) },
      relations: ['challengeCategories', 'challengeCategories.challenge'],
    });

    const challengesToAdd: { challengeId: number; userId: number }[] = [];

    for (const category of categories)
      for (const cc of category.challengeCategories)
        if (!challengesToAdd.find((c) => c.challengeId === cc.challenge.id))
          challengesToAdd.push({ challengeId: cc.challenge.id, userId });

    const userChallenges = challengesToAdd.map((c) =>
      this.userChallengeRepo.create({
        user: { id: c.userId },
        challenge: { id: c.challengeId },
      }),
    );

    if (userChallenges.length > 0)
      await this.userChallengeRepo.save(userChallenges);
  }
}
