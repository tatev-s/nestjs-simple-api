import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/auth.service';
import { RegisterUserDto } from 'auth/dto/register-user';
import { LoginUserDto } from 'auth/dto/login-user';
import { UsersEntity } from 'users/users.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUser: Partial<UsersEntity> = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockUser),
    login: jest.fn().mockResolvedValue({
      user: mockUser,
      token: 'jwt_token',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerUserDto: RegisterUserDto = {
        email: 'john@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await authController.register(registerUserDto);

      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(registerUserDto);
    });
  });

  describe('login', () => {
    it('should log in a user and return JWT token and user data', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password',
      };

      const result = await authController.login(loginUserDto);

      expect(result).toEqual({
        user: mockUser,
        token: 'jwt_token',
      });
      expect(authService.login).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
    });
  });
});
