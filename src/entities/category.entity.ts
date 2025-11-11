import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCategory } from './user_category.entity';
import { ChallengeCategory } from './challenge_category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserCategory, (uc) => uc.category)
  userCategories: UserCategory[];

  @OneToMany(() => ChallengeCategory, (cc) => cc.category)
  challengeCategories: ChallengeCategory[];
}
