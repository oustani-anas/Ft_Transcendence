import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { UserGateway } from './user.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatModule } from 'src/chat/chat.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({  
  imports: [EventEmitterModule.forRoot(), ChatModule],
  providers: [UserGateway, PrismaService, UserService, JwtService],
  controllers: [UserController]
})
export class UserModule {}
