import { Controller, Post, Body } from '@nestjs/common';
import { UsersEntity } from 'users/users.entity';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user';
import { LoginUserDto } from './dto/login-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: RegisterUserDto): Promise<UsersEntity> {
    return await this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ user: Partial<UsersEntity>; token: string }> {
    const { email, password } = loginUserDto;
    return await this.authService.login(email, password);
  }
}
