import { Controller, Post, Body, Get, Header } from '@nestjs/common';
import { AuthenticationService } from './service/authentication.service';
import { SignupDto, LoginDto, CategoryDto } from './auth-dtos';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('categories')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getCategories(): Promise<CategoryDto[]> {
    return this.authService.getCategories();
  }

  @Post('refresh')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}
