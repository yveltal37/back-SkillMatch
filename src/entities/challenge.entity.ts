import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ChallengeCategory } from './challenge_category.entity';
import { UserChallenge } from './user_challenge.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'datetime' })
  expirationDate: Date;

  @OneToMany(() => ChallengeCategory, (cc) => cc.challenge)
  challengeCategories: ChallengeCategory[];

  @OneToMany(() => UserChallenge, (uc) => uc.challenge)
  userChallenges: UserChallenge[];

  @CreateDateColumn()
  createdAt: Date;
}
