import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { UserCategory } from '../../entities/user_category.entity';
import { SignupDto, LoginDto, CategoryDto } from '../auth-dtos';
import { AuthTokensService } from './tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CategoryService } from '../../category/category.service'; // 👈 מייבאים את הסרוויס

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepo: Repository<UserCategory>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authTokensService: AuthTokensService,
    private readonly categoryService: CategoryService,
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

    this.categoryService.assignUserCategories(user, signupDto.categoryIds);

    const tokens = this.authTokensService.generateTokens(savedUser);
    return tokens;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) 
      throw new BadRequestException('User not found');

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword)
      throw new BadRequestException('Invalid password');

    const tokens = this.authTokensService.generateTokens(user);
    
    return tokens;
  }

  async getCategories(): Promise<CategoryDto[]> {
    return this.categoryService.getAllCategories();
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'username']
    });
    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new BadRequestException('User not found');

      const tokens = this.authTokensService.generateTokens(user);
      return { tokens };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
