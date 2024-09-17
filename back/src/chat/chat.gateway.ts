import { SubscribeMessage, WebSocketGateway, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { OnEvent } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { verify } from "jsonwebtoken";

@WebSocketGateway(
  {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  }
)

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) { }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: any) {
    try {
      
      verify(payload.token, `${process.env.SECRET_KEY}`);
      const roomData = await this.chatService.getRoom(payload.roomId);
      if (!roomData) return;
      
      const user = await this.chatService.getUser(payload.userId);
      if (!user) return;
  
  
      if (await this.chatService.checkIfBanned(payload.userId, payload.roomId) === 1) return
      if (await this.chatService.checkIfMuted(payload.userId, payload.roomId) === 1) return
  
      await this.chatService.addMessagesToRoom(payload);
      const message = await this.chatService.getGroupMessages(payload.roomId);
      this.server.to(payload.roomId).emit('getAllMessages', message, payload.roomId);
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('joinGroupChat')
  async handleJoiningGroupChat(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      if (await this.chatService.checkIfBanned(payload.userId, payload.groupId) === 1) {
        client.emit("banned", `You are banned on that channel`);
        return;
      }
      if (await this.chatService.checkIfMember(payload.userId, payload.groupId) === 1) {
        client.emit("alreadyJoined", `You are already on that channel`);
        return;
      }
      
      const groupData = await this.chatService.getRoom(payload.groupId);
      if (payload.password && !await bcrypt.compare(payload.password, groupData.password)) {
        client.emit("joinFailed", "Wrong Password");
        return;
      }
      await this.chatService.addRoomToUser(payload.userId, payload.groupId)
      await this.chatService.addUserToRoom(payload.userId, payload.groupId)
  
      client.join(payload.groupId);
      client.emit("joinSuccessfull", `You Joined ${payload.roomName}`);
      this.server.emit("refresh");
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('kick')
  async kick(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      payload.message = `announcement ${payload.username} has kicked ${payload.target_username} from this room`
      if (await this.chatService.kickUserFromRoom(payload.target, payload.roomId) === -1) return
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit("refresh");
      const roomData = await this.chatService.getRoom(payload.roomId);
      client.to(payload.roomId).emit("redirectToChatPage", payload.target, roomData.name, payload.roomId, "kicked");
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('mute')
  async Mute(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      payload.message = `announcement ${payload.username} has muted ${payload.target_username}`
      const timestampIn60Seconds = new Date();
      timestampIn60Seconds.setSeconds(timestampIn60Seconds.getSeconds() + 60);
      await this.chatService.MuteUserFromRoom(`${payload.target} ${timestampIn60Seconds.getTime()}`, payload.roomId)
      await this.handleSendMessage(client, payload)
  
      this.server.to(payload.roomId).emit("refresh");
    } catch (error) {
      return;
    }
    
  }

  @SubscribeMessage('ban')
  async Ban(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      payload.message = `announcement ${payload.username} has banned ${payload.target_username}`
      await this.chatService.banUserFromRoom(payload.target, payload.roomId)
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit("refresh");
      const roomData = await this.chatService.getRoom(payload.roomId);
      client.to(payload.roomId).emit("redirectToChatPage", payload.target, roomData.name, payload.roomId, "banned");
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('unmute')
  async Unmute(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      if (await this.chatService.checkIfMuted(payload.target, payload.roomId) !== 1){ 
        this.server.to(payload.roomId).emit("alreadyUnmuted", payload.userId);
        return;
      }
      payload.message = `announcement ${payload.username} has unmuted ${payload.target_username}`
      await this.chatService.UnmuteUserFromRoom(payload.target, payload.roomId)
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit("refresh");
    } catch (error) {
      return;
    }
    
  }

  @SubscribeMessage('makeAdmin')
  async makeAdmin(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      payload.message = `announcement ${payload.target_username} in now an admin on this room`
      await this.chatService.makeAdminOnRoom(payload.target, payload.roomId)
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit("refresh");
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('removeAdmin')
  async removeAdmin(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      payload.message = `announcement ${payload.target_username} in no longer an admin on this room`
      await this.chatService.removeAdminOnRoom(payload.target, payload.roomId)
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit("refresh");
    } catch (error) {
      return;
    }
  }


  @SubscribeMessage('setRoomToPublic')
  async setRoomToPublic(client: Socket, payload: any) {
    
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      const roomData = await this.chatService.getRoom(payload.roomId);
      if (!roomData) return;
      
      await this.chatService.setRoomToPublic(payload.roomId);
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit('refresh', "Public", roomData.name);
      this.server.emit('refreshJoinComp');
    } catch (error) {
      return;
    }
  }

  @OnEvent('setRoomToProtected')
  async setRoomToProtected(client: Socket, payload: any, roomName:string) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      const roomData = await this.chatService.getRoom(payload.roomId);
      if (!roomData) return;
      await this.handleSendMessage(client, payload)
      this.server.to(payload.roomId).emit('refresh', "Protected", roomName);
      this.server.emit('refreshJoinComp');
    } catch (error) {
      return;
    }
  }


  @OnEvent('changeRoomPassword')
  async changePassword() {
      this.server.emit('refreshJoinComp');
  }

  @SubscribeMessage('leave')
  async leave(client: Socket, payload: any) {
    try {
      verify(payload.token, `${process.env.SECRET_KEY}`);
      
      payload.message = `announcement ${payload.username} has left the room`
      await this.chatService.kickUserFromRoom(payload.userId, payload.roomId)
      await this.handleSendMessage(client, payload)
      this.server.emit('left');
    } catch (error) {
      return;
    }
  }

  @SubscribeMessage('addSocketToThisUserRoom')
  async addSocketToThisUserRoom(client: Socket, roomId: any) {
        client.join(roomId);
  }

  handleConnection(client: any) {
  }

  handleDisconnect(client: any) {
  }

}
