import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DB_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async userExists(username: string): Promise<User> {
    const user = await this.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserByUserId(user:string){
    
    const users = await this.user.findUnique({
      where: {id: user},
    });
    if (!user) 
      throw new Error('User not found');

    return users;
  }

  async getAllUsers(){
    const users = await this.user.findMany({});
    return users;
  }

}
