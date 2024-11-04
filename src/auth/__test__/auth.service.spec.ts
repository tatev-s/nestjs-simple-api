// auth.service.spec.ts

import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { RegisterUserDto } from '../dto/register-user';
import { UsersEntity } from '../../users/users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMocked<UsersService>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'john@example.com',
    password: 'password',
    firstName: 'john',
    lastName: 'silver',
    isActive: true,
    tasks: [],
  };
  const { password: mockedUserPassword, ...userWithoutPassword } = mockUser;
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .useMocker(createMock)
      .compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    beforeEach(() => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      usersService.findByEmail.mockResolvedValue(mockUser);
    });

    it('should validate user and return JWT', async () => {
      const userPassword = 'newPassword';
      const jwt = await service.login(mockUser.email, userPassword);

      expect(jwt).toStrictEqual({
        token: 'jwt_token',
        user: userWithoutPassword,
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        userPassword,
        mockedUserPassword,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException if the password is invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(
        service.login(mockUser.email, 'invalidPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login(mockUser.email, 'wrong_password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('registration', () => {
    const user: RegisterUserDto = {
      email: 'jane@example.com',
      password: 'password',
      firstName: 'jane',
      lastName: 'wood',
    };
    it('should throw error if user with provided email already exists', async () => {
      try {
        await service.register(user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Email is already in use');
      }
    });
    it('should register a new user', async () => {
      const hash = 'someHashedKey';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hash);
      const createdUser: UsersEntity = {
        ...user,
        id: 5,
        isActive: true,
        tasks: [],
        password: hash,
      };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValueOnce(createdUser);

      const newUser = await service.register(user);
      expect(newUser).toStrictEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith({
        ...user,
        password: hash,
      });
    });
  });
});
