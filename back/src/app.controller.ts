import { Body, Controller, Get, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private prisma: PrismaService) {}
  
  
  // @Post('/updateUser')
  // async handleUpdatedUser(@Body() userId: any){
  //   return this.prisma.updateUser(userId);
  // }
  @Get("/")
  async healthCheck() {
    return "ok";
  }
}
