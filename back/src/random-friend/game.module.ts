import { Module } from '@nestjs/common';
import { RandomFriendGateway } from './random-friend.gateway';
import { GameRandomService } from './random-friend.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [RandomFriendGateway, GameRandomService,UserService,PrismaService],
})
export class GameModule {}