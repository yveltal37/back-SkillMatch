import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { UserCategory } from 'src/entities/user_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, User, UserCategory]),
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService]
})
export class CategoryModule {}
