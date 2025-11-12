import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { UserCategory } from '../../entities/user_category.entity';
import { SignupDto, LoginDto, CategoryDto } from '../auth-dtos';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(UserCategory)
    private userCategoryRepo: Repository<UserCategory>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, password, categoryIds } = signupDto;
    
    if(!username)
        throw new BadRequestException('Username is required');
    if(!password)
        throw new BadRequestException('Password is required');
    if (!categoryIds || categoryIds.length < 3 || categoryIds.length > 5) 
      throw new BadRequestException('3-5 categories are required');

    const existingUser = await this.userRepo.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      isAdmin: false,
    });
    const savedUser = await this.userRepo.save(user);

    const categories = await this.categoryRepo.findByIds(categoryIds);

    const userCategories = categories.map(cat => {
      return this.userCategoryRepo.create({ user: savedUser, category: cat });
    });

    await this.userCategoryRepo.save(userCategories);

    return {
      id: savedUser.id,
      username: savedUser.username,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepo.findOne({ where: { username } });

    if (!user) 
      throw new BadRequestException('User not found');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      throw new BadRequestException('Invalid password');

    return {
      id: user.id,
      username: user.username,
    };
  }

  async getCategories(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepo.find();
    return categories.map(c => ({
      id: c.id,
      name: c.name,
    }));
  }
}
