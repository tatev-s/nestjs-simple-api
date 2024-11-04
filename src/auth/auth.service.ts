import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import type { UsersEntity } from 'users/users.entity';
import { UsersService } from 'users/users.service';
import { RegisterUserDto } from './dto/register-user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user.
   * @returns The newly created user.
   * @param createUserDto
   */
  async register(createUserDto: RegisterUserDto): Promise<UsersEntity> {
    const { password, email } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }
    try {
      return this.userService.create({
        ...createUserDto,
        password: hashedPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs in a user.
   * @param email User's email address.
   * @param password User's password.
   * @returns An object containing the user and the JWT token.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ user: Partial<UsersEntity>; token: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: userPassword, ...userRest } = user;
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user: userRest, token };
  }
}
