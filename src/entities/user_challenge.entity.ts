import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Challenge } from './challenge.entity';

@Entity('user_challenges')
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
  completed: boolean;
}
