
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { PrismaService } from "src/prisma.service";
import { AuthService } from "../auth.service";
import { AuthDto } from "../dtos/auth.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async authenticate(request: any, options?: any): Promise<any> {
    if (request.query && request.query.error === 'access_denied') {
      return request.res.redirect('http://localhost:3000'); // Handle access denial gracefully
    }
    return super.authenticate(request, options);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;

      // Create an AuthDto object based on the profile info
      const dto: AuthDto = {
        id: id,
        avatar: photos[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        twoFactorAuthEnabled: false,
        username: null // Can be set to false initially, adjust based on your requirements
      };

      // Find or create the user in the database
      const user = await this.authService.findOrCreate(dto);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if(!user.username) {
        return done(null, user, {message: 'redirect to set username'});
      }

      // Return the user data
      done(null, user);
    } catch (error) {
      console.error('Error in Google authentication:', error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
}
