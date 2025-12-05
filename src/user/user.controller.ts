import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../authentication/jwt/jwt-auth.guard';
import { log } from 'console';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('statistics/:username')
  async getUserStatistics(@Param('username') username: string) {    
    return this.userService.getUserStatistics(username);
  }
}
