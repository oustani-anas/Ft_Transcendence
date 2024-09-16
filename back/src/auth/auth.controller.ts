import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import speakeasy from "speakeasy";
// import { authenticator } from 'otplib';
import * as qrcode from "qrcode";
import { log } from "console";
import { UserDto } from "src/user/user.dto";
import { AuthDto, code } from "./dtos/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  @Get("42")
  @UseGuards(AuthGuard("42"))
  login() {}

  @Get("redirect")
  @UseGuards(AuthGuard("42"))
  async ft_redirect(@Req() req, @Res() res) {
    const payload = { sub: req.user.id };
    if (req.user.firstLogin) {
      const token = await this.jwtService.signAsync(payload);
      res.cookie("JWT_TOKEN", token);
      await this.prisma.user.update({
        where: { id: req.user.id },
        data: { firstLogin: false },
      });
      return res.redirect("http://localhost:3000/Settings");
    } else if (req.user.twoFactorAuthEnabled) {
      res.cookie("USER_ID", req.user.id);
      return res.redirect("http://localhost:3000/QRcode");
    }
    const token = await this.jwtService.signAsync(payload);
    res.cookie("JWT_TOKEN", token);
    return res.redirect("http://localhost:3000/Profile");
  }

  @Get("logout")
  @UseGuards(AuthGuard("jwt"))
  async ft_logout(@Res() res) {
    
    console.log("logout", res.req.user);
    
    res.clearCookie("JWT_TOKEN");
    res.status(200).json({ redirect: "http://localhost:3000" });
  }

  @Post("generateTwoFactorAuthCode")
  @UseGuards(AuthGuard("jwt"))
  async generateTwoFactorAuthCode(@Req() req: any, @Res() res: any) {
    const user = req.user;
    if (!user.twoFactorAuthCode){
      user.twoFactorAuthCode = speakeasy.generateSecret();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorAuthCode: user.twoFactorAuthCode.base32 },
    });
  }

  if (user.twoFactorAuthCode) {
    const otpauthUrl = speakeasy.otpauthURL({
      secret: user.twoFactorAuthCode,
      label: "MyApp",
      issuer: "MyCompany",
      encoding: "base32",
    });
    const qrCodeImageUrl = await qrcode.toDataURL(otpauthUrl);
    return res.json({ qrCodeImageUrl });
  }
}

  @Post("verifyTwoFactorAuthCode")
  async verifyTwoFactorAuthCode(
    @Req() req,
    @Res() res,
    @Body() code: code
  ) {
    console.log("req.cookies.USER_ID", req.cookies.USER_ID);
    console.log("req.cookies.USER_ID-----------", req.cookies);
    // console.log("req.cookies.USER_ID------------============", req);
    //const user = req.user;
    const user = await this.prisma.user.findFirst({
      where: { id: req.cookies.USER_ID },
    });
    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorAuthCode,
      encoding: "base32",
      token: code.code,
    });
    


    log("isVerified", isVerified);
    if (isVerified) {
      const payload = { sub: req.cookies.USER_ID };
      const token = await this.jwtService.signAsync(payload);
      res.cookie("JWT_TOKEN", token);
      return res.json({ message: "User is verified" });
    } else {
      return res.status(400).json({ message: "Invalid token" });
    }
  }


  // if(user.twoFactorAuthEnabled){
  //     return res.json({status: true, message: 'Two-factor authentication is already enabled' });
  // }
  // const isVerified = speakeasy.totp.verify({
  //     secret: user.twoFactorAuthCode,
  //     encoding: 'base32',
  //     token: body.code,
  // });
  // if (isVerified) {
  //     await this.prisma.user.update({ where: { id: user.id }, data: { twoFactorAuthEnabled: true } });
  //     return res.json({status: true, message: 'Two-factor authentication is enabled' });
  // } else {
  //     return res.json({status: false, message: 'invalide code' });
  // }
  
  @Post("enableTwoFactorAuth")
  @UseGuards(AuthGuard("jwt"))
  async enableTwoFactorAuth(
    @Req() req,
    @Res() res,
    @Body() body: code
  ) {
    const user = req.user;

    log("userMosaaaaaaaaaaapahah", user);
    if (user.twoFactorAuthEnabled) {
      return res.json({
        status: true,
        message: "Two-factor authentication is already enabled",
      });
    }
    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorAuthCode,
      encoding: "base32",
      token: body.code,
    });
    if (isVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorAuthEnabled: true },
      });
      return res.json({
        status: true,
        message: "Two-factor authentication is enabled",
      });
    } else {
      // return res.json({status: false, message: 'invalide code' });
      return res.status(400).json();
    }
  }


  @Post("disableTwoFactorAuth")
  @UseGuards(AuthGuard("jwt"))
  async disableTwoFactorAuth(@Req() req, @Res() res) {
    const user = req.user;
    if (!user.twoFactorAuthEnabled) {
      return res.json({
        message: "Two-factor authentication is already disabled",
      });
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorAuthEnabled: false },
    });
    return res.json({ message: "Two-factor authentication is disabled" });
  }
}

// @Controller("users")
// export class userController {
//   constructor(private readonly prismaService: PrismaService) {}

//   @Get(":username")
//   @UseGuards(AuthGuard("jwt"))
//   async getUser(@Param("username") username: string) {
//     const user = await this.prismaService.userExists(username);
//     return user;
//   }
// }



