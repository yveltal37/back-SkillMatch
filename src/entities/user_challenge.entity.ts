import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('user_challenges')
@Unique(['user', 'challenge'])
export class UserChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userChallenges, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.userChallenges, {
    onDelete: 'CASCADE',
  })
  challenge: Challenge;

  @Column({ default: false })
  isCompleted: boolean;
}
