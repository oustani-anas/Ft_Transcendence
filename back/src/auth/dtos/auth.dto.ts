import { IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsString, MaxLength, MinLength, min } from "class-validator";

export class AuthDto{
    @IsString()
    id: string;
    
    @IsString()
    username: string;

    @IsString()
    avatar: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsBoolean()
    twoFactorAuthEnabled: boolean;

    //@IsString()
    //twoFactorAuthCode: string;
}

export class code{
    @IsNumberString()
    @IsNotEmpty()
    @MaxLength(6)
    @MinLength(6)
    code: string;
}