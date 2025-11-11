import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
