import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserCategory } from './user_category.entity';
import { UserChallenge } from './user_challenge.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 'false' })
  isAdmin: boolean;

  @OneToMany(() => UserCategory, (uc) => uc.user)
  userCategories: UserCategory[];

  @OneToMany(() => UserChallenge, (uc) => uc.user)
  userChallenges: UserChallenge[];

  @CreateDateColumn()
  createdAt: Date;
}
