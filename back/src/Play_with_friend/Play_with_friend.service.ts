import { Injectable } from '@nestjs/common';
import { Ball, Canvas, Game, Player, Sides } from './game-data.interface';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameRandomService } from 'src/random-friend/random-friend.service';


@Injectable()
export class GameService {

    private bSide: Sides = { top: 0, bottom: 0, left: 0, right: 0 };
    private pSide: Sides = { top: 0, bottom: 0, left: 0, right: 0 };
    eventService: any;

    constructor(
      private readonly userService: UserService,
      private readonly prisma: PrismaService,
      private eventEmitter: EventEmitter2,
    ) {}

    async addGameResult(players: Player[], userId: string, result: boolean) {

      // console.log("kyaaaaaaaaaaah", players);
  
        const status = players[0].score > players[1].score ? "win" : "lose";
        const data:any = {
          userId: players[0].db_id,
          opponentId: players[1].db_id,
          status: status,
          userScore: players[0].score,
          opponentScore: players[1].score,
        }      
        const status2 = players[1].score > players[0].score ? "win" : "lose";
        const data2:any = {
          userId: players[1].db_id,
          opponentId: players[0].db_id,
          status: status2,
          userScore: players[1].score,
          opponentScore: players[0].score,
        }
        return await this.prisma.gameResult.create({ data: data }) && await this.prisma.gameResult.create({ data: data2 });
    
    }

    async test2(games :Game[] ,id:string):Promise<number>{

      for (let i =0; i< games.length; i++)
      {
        const friendRequest = await this.prisma.friendRequest.findFirst({
          where: {
            senderId: id,
            receiverId: games[i].players[0].db_id
          }
        });
        if(friendRequest && friendRequest.status === "Accepted")
          return (i);
      }
        return -1;
    }
    async test(games :Game ,id:string):Promise<boolean>{
      const friendRequest = await this.prisma.friendRequest.findFirst({
        where: {
          senderId: id,
          receiverId: games.players[0].db_id
        }
      });
      if(friendRequest)
        return (friendRequest.status === "Accepted");
      else
        return false;
    }

    async findSender(id:string): Promise<void> {
      
      try {
        const invite = await this.prisma.inviteToPlay.findFirst({
          where: {
            receiverId: id,
            status: 'accepted',
          },
        });
        if (invite)
          console.log("hada howa lisft lik l invite:",invite.senderId);
      } catch (error) {
        console.error('Error finding sender:', error);
      }
    }

    findIndexBySenderId(games :Game[],id:string, map:Map<string,string>):number
    {
      let result : number = -1;
      console.log("dkhal");
      const index = Object.keys(games);

      
      //this.findSender(id);
      for(let i = 0; i < games.length;i++)
      {
        if(!games[index[i]].players[0].opponent_id)
          continue;
        //console.log("--->[",games[index[i]].players[0].opponent_id, id , map.get(id) , games[index[i]].players[0].db_id,"]---<");
        if(games[index[i]].players[0].opponent_id === id && map.get(id) === games[index[i]].players[0].db_id)
        {
          //map.delete(id);
          result = i;
          break;
        }
      }
      return result;
    }

