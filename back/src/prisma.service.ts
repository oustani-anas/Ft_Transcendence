import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

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
    console.log("user", user);
    
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
