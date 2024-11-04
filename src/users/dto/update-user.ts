import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsString()
  @ApiProperty()
  readonly firstName: string;

  @IsString()
  @ApiProperty()
  readonly lastName: string;
}
