import { IsString, IsOptional, IsIn, ArrayUnique, IsArray, isNotEmpty, IsNotEmpty, Length, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChatChannelDTO {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  @Transform(({ value }) => value.trim())
  name: string;
  
  @IsString()
  @IsNotEmpty()
  avatar: string;
  
  @IsString()
  @IsNotEmpty()
  @IsIn(['Public', 'Private', 'Protected'])
  status: 'Public' | 'Private' | 'Protected';

  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsOptional()
  @IsIn(['DM', ''])
  type?: 'DM' | '';

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Transform(({ value }) => value.split(',').map((id: string) => id.trim()))
  members?: string[];

  @ValidateIf(o => o.status === 'Protected')
  @IsString()
  @IsNotEmpty()
  @Length(4, 16)
  password?: string;
}


export class ChangeToProtected {
  
  @IsString()
  @IsNotEmpty()
  roomId: string;
  
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 16)
  password: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ChangeProtectedChannelPassword {
  
  @IsString()
  @IsNotEmpty()
  roomId: string;
  
  @IsString()
  @IsNotEmpty()
  @Length(4, 16)
  password: string;
}
