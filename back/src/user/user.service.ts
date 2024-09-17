import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) { }
  private userSocketMap: { [userId: string]: any } = {};

  async addUserSocket(userId: string, socket: Socket) {
    if (this.userSocketMap[userId])
      this.userSocketMap[userId].push(socket);
    else
      this.userSocketMap[userId] = [socket];
    this.updateProfile("Online", userId);
    this.eventEmitter.emit("refreshStatus")
  }

  async removeUserSocket(userId: string, socket: Socket) {
    if (this.userSocketMap[userId]) {
      this.userSocketMap[userId] = this.userSocketMap[userId].filter((s: any) => s !== socket);
      if (this.userSocketMap[userId].length === 0) {
        this.updateProfile("Offline", userId);
        this.eventEmitter.emit('refreshStatus', "lkhwa", "logOut", this.userSocketMap[userId]);
      }
    }
  }

  async getUser(target: string) {
    return this.prisma.user.findUnique({
      where: { id: target }
    });
  }

  async updateProfile(status: string, userId: string) {
    if (!await this.getUser(userId)) return;
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: status }
    })
  }

  async userNameCheck(name: string) {
    return this.prisma.user.count({
      where: { username: name }
    });
  }


  async createFriendRequest(target: string, sender: string) {
    return this.prisma.friendRequest.create({
      data: {
        senderId: sender,
        receiverId: target,
        status: "Pending"
      },
    });
  }

  async createPlayRequest(target: string, sender: string) {
    return this.prisma.inviteToPlay.create({
      data: {
        senderId: sender,
        receiverId: target,
        status: "Pending"
      },
    });
  }

  async isAlreadySent(target: string, sender: string) {
    return this.prisma.friendRequest.count({
      where: { receiverId: target, senderId: sender },
    });
  }

  async getMyNotifications(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getInviteToPlay(userId: string) {
    return this.prisma.inviteToPlay.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: true,
        receiver: true
      }
    });
  }

  async isRequestExistAndPending(notifId: string, myId: string) {
    return this.prisma.friendRequest.count({
      where: {
        id: notifId,
        status: "Pending",
        OR: [
          { receiverId: myId },
          { senderId: myId }
        ]
      },
    });
  }

  async isRequestExistAndPendingToPlay(notifId: string, myId: string) {
    return this.prisma.inviteToPlay.count({
      where: {
        id: notifId,
        status: "Pending",
        receiverId: myId
      },
    });
  }

  async isRequestExist(myId: string, receiverId: string) {
    return this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { receiverId: receiverId, senderId: myId, },
          { receiverId: myId, senderId: receiverId, }
        ]
      },
    });
  }

  async deletePlayRequest(myId: string) {
    return this.prisma.inviteToPlay.deleteMany({
      where: {
          senderId: myId
      },
    });
  }

  async isPlayRequest(myId: string) {
    return this.prisma.inviteToPlay.findFirst({
      where: {
          senderId: myId, 
      },
    });
  }

  async pendFriendRequest(notifId: string, sender: string, target: string) {

    return this.prisma.friendRequest.update({
      where: { id: notifId },
      data: {
        senderId: sender,
        receiverId: target,
        status: "Pending"
      }
    });
  }

  async pendPlayRequest(notifId: string, sender: string, target: string) {

    return this.prisma.inviteToPlay.update({
      where: { id: notifId },
      data: {
        senderId: sender,
        receiverId: target,
        status: "Pending"
      }
    });
  }

  async acceptFriendRequest(notifId: string) {

    return this.prisma.friendRequest.update({
      where: { id: notifId },
      data: {
        status: "Accepted",
      }
    });
  }

  async declineFriendRequest(notifId: string) {

    return this.prisma.friendRequest.update({
      where: { id: notifId },
      data: {
        status: "Declined"
      }
    });
  }
  async acceptInviteToPlay(notifId: string) {

    return this.prisma.inviteToPlay.update({
      where: { id: notifId },
      data: {
        status: "Accepted"
      }
    });
  }

  async declineInviteToPlay(notifId: string) {

    return this.prisma.inviteToPlay.update({
      where: { id: notifId },
      data: {
        status: "Declined"
      }
    });
  }

  async makeFriends1(myId: string, senderId: string) {
    return this.prisma.user.update({
      where: { id: myId },
      data: {
        friends: {
          connect: {
            id: senderId,
          }
        }
      }
    })
  }

  async makeFriends2(myId: string, senderId: string) {
    return this.prisma.user.update({
      where: { id: senderId },
      data: {
        friends: {
          connect: {
            id: myId,
          }
        }
      }
    })
  }

  async checkIfFriend(myId: string, otherUser: string) {
    return this.prisma.user.count({
      where: {
        id: myId,
        friends: {
          some: {
            id: otherUser
          }
        }
      }
    });
  }



  async removeFriendRequest(requestId: string) {

    return this.prisma.friendRequest.delete({
      where: { id: requestId }
    });
  }


  async removeFriendShip1(userId: string, otherUser: string) {

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          disconnect: {
            id: otherUser,
          }
        }
      }
    });
  }
  async removeFriendShip2(userId: string, otherUser: string) {

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          disconnect: {
            id: otherUser,
          }
        }
      }
    });
  }

  async blockedUsers(myId: string, targetId: string) {
    return this.prisma.user.update({
      where: { id: myId },
      data: {
        blockedUsers: {
          push: targetId
        }
      }
    });
  }

  async blockedByUsers(myId: string, targetId: string) {
    return this.prisma.user.update({
      where: { id: targetId },
      data: {
        blockedByUsers: {
          push: myId
        }
      }
    });
  }

  async getIsBlocked(myId: string, targetId: string) {
    return this.prisma.user.count({
      where: { id: myId, blockedUsers: { has: targetId } },
    });
  }

  async getIsBlockedBy(myId: string, targetId: string) {
    return this.prisma.user.count({
      where: { id: targetId, blockedByUsers: { has: myId } },
    });
  }


  async unblockBlockedUsers(myId: string, targetId: string) {

    const myData = await this.getUser(myId);

    const userIndex = myData.blockedUsers.findIndex((blockedUser) => blockedUser == targetId);
    if (userIndex === -1) return;

    const newBlockedList = myData.blockedUsers.filter((user: string) => user != targetId);

    return this.prisma.user.update({
      where: { id: myId },
      data: {
        blockedUsers: newBlockedList
      }
    });
  }

  async removekBlockedByUsers(myId: string, targetId: string) {

    const myData = await this.getUser(targetId);

    const userIndex = myData.blockedByUsers.findIndex((blockedBy) => blockedBy == myId);
    if (userIndex === -1) return;

    const newBlockedByList = myData.blockedByUsers.filter((user: string) => user != myId);


    return this.prisma.user.update({
      where: { id: targetId },
      data: {
        blockedByUsers: newBlockedByList
      }
    });
  }

  async friendList(myId: any) {
    if (myId === 'undifined') return;

    const user = await this.prisma.user.findUnique({
      where:
      {
        id: myId
      },
      include:
      {
        friends: true
      }
    });
    if (!user) return;

    return user.friends;

  }

  async blocklist(myId: string) {
    return this.prisma.user.findUnique({
      where: { id: myId },
      // include:[bl]
    });
  }

  async getGameResult(myId: string) {

    return this.prisma.gameResult.findMany({
      where: {
        OR: [
          { userId: myId },
          { opponentId: myId }
        ]
      },
      include: {
        user: true,
      }
    });
  }


  async getAchievements(myId: string, achievement: string) {
    const existingRecord = await this.prisma.achievement.findFirst({
      where: {
        userId: myId
      },
    });

    if (!existingRecord) return;

    return this.prisma.achievement.updateMany({
      where: { id: existingRecord.id },
      data: {
        [achievement]: true
      }
    });
  }



  async getAllAchievements(myId: string) {
    return this.prisma.achievement.findFirst({
      where: { userId: myId }
    });
  }
























}
