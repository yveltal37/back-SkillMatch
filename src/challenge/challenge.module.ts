import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller';
import { ChallengeService } from './challenge.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '../entities/challenge.entity';
import { Category } from '../entities/category.entity';
import { ChallengeCategory } from '../entities/challenge_category.entity';
import { User } from '../entities/user.entity';
import { UserChallenge } from '../entities/user_challenge.entity';
import { UserCategory } from '../entities/user_category.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User, UserCategory, Challenge, ChallengeCategory, UserChallenge]),
    UserModule,
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
