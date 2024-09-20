
import {
  Controller,
  Get,
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
import * as qrcode from "qrcode";
import { log } from "console";
import { code } from "./dtos/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  // google auth
  
  @Get("google")
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    console.log("inside the giard");
    // Guard will handle the redirect
  }

  // Google redirect handler
  /*@Get("google/redirect")
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    console.log("the user data i get from : ");
    console.log(req.user);
    const payload = { sub: req.user.email }; // Or use req.user.id if you save the user in the database
    const token = await this.jwtService.signAsync(payload);
    
    res.cookie("JWT_TOKEN", token);
    return res.redirect(`${process.env.CLIENT_URL}/Profile`);
    }*/
   
   @Get('google/redirect')
   @UseGuards(AuthGuard('google'))
   async googleRedirect(@Req() req, @Res() res) {
     const user = req.user;
     
     if (!user.username) {
       return res.redirect(`${process.env.CLIENT_URL}/set-username`);
       }
       
       // User has a username, proceed with authentication
  const payload = { sub: req.user.email }; // Or use req.user.id if you save the user in the database
  const token = await this.jwtService.signAsync({ sub: user.id });
  res.cookie('JWT_TOKEN', token);
  return res.redirect(`${process.env.CLIENT_URL}/Profile`);
}


@Post('set-username')
@UseGuards(AuthGuard('jwt'))
async setUsername(@Req() req, @Res() res, @Body('username') username: string) {
  console.log("amas n setuserrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
  const userId = req.user.id;

  // Check if the username is already taken
  const existingUser = await this.prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  // Update user with the new username
  await this.prisma.user.update({
    where: { id: userId },
    data: { username },
  });

  return res.json({ message: 'Username set successfully' });
}

  
  // end of google block auth
  
  @Get("42")
  @UseGuards(AuthGuard("42"))
  login() {}

  @Get("redirect")
  @UseGuards(AuthGuard("42"))
  async ft_redirect(@Req() req, @Res() res) {
    //console.log("youwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwt awa");
    const payload = { sub: req.user.id };
    if (req.user.firstLogin) {
      const token = await this.jwtService.signAsync(payload);
      res.cookie("JWT_TOKEN", token);
      await this.prisma.user.update({
        where: { id: req.user.id },
        data: { firstLogin: false },
      });
      return res.redirect(`${process.env.CLIENT_URL}/Settings`);
    } else if (req.user.twoFactorAuthEnabled) {
      res.cookie("USER_ID", req.user.id);
      return res.redirect(`${process.env.CLIENT_URL}/QRcode`);
    }
    const token = await this.jwtService.signAsync(payload);
    res.cookie("JWT_TOKEN", token);
    return res.redirect(`${process.env.CLIENT_URL}/Profile`);
  }

  @Get("logout")
  @UseGuards(AuthGuard("jwt"))
  async ft_logout(@Res() res) {
    
    
    res.clearCookie("JWT_TOKEN");
    res.status(200).json({ redirect: `${process.env.CLIENT_URL}` });
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
