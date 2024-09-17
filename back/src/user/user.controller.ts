import { Body, Controller, Get, Headers, Req, Res, Post, UnauthorizedException, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import Fuse from 'fuse.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from './user.service';
import { ChatService } from 'src/chat/chat.service';
import { UserDto } from './user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly prisma: PrismaService, private eventEmitter: EventEmitter2, private UserService: UserService, private readonly ChatService: ChatService) { }
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async Getme(@Req() req, @Res() res, @Headers() headers) {
        try {
            const user = req.user;
            return await res.send({ info: true, user: user });
        }
        catch (e) {
            return await res.send({ info: false, message: "Error while getting user" });
        }
    }
    @Get('dyali')
    @UseGuards(AuthGuard('jwt'))
    async Getdyali(userId: any) {
        return await this.prisma.userExists(userId);
    }



    @Post('changeInfos')
    @UseGuards(AuthGuard('jwt'))
    async changeUsername(@Req() req, @Res() res, @Body() userDto: UserDto) {

        const isNameAlreadyExistes = await this.UserService.userNameCheck(userDto.username);
        const user = await this.UserService.getUser(userDto.id);

        if (user.username !== userDto.username && isNameAlreadyExistes)
            throw new UnauthorizedException('Name already taken')

        try {
            const user = req.user;
            await this.prisma.user.update({
                where: { id: userDto.id },
                data: { username: userDto.username, firstName: userDto.firstName, lastName: userDto.lastName, avatar: userDto.avatar }
            });
            // this.eventEmitter.emit("refreshAll");

            return await res.send({ info: true, message: "Username updated successfully" });
        }
        catch (e) {
            return await res.send({ info: false, message: "Error while updating username" });
        }
    }


    @Get('getUserByUserId')
    @UseGuards(AuthGuard('jwt'))
    async getUserByUserId(@Query('user') user: string) {
        
        if (!user || user === "undefined") return;
        const users = await this.prisma.getUserByUserId(user);
        if (!users)
            throw new NotFoundException("User not found");
        return users;
    }

    @Get('getAllUsers')
    @UseGuards(AuthGuard('jwt'))
    async getAllUsers(@Query('input') input: string) {
        const users = await this.prisma.getAllUsers();
        const options = {
            keys: ['username', 'firstName', 'lastName'],
            threshold: 0.2
        }
        const fuse = new Fuse(users, options);
        const filtered = fuse.search(input).map((elem) => elem.item);
        const modifiedFiltered = filtered.map(user => {
            const { twoFactorAuthCode, twoFactorAuthEnabled, firstLogin, ...rest } = user;
            return rest;
        });
        return modifiedFiltered;
    }

    @Post('sendFriendRequest')
    @UseGuards(AuthGuard('jwt'))
    async sendFriendRequest(@Body() req: any) {
        const user = await this.UserService.getUser(req.target);
        if (!user) return;

        const isRequestExist = await this.UserService.isRequestExist(req.target, req.sender);
        if (isRequestExist && isRequestExist.status === "Declined")
            await this.UserService.pendFriendRequest(isRequestExist.id, req.sender, req.target);
        else
            await this.UserService.createFriendRequest(req.target, req.sender);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");
    }

    @Post('sendPlayAgain')
    @UseGuards(AuthGuard('jwt'))
    async sendPlayAgain(@Body() req: any) {
        const user = await this.UserService.getUser(req.target);
        if (!user) return;

        const isRequestExist = await this.UserService.isPlayRequest(req.sender);
        
        if (isRequestExist )
            await this.UserService.deletePlayRequest(req.sender);

        await this.UserService.createPlayRequest(req.target, req.sender);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");
    }

    @Post('acceptFriendRequest')
    @UseGuards(AuthGuard('jwt'))
    async acceptFriendRequest(@Body() req: any) {
        const isExiste = await this.UserService.isRequestExistAndPending(req.notif.id, req.myId);
        if (isExiste !== 1) return;

        await this.UserService.acceptFriendRequest(req.notif.id);
        await this.UserService.makeFriends1(req.myId, req.notif.senderId);
        await this.UserService.makeFriends2(req.myId, req.notif.senderId);
        await this.ChatService.createDM(req.myId, req.notif.senderId);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");

    }

    @Post('declineFriendRequest')
    @UseGuards(AuthGuard('jwt'))
    async declineFriendRequest(@Body() req: any) {
        const isExiste = await this.UserService.isRequestExistAndPending(req.notif.id, req.myId);
        if (isExiste !== 1) return;

        await this.UserService.declineFriendRequest(req.notif.id);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");

    }

    @Post('acceptInviteToPlay')
    @UseGuards(AuthGuard('jwt'))
    async acceptInviteToPlay(@Body() req: any) {
        const isExiste = await this.UserService.isRequestExistAndPendingToPlay(req.notif.id, req.myId);
        if (isExiste !== 1) return;

        await this.UserService.acceptInviteToPlay(req.notif.id);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");
    }

    @Post('declineInviteToPlay')
    @UseGuards(AuthGuard('jwt'))
    async declineInviteToPlay(@Body() req: any) {
        const isExiste = await this.UserService.isRequestExistAndPendingToPlay(req.notif.id, req.myId);
        if (isExiste !== 1) return;

        await this.UserService.declineInviteToPlay(req.notif.id);
        this.eventEmitter.emit("refreshNotifications");
        this.eventEmitter.emit("refreshfriendShip");
    }

    @Get('getMyNotifications')
    @UseGuards(AuthGuard('jwt'))
    async getMyNotifications(@Query('userId') userId: string) {
        const myNotifications = await this.UserService.getMyNotifications(userId);
        return myNotifications;

    }
    @Get('getInviteToPlay')
    @UseGuards(AuthGuard('jwt'))
    async getInviteToPlay(@Query('userId') userId: string) {
        const myNotifications = await this.UserService.getInviteToPlay(userId);
        return myNotifications;
    }

    @Get('requestStatus')
    @UseGuards(AuthGuard('jwt'))
    async requestStatus(@Query('myId') myId: string, @Query('receiverId') receiverId: string) {
        const request = await this.UserService.isRequestExist(myId, receiverId);
        if (!request) return 0;
        return request;
    }

    @Get('checkIfFriend')
    @UseGuards(AuthGuard('jwt'))
    async checkIfFriend(@Query('myId') myId: string, @Query('receiverId') otherUser: string) {
        const checkIfFriend = await this.UserService.checkIfFriend(myId, otherUser);
        return (checkIfFriend);
    }

    @Post('blockUser')
    @UseGuards(AuthGuard('jwt'))
    async blockUser(@Body() req: any) {
        const user = await this.UserService.getUser(req.target);
        if (!user) return;

        const isRequestExist = await this.UserService.isRequestExist(req.myId, req.target);
        if (isRequestExist) {
            const checkIfFriend = await this.UserService.checkIfFriend(req.myId, req.target);
            if (checkIfFriend) {
                await this.UserService.removeFriendShip1(isRequestExist.senderId, isRequestExist.receiverId);
                await this.UserService.removeFriendShip2(isRequestExist.receiverId, isRequestExist.senderId);
            }
            await this.UserService.removeFriendRequest(isRequestExist.id);
        };

        await this.UserService.blockedUsers(req.myId, req.target);
        await this.UserService.blockedByUsers(req.myId, req.target);
        this.eventEmitter.emit("refreshfriendShip");
        this.eventEmitter.emit("refreshNotifications");
    }

    @Post('UnblockUser')
    @UseGuards(AuthGuard('jwt'))
    async UnblockUser(@Body() req: any) {
        const user = await this.UserService.getUser(req.target);
        if (!user) return;

        const isBlocked = await this.UserService.getIsBlocked(req.myId, req.target);
        const isBlockedBy = await this.UserService.getIsBlockedBy(req.myId, req.target);
        if (!isBlocked || !isBlockedBy) return;

        await this.UserService.unblockBlockedUsers(req.myId, req.target);
        await this.UserService.removekBlockedByUsers(req.myId, req.target);
        this.eventEmitter.emit("refreshfriendShip");
        this.eventEmitter.emit("refreshNotifications");
    }

    @Post('accept')
    @UseGuards(AuthGuard('jwt'))
    async Accept(@Body() req: any) {
        const user = await this.UserService.getUser(req.target);
        if (!user) return;

        const isRequestExist = await this.UserService.isRequestExist(req.myId, req.receiverId);
        req.notif = isRequestExist;

        if (isRequestExist) this.acceptFriendRequest(req);

    }

    @Get('userFreinds')
    @UseGuards(AuthGuard('jwt'))
    async displayFriends(@Query("userId") userId: string) {
        if (!userId || userId === "undefined") return;
        const friendsList = await this.UserService.friendList(userId);
        if (!friendsList) return;
        return friendsList;
    }

    @Get('myBlockList')
    @UseGuards(AuthGuard('jwt'))
    async myBlockList(@Query("myId") myId: string) {
        const blocklist = await this.UserService.blocklist(myId);
        const combinedBlockedUsers = [...blocklist.blockedByUsers, ...blocklist.blockedUsers];
        return combinedBlockedUsers;
    }

    @Get('lastGames')
    @UseGuards(AuthGuard('jwt'))
    async lastGames(@Query("userId") userId: string) {
        const lastGames : any= await this.UserService.getGameResult(userId);
        return lastGames;
    }

    @Get('achievements')
    @UseGuards(AuthGuard('jwt'))
    async achievements(@Query("userId") userId: string) {
        
        const gameResult : any= await this.UserService.getGameResult(userId);
    
        let check: number = 0;
        for(let i = 0; i < gameResult.length; i++) {
            if (gameResult[i].userId === userId && gameResult[i].status === "win") {
                check++;
            } 
        }
        if(check >= 3){
            this.UserService.getAchievements(userId, "achiev1");
        }
        if(check >= 5){
            this.UserService.getAchievements(userId, "achiev2");
        }
        if(check >= 7){
            this.UserService.getAchievements(userId, "achiev3");
        }
        if(check >= 15){
            this.UserService.getAchievements(userId, "achiev4");
        }
        if(check >= 20){
            this.UserService.getAchievements(userId, "achiev5");
        }
        if(check >= 25){
            this.UserService.getAchievements(userId, "achiev6");
        }
        
        
        return check;
    }
    
    @Get('getAllAchievements')
    @UseGuards(AuthGuard('jwt'))
    async getAllAchievements(@Query("userId") userId: string) {
        const allAchievements = await this.UserService.getAllAchievements(userId);
        return allAchievements;
    }
}



