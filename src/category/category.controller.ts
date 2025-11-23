import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../authentication/jwt/jwt-auth.guard';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async createCategory(@Body('name') categoryName: string) {
    return this.categoryService.createCategory(categoryName);
  }

  @Delete('delete:id')
  async deleteCategory(@Param('id', ParseIntPipe) categoryId: number) {
    return this.categoryService.deleteCategory(categoryId);
  }

  @Get('my-categories')
  async getUserCategories(@Req() req) {
    return this.categoryService.getUserCategories(req.user.id);
  }
}
