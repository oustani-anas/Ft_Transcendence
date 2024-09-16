// import { Injectable, ExecutionContext } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class FortyTwoAuthGuard extends AuthGuard('42') {
//   canActivate(context: ExecutionContext) {
//     return super.canActivate(context);
//   }
// }
// import { Injectable, ExecutionContext, BadRequestException } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { ExtractJwt } from 'passport-jwt';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class FortyTwoAuthGuard extends AuthGuard('jwt') {
//   // constructor(private jwt: JwtService) {}
//   canActivate(context: ExecutionContext) {
//     const request = context.switchToHttp().getRequest();
//     const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    
//     if (!this.validateToken(token)) {
//       throw new BadRequestException('Invalid Token');
//     }
//     // Assuming you have a JWT validation service or function
//     // const isValid = this.validateToken(token, );

//     return true;
//   }

//   private async validateToken(token: string): Promise<boolean> {
//     let jwt = new JwtService;

//     try {
//       const payload = await jwt.verifyAsync(token, {
//         secret: 'dontTellAnyone'
//       })
//       console.log(`>>>>> ${JSON.stringify(payload)}`)
//       if(payload) {
//         return true
//       }
//       return false; 
//     }
//     catch (error) {
//       console.log(error.message)
//       return false
//     }
//   }
// }
