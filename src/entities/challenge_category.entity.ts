import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Challenge } from './challenge.entity';
import { Category } from './category.entity';

@Entity('challenge_categories')
export class ChallengeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Challenge, (challenge) => challenge.challengeCategories, {
    onDelete: 'CASCADE',
  })
  challenge: Challenge;

  @ManyToOne(() => Category, (category) => category.challengeCategories, {
    onDelete: 'CASCADE',
  })
  category: Category;
}
