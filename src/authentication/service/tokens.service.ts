import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; 
import { User } from '../../entities/user.entity';  
import { JwtSignOptions } from '@nestjs/jwt'; 
 
@Injectable() 
export class AuthTokensService { 
  constructor( 
    private readonly jwtService: JwtService, 
    private readonly configService: ConfigService, 
  ) {} 

  generateTokens(user: User) { 
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET'); 
    const accessExp = this.configService.get<string>('JWT_ACCESS_EXPIRATION'); 
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET'); 
    const refreshExp = this.configService.get<string>('JWT_REFRESH_EXPIRATION'); 

    if (!accessSecret || !accessExp || !refreshSecret || !refreshExp) { 
        throw new InternalServerErrorException('JWT configuration is missing in .env'); 
    } 

    const payload = {  
      username: user.username,  
      sub: user.id,  
    }; 

    const accessOptions = { 
      secret: accessSecret, 
      expiresIn: accessExp,  
    } as JwtSignOptions ;  

    const refreshOptions = { 
      secret: refreshSecret, 
      expiresIn: refreshExp, 
    } as JwtSignOptions;  

    const accessToken = this.jwtService.sign(payload, accessOptions); 
    const refreshToken = this.jwtService.sign(payload, refreshOptions); 
 
    return { 
      accessToken, 
      refreshToken, 
    }; 
  } 
} 