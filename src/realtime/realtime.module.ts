import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [
    forwardRef(() => AuthenticationModule),
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