    async getReceiverIdBySenderId(senderId: string,player:Player[],opponents:string[]):Promise<void> {
      try {
        const invite = await this.prisma.inviteToPlay.findFirst({
          where: {
            senderId: senderId
          }
        });
        console.log("invite back ndakhel opponents_id",invite);
        if (invite) {
          player[0].opponent_id = invite.receiverId;
          opponents.push(invite.receiverId);
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error retrieving receiverId:', error);
        return null;
      }
    }

    checkWinner(players: Player[],rooms:{[roomId: string]: string[];}, roomId: string, server: Server): boolean{
      if (!players[0] || !players[1])
        return true;
      if (players[0].score >= 5)
      {
        server.to(roomId).emit("winner",players[0].name);
        this.addGameResult(players, players[0].db_id,false);
        this.userService.updateProfile("Online",players[0].db_id);
        this.userService.updateProfile("Online",players[1].db_id);
        this.eventEmitter.emit("refreshStatus");
        return true;
      }
      else if (players[1].score >= 5)
      {
        server.to(roomId).emit("winner",players[1].name)
        this.addGameResult(players, players[1].db_id,false);
        this.userService.updateProfile("Online",players[0].db_id);
        this.userService.updateProfile("Online",players[1].db_id);
        this.eventEmitter.emit("refreshStatus");
        return true;
      }
      return false;
    }

    collision(ball: Ball, canvas: Canvas, players: Player[]): boolean {

        if (!players[0] || !players[1])
          return;
        this.bSide.top = ball.y - ball.radius;
        this.bSide.bottom = ball.y + ball.radius;
        this.bSide.left = ball.x - ball.radius;
        this.bSide.right = ball.x + ball.radius;

        if (ball.x < canvas.width / 2) {
        this.pSide.top = players[0].y;
        this.pSide.bottom = players[0].y + players[0].height;
        this.pSide.left = players[0].x;
        this.pSide.right = players[0].x + players[0].width;
        } else {
        this.pSide.top = players[1].y;
        this.pSide.bottom = players[1].y + players[1].height;
        this.pSide.left = players[1].x;
        this.pSide.right = players[1].x + players[1].width;
        }

        return (
        this.bSide.right > this.pSide.left &&
        this.bSide.bottom > this.pSide.top &&
        this.bSide.left < this.pSide.right &&
        this.bSide.top < this.pSide.bottom
        );
    }

    handleArrowMove(data: string, socketId: string, players: Player[]): void {
      if (data === "up") {
        if (socketId === players[0].id) {
          if(players[0].y <= 350)
          players[0].y += 20;
      } else {
        if(players[1].y <= 350)
          players[1].y += 20;
        }
      } else if (data === "down") {
        if (socketId === players[0].id) {
          if(players[0].y > 0)
            players[0].y -= 20;
        } else {
          if(players[1].y > 1)
            players[1].y -= 20;
        }
      }
    }

    handleMouseMove(data: number, socketId: string, players: Player[]): void {
      if (!players[0])
        return;
      if (socketId === players[0].id) {
        players[0].y = data - players[0].height / 2;
      } else {
        players[1].y = data - players[1].height / 2;
      }
    }

    removePlayer(players:Player[], Id: string)
    {
      for (let i = 0; i < players.length;i++)
      {
        if (!players[i])
          continue;
        if (players[i].id === Id)
        {
          players.splice(i, 1);
          players.length = players.length;
          return;
        }
      }
    }

    async removeInviteToPlay(players: Player[]){
      try {
        const deletedInvite = await this.prisma.inviteToPlay.deleteMany({
          where: {
            senderId: players[0].db_id,
            receiverId: players[0].opponent_id,
          },
        });

        if (deletedInvite) {
          console.log("Invite removed successfully");
        }
        
      } catch (error) {
        console.error("Error removing invite:", error);
      }
    }

    removeDataFromRooms(game: Game[], id: string,gameId:number,server:Server,data_map: Map<string, string>): number {
      for (let i=0;i<game.length;i++)
      {
        if (game[i].players.length === 2)
        {
          if (game[i].players[0].id === id || game[i].players[1].id === id)
          {
            if(game[i].players[0].score < 5 && game[i].players[1].score < 5)
            {
              const roomId = Object.keys(game[i].rooms);
              if (game[i].players[0].id === id)
              {
                game[i].players[1].score = 5;
                game[i].players[0].giveUp = true;
                server.to(roomId[0]).emit("winner",game[i].players[1].name);
                this.addGameResult(game[i].players, game[i].players[1].db_id,false);
              }
              else
              {
                game[i].players[0].score = 5;
                game[i].players[1].giveUp = true;
                server.to(roomId[0]).emit("winner",game[i].players[0].name);
                this.addGameResult(game[i].players, game[i].players[0].db_id,true);
              }
            }
            data_map.forEach((value, key) => {
              if (key === game[i].players[0].opponent_id && value === game[i].players[0].db_id) {
                data_map.delete(key);
            }  });
            this.userService.updateProfile("Online", game[i].players[0].db_id);
            this.userService.updateProfile("Online", game[i].players[1].db_id);
            this.eventEmitter.emit("refreshStatus");
            game[i].players = game[i].players.filter(player => player.id !== id);//to think about it
            gameId--;
            game.splice(i, 1);
            break;
          }
        }
        else
        {
          //console.log("player in the game removed",game[i].players[0]);
          if(game[i].players[0])
          {
            if (game[i].players[0].id === id && game[i].players.length == 1)
            {
              //console.log("delet from map",game[i].players[0].opponent_id, game[i].players[0].db_id);
              data_map.forEach((value, key) => {
                if (key === game[i].players[0].opponent_id && value === game[i].players[0].db_id) {
                  data_map.delete(key);
              }  });
              this.userService.updateProfile("Online", game[i].players[0].db_id);
              this.eventEmitter.emit("refreshStatus");
              game.splice(i, 1);
              break;
            }
          }
        }
      }
      return gameId;
  }

  resetBall(ball:Ball , canvas:Canvas)
  {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }

  startTheGame(players: Player[], rooms: {[roomId: string]: string[]}, roomId: string, server: Server, ball: Ball, canvas: Canvas) {
    const intervalId = setInterval(async () => {

      if (this.checkWinner(players, rooms, roomId, server) || players[0].giveUp || players[1].giveUp) {
        clearInterval(intervalId);
      }

      const gameData = {
        ball,
        players,
      };
      server.to(roomId).emit('update', gameData);

      ball.x += ball.velocityX * ball.speed;
      ball.y += ball.velocityY * ball.speed;

      if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
      }

      let collisionResult = this.collision(ball, canvas, players);
      if (collisionResult) {
        if (ball.x < canvas.width / 2)
          ball.velocityX = 1.05 * Math.abs(ball.velocityX);
        else
          ball.velocityX = -1.05 * Math.abs(ball.velocityX);
      }
       if (players[0] && players[1])
       {
         if (ball.x - ball.radius < 0) {
           players[1].score++;
           this.resetBall(ball, canvas);
         } else if (ball.x + ball.radius > 900) {
           players[0].score++;
           this.resetBall(ball, canvas);
         }
       }

    }, 1000 / 60);
  }

  ResetScore(players:Player[])
  {
    players[0].score = 0;
    players[1].score = 0;
  }

  findNbById(game: Game[], id: string) 
  {

      for (let i:number = 0; i < game.length;i++)
      {
        for (const roomId of Object.keys(game[i].rooms)) {
          if (game[i].rooms[roomId].includes(id))
            return i;
      }
    }
  }

  async handle_id(db_id: string, g_id: string, socket_id: string,games: Game[])
  {
    for(let game of games)
    {
      if (game.players.length == 2)
      {
        if(game.players[0].id == socket_id)
        {
          game.players[0].db_id = db_id;
          const user = await this.userService.getUser(db_id);
          game.players[0].name = user.username;
          game.players[0].pic = user.avatar;
          game.players[0].g_id = g_id;
        }
        else if (game.players[1].id == socket_id)
        {
          game.players[1].db_id = db_id;
          const user = await this.userService.getUser(db_id);
          game.players[1].name = user.username;
          game.players[1].pic = user.avatar;
          game.players[1].g_id = g_id;
        }

      }
    }
  }

  public getUserInfosFromToken(token: string): any {
    try {
      const decoded = jwt.verify(token, "dontTellAnyone");
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return null;
    }
  }

}