import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @IsString()
  @ApiProperty()
  readonly password: string;
}
