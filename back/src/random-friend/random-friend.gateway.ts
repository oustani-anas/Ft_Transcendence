import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Ball, Canvas, Game, Player } from './game-data.interface';
import { GameRandomService } from './random-friend.service';
import { UserService } from 'src/user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({path: '/game', cors: true})
export class RandomFriendGateway implements OnGatewayDisconnect {

  constructor(private readonly gameService: GameRandomService,private readonly userService: UserService, private eventEmitter: EventEmitter2) {};

  @WebSocketServer()
  server: Server;

  private game: Game[] = [];
  private id: number = -1;
  private rooms: { [roomId: string]: string[] } = {};
  private ball: Ball = { color: "WHITE", radius: 15, speed: 0.9, velocityX: 5, velocityY: 5, x: 450, y: 225 }
  private canvas: Canvas = { height: 0, width: 0 };
  private players: { [id: number]: Player[] } = {};
  private ids: string[] = [];

  public connectedUsers = new Map<string, any>();


  @SubscribeMessage('connecte')
  async handleConnection(@MessageBody() socket: Socket): Promise<void> {
    const availibleRoomId = Object.keys(this.rooms).find(roomId => this.rooms[roomId].length == 1);
    const token:any = socket.handshake.query.token;
    const token_id = this.gameService.getUserInfosFromToken(token);
    const user = await this.userService.getUser(token_id.sub);

    const existingUser = Array.from(this.connectedUsers.values());
    if (existingUser.includes(token_id.sub) || user.status === "inGame") {
      socket.emit("already_in_game");
      socket.disconnect();
      return;
    }

    
    this.connectedUsers.set(socket.id, token_id.sub);

      
    if (availibleRoomId)
    {
      
      let newBall:Ball = {...this.ball};
      this.rooms[availibleRoomId].push(socket.id);
      socket.join(availibleRoomId);
      this.server.to(availibleRoomId).emit("start");
      //
      this.id = this.game.length;
      if (this.players[this.id] && this.players[this.id].length == 1)
        this.players[this.id].push({id: socket.id, playerNb: 2, x: 880, y: 175 ,score:0, width: 20, height: 100,name:"player2",giveUp: false,db_id: token_id.sub,pic: "",g_id: ""});
      // console.log("------------players-Data-------------",this.id);
      // console.log(this.players);
      const newGame: Game = {
        nb: this.id,
        ball: newBall,
        players: this.players[this.id],
        rooms: this.rooms
      };
      this.userService.updateProfile("inGame",this.connectedUsers.get(this.players[this.id][0].id));
      this.eventEmitter.emit("refreshStatus");
      this.userService.updateProfile("inGame",this.connectedUsers.get(this.players[this.id][1].id));
      this.eventEmitter.emit("refreshStatus");
      this.game.push(newGame);

      this.rooms = Object.fromEntries(
        Object.entries(this.rooms)
          .filter(([roomId, players]) => !players.includes(socket.id))
      );
      this.gameService.startTheGame(this.game[this.id].players, this.game[this.id].rooms, availibleRoomId, this.server, this.game[this.id].ball, this.canvas);
    }
    else {
      this.id++;
      const newRoomId = socket.id;
      this.rooms[newRoomId] = [socket.id];
      socket.join(newRoomId);
      if (!this.players[this.id]) {
        this.players[this.id] = [];
      }
      if (this.players[this.id].length == 0)
        this.players[this.id].push({id: socket.id, playerNb: 1, x:0, y: 175,score: 0,width: 20, height: 100,name: "player1",giveUp:false,db_id: token_id.sub,pic: "", g_id: ""});
    }
  }

  @SubscribeMessage('canvas_data')
  handleEvent(
    @MessageBody() data: Canvas,
    @ConnectedSocket() client: Socket,
  ): void {
    this.canvas.height = data.height;
    this.canvas.width = data.width;
  }

  @SubscribeMessage('arrow_move')
  handleArrowMove(@MessageBody() data: string, @ConnectedSocket() socket: Socket): void {
    const id: number = this.gameService.findNbById(this.game, socket.id);
    this.gameService.handleArrowMove(data, socket.id, this.game[id].players);
  }

  @SubscribeMessage('mouse_move')
  handleMouseMove(@MessageBody() data: number, @ConnectedSocket() socket: Socket): void {
    const id: number = this.gameService.findNbById(this.game, socket.id);
    this.gameService.handleMouseMove(data, socket.id, this.game[id].players);
  }

  @SubscribeMessage('play_again')
  async PlayAgain(@MessageBody() data: number, @ConnectedSocket() socket: Socket): Promise<void> {
    this.gameService.resetBall(this.ball, this.canvas);
    this.gameService.ResetScore(this.players[this.id]);
  }

  @SubscribeMessage('user_id')
  async handle_id(@MessageBody() id: string, @ConnectedSocket() client: Socket): Promise<void> {
    const g_id: string = "";
    this.gameService.handle_id(id, g_id, client.id, this.game);
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.players = this.gameService.deletePlayerFromPlayers(this.players, client.id);
    this.rooms = Object.fromEntries(
      Object.entries(this.rooms)
        .filter(([roomId, players]) => !players.includes(client.id))
    );
    this.id = this.gameService.removeDataFromRooms(this.game, client.id,this.id,this.server);
  }
}
