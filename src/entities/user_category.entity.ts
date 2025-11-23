import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('user_categories')
export class UserCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  completedCount: number;

  @ManyToOne(() => User, (user) => user.userCategories, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, (category) => category.userCategories, {
    onDelete: 'CASCADE',
  })
  category: Category;
}
