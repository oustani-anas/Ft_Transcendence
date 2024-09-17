import { Injectable, Req } from '@nestjs/common';
import { Ball, Canvas, Game, Player, Sides } from './game-data.interface';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import * as jwt from 'jsonwebtoken';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Injectable()
export class GameRandomService {

    private bSide: Sides = { top: 0, bottom: 0, left: 0, right: 0 };
    private pSide: Sides = { top: 0, bottom: 0, left: 0, right: 0 };
    eventService: any;
    jwtService: any;


    constructor(
      private readonly userService: UserService,
      private readonly prisma: PrismaService,
      private eventEmitter: EventEmitter2
    ) {}

    async addGameResult(players: Player[], userId: string, result: boolean) {

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
    
    checkWinner(players: Player[],rooms:{[roomId: string]: string[];}, roomId: string, server: Server): boolean{
      if (!players[0] || !players[1])
        return true;
      if (players[0].score >= 5)
      {
        server.to(roomId).emit("winner",players[0].name);
        this.addGameResult(players, players[0].db_id,true);
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
    if (data === "up") 
    {
      if (socketId === players[0].id) {
        if(players[0].y <= 350)
          players[0].y += 20;
      } 
      else {
        if(players[1].y <= 350)
          players[1].y += 20;
      }
    } 
    else if (data === "down") 
    {
      if (socketId === players[0].id) 
      {
        if(players[0].y > 0)
          players[0].y -= 20;
      } 
      else {
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

  deletePlayerFromPlayers(players: {[id:number]: Player[]},id:string):{[id:number]: Player[]}
  {
    const indexs = Object.keys(players);
    
    for(let i = 0; i < indexs.length;i++)
    {
      if(players[indexs[i]].length == 1 && players[indexs[i]][0].id == id)
        delete players[indexs[i]];    
      else if(players[indexs[i]].length == 2)
      {
        if(players[indexs[i]][0].id == id)
          delete players[indexs[i]];
        else if(players[indexs[i]][1].id == id)
          delete players[indexs[i]];
      }
    }
    const index = Object.keys(players);
    if(index[0] !== '0')
    {
      let new_players : { [id: string]: Player[] } = {};
      for (let i =0; i < index.length; i++)
      {
        new_players[i.toString()] = players[index[i]];
      }
      return (new_players);
    }
    return players;
  }

  removeDataFromRooms(game: Game[], id: string,gameId:number,server:Server): number {
    for (let i=0;i<game.length;i++)
    {
      if (game[i].players.length === 2)
      {
        if (game[i].players[0].id == id || game[i].players[1].id == id)
        {
          if(game[i].players[0].score < 5 && game[i].players[1].score < 5)
          {
            const roomId = Object.keys(game[i].rooms);
            if (game[i].players[0].id === id)
            {
              game[i].players[0].giveUp = true;
              game[i].players[1].score = 5;
              server.to(roomId[0]).emit("winner",game[i].players[1].name);
            }
            else
            {
              game[i].players[1].giveUp = true;
              game[i].players[0].score = 5;
              server.to(roomId[0]).emit("winner",game[i].players[0].name);
            }
          }
          this.userService.updateProfile("Online", game[i].players[0].db_id);
          this.userService.updateProfile("Online", game[i].players[1].db_id);
          this.eventEmitter.emit("refreshStatus");
          game[i].players = game[i].players.filter(player => player.id !== id);
          game.splice(i, 1);
          break;
        }
      }
      else
      {
        if (game[i].players[0].id === id && game[i].players.length == 1)
        {
          this.userService.updateProfile("Online", game[i].players[0].db_id);
          this.eventEmitter.emit("refreshStatus");
          game.splice(i, 1);
          break;
        }
      } 
    }
    for(let i =0;i< game.length;i++)
    {
      game[i].nb = i;
    }
    gameId = game.length - 1;
    return gameId;
  }


  resetBall(ball:Ball , canvas:Canvas)
  {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
  }

  startTheGame(players: Player[], rooms: {[roomId: string]: string[]}, roomId: string, server: Server, ball: Ball, canvas: Canvas) {
    
    let check:number = 0;
    const intervalId = setInterval(async () => {
      
      if (canvas)
      {
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
            ball.velocityX = Math.abs(ball.velocityX);
        else
          ball.velocityX = -1 * Math.abs(ball.velocityX);
        }
        if (players[0] && players[1]) {
          if (ball.x - ball.radius < 0) {
            players[1].score++;
            this.resetBall(ball, canvas);
          } else if (ball.x + ball.radius > 900) {
            players[0].score++;
            this.resetBall(ball, canvas);
          }
        }
        if(check == 0)
          check++;
      }
    }, 1000 / 60);
  }

  ResetScore(players: Player[]) {
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

  async handle_id(db_id: string, g_id: string, socket_id: string, games: Game[]) {
    for (let game of games) {
      if (!game.players)
        return;
      if (game.players.length == 2) {
        if (game.players[0].id == socket_id) {
          game.players[0].db_id = db_id;
          const user = await this.userService.getUser(db_id);
          game.players[0].name = user.username;
          game.players[0].pic = user.avatar;
          game.players[0].g_id = g_id;
        }
        else if (game.players[1].id == socket_id) {
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

      const decoded = jwt.verify(token, `${process.env.SECRET_KEY}`);

      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return null;
    }
  }

}

