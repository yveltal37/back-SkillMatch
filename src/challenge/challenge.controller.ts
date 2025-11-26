import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from '../authentication/jwt/jwt-auth.guard';
import type { CreateChallengeDto } from './challenge-dto';

@Controller('challenge')
@UseGuards(JwtAuthGuard)
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  async createChallenge(@Body() dto: CreateChallengeDto) {
    return this.challengeService.createChallenge(dto);
  }

  @Delete('delete/:name')
  async deleteChallenge(@Param('name') name: string) {
    return this.challengeService.deleteChallenge(name);
  }

  @Get('my-challenges')
  async getUserChallenges(@Req() req) {
    return this.challengeService.getUserChallenges(req.user.id);
  }

  @Post('toggle/:challengeName')
  async toggleChallenge(
    @Req() req,
    @Param('challengeName') challengeName: string,
  ) {
    return this.challengeService.completeChallengeToggle(
      req.user.id,
      challengeName,
    );
  }
}
