import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket , Server} from 'socket.io';
import { Ball, Canvas, Game, Player } from './game-data.interface';
import { GameService } from './Play_with_friend.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserService } from 'src/user/user.service';


let  status: Map<string, string> = new Map();

@WebSocketGateway({path: '/play', cors: true})
export class PlayFriendGateway implements OnGatewayDisconnect {

  constructor(private readonly gameService: GameService,private readonly userService: UserService, private eventEmitter: EventEmitter2) {};

  @WebSocketServer()
  
  server: Server;

  private game : Game [] = [];
  private id: number = 0;
  private rooms: {[roomId:string]: string[]} = {};
  private ball : Ball = {color: "WHITE",radius: 15,speed: 0.9,velocityX: 5,velocityY: 5,x: 450,y: 225}
  private canvas: Canvas = {height: 0,width:0};
  private players: Player[]= [];
  private ids:string[] = [];

  private opponents:string[] = [];
  private connectedUsers = new Map<string, any>();
  private  acc_rqst: Map<string, string> = new Map();
  private acc_r: [string,string][] = [];


  @SubscribeMessage('connecte')
  async handleConnection(socket: Socket): Promise<void> {


    const token:any = socket.handshake.query.token;
    const senderId:any = socket.handshake.query.id;
    const tar:any = socket.handshake.query.tar;
    
    if (token && token == "token_data")
    {
      
      this.acc_rqst.set(tar,senderId);
      return;
    }
    else if (token && token == "token_d")
    {
      const send:any = socket.handshake.query.send;
      
      status.set(send,"yes");
      for (const [key, val] of this.acc_rqst.entries()) {
        if (val === tar) {
          this.acc_rqst.delete(key); // Remove the entry if the value matches
        }
      }
      this.acc_rqst.set(send,tar);
      return;
    }
    const token_id = this.gameService.getUserInfosFromToken(token);
    let user:any;
    if(token_id)
      user = await this.userService.getUser(token_id.sub);
    const existingUser = Array.from(this.connectedUsers.values());
    if(!user) return;
    if (existingUser.includes(token_id.sub) || user.status === "inGame") {
      socket.emit("already_in_game");
      socket.disconnect();
      return;
    } 
    this.connectedUsers.set(socket.id, token_id.sub);
    const index: any = this.gameService.findIndexBySenderId(this.game,senderId,this.acc_rqst);
    if (index != -1 && (status.get(token_id.sub) === "yes"))
    {
      status.set(token_id.sub, "no");
      const availibleRoomId = Object.keys(this.game[index].rooms).find(roomId => this.game[index].rooms[roomId].length == 1);
      if(!availibleRoomId) return;
      this.game[index].rooms[availibleRoomId].push(socket.id);
      socket.join(availibleRoomId);
      this.server.to(availibleRoomId).emit("start");
      this.game[index].players.push({id: socket.id, playerNb: 2, x: 880, y: 175 ,score:0, width: 20, height: 100,name:"player2",giveUp: false,db_id: "",pic: "",g_id: "",opponent_id:""});

      this.userService.updateProfile("inGame",this.connectedUsers.get(this.game[index].players[0].id));
      //this.eventEmitter.emit("refreshStatus");
      this.userService.updateProfile("inGame",this.connectedUsers.get(this.game[index].players[1].id));
      this.eventEmitter.emit("refreshStatus");

      this.gameService.handle_id(senderId,"", socket.id,this.game);
      this.gameService.removeInviteToPlay(this.game[index].players);
      this.game[index].players[0].db_id = senderId;
      this.gameService.startTheGame(this.game[index].players, this.game[index].rooms, availibleRoomId, this.server, this.game[index].ball, this.canvas);
    }
    else
    {
      const newRoomId = socket.id;
      this.rooms[newRoomId] = [socket.id];
      socket.join(newRoomId);
      
      this.players.push({id: newRoomId, playerNb: 1, x:0, y: 175,score: 0,width: 20, height: 100,name: "player1",giveUp:false,db_id: senderId,pic: "", g_id: "",opponent_id: tar});
      const index = Object.keys(this.players);
      //await this.gameService.getReceiverIdBySenderId(senderId,this.players,this.opponents);
      let newBall:Ball = {...this.ball};
      const newGame: Game = {
        nb: this.id,
        ball: newBall,
        players: [],
        rooms: this.rooms,
      };
      newGame.players.push(this.players[index[0]]);
      this.game.push(newGame);
      this.players = [];
      this.rooms = {};
      this.id++;
      this.gameService.handle_id(senderId,"", socket.id,this.game);
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


  @SubscribeMessage('user_id')
  async handle_id(@MessageBody() id: string , @ConnectedSocket() client: Socket) : Promise<void>
  {
    const g_id:string = ""; 
    this.gameService.handle_id(id,g_id, client.id,this.game);
  }

  @SubscribeMessage('checker_y')
  handle_status_yes(@MessageBody() data: string , @ConnectedSocket() client: Socket) : void
  {
    status.set(data,"yes");
    //client.disconnect();
  }

  handleDisconnect(client: Socket) 
  {
    this.connectedUsers.delete(client.id);
    this.id = this.gameService.removeDataFromRooms(this.game, client.id,this.id,this.server,this.acc_rqst);
    this.players = [];
    this.rooms = {};
    const indexs: any = Object.keys(this.game);
    for(let i: number = 0; i < this.game.length; i++)
    {
      this.game[indexs[i]].nb = i; 
    }
    this.id = this.game.length;
  }
}