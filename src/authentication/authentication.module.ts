import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationService } from './service/authentication.service';
import { AuthenticationController } from './authentication.controller';
import { AuthTokensService } from './service/tokens.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { User } from '../entities/user.entity';
import { CategoryModule } from '../category/category.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([User]),
    CategoryModule,
    ChallengeModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_ACCESS_SECRET');
        const expiresIn = config.get<string>('JWT_ACCESS_EXPIRATION');
        if (!secret || !expiresIn) {
          throw new Error('JWT configuration missing in .env');
        }

        return {
          secret,
          signOptions: { expiresIn } as JwtModuleOptions['signOptions'],
        };
      },
    }),
  ],
  providers: [AuthenticationService, AuthTokensService, JwtStrategy],
  controllers: [AuthenticationController],
  exports: [JwtModule, AuthenticationService, AuthTokensService],
})
export class AuthenticationModule {}
