import { Module } from '@nestjs/common';
import { PlayFriendGateway } from './Play_with_friend.gateway';
import { GameService } from './Play_with_friend.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';


@Module({
  providers: [PlayFriendGateway, GameService,UserService,PrismaService],
})
export class PlayFriendModule {}