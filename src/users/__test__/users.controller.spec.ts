import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'users/users.controller';
import { UsersService } from 'users/users.service';
import { UsersEntity } from 'users/users.entity';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { UpdateUserDto } from 'users/dto/update-user';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: UsersEntity = {
    id: 1,
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    password: 'hashed_password',
    tasks: [],
  };

  const mockUsersService = {
    getUserById: jest.fn(),
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mocking JwtAuthGuard
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return the currently authenticated user', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockRequest);
      expect(result).toEqual(mockUser);
      expect(service.getUserById).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(service.getUserById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUser', () => {
    it('should update and return the updated user entity', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastname',
      };
      const updatedUser = { ...mockUser, ...updateData };
      mockUsersService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateUser(1, updateData);
      expect(result).toEqual(updatedUser);
      expect(service.updateUser).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw a NotFoundException if the user to update is not found', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastname',
      };
      mockUsersService.updateUser.mockRejectedValue(new NotFoundException());

      await expect(controller.updateUser(99, updateData)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.updateUser).toHaveBeenCalledWith(99, updateData);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      mockUsersService.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser(1);
      expect(result).toBeUndefined();
      expect(service.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should throw a NotFoundException if the user to delete is not found', async () => {
      mockUsersService.deleteUser.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteUser(99)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.deleteUser).toHaveBeenCalledWith(99);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of all users', async () => {
      mockUsersService.getAllUsers.mockResolvedValue([mockUser]);

      const result = await controller.getAllUsers();
      expect(result).toEqual([mockUser]);
      expect(service.getAllUsers).toHaveBeenCalled();
    });
  });
});
