import { Module } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { User } from '../entities/user.entity'; 
import { Category } from '../entities/category.entity'; 
import { Challenge } from '../entities/challenge.entity'; 
import { UserCategory } from '../entities/user_category.entity'; 
import { UserChallenge } from '../entities/user_challenge.entity'; 
import { ChallengeCategory } from '../entities/challenge_category.entity'; 
 
@Module({ 
  imports: [ 
    TypeOrmModule.forRoot({ 
      type: 'sqlite', 
      database: 'skillmatch.db', 
      entities: [ 
        User, 
        Category, 
        Challenge, 
        UserCategory, 
        UserChallenge, 
        ChallengeCategory, 
      ], 
      synchronize: true, 
      logging: true, 
    }), 
  ], 
}) 
export class DatabaseModule {} 
