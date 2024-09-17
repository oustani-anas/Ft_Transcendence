import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from './chat.service';

@Module({
  imports: [],
  providers: [ChatGateway, PrismaService, ChatService],
  exports: [ChatService]
})
export class ChatModule {}