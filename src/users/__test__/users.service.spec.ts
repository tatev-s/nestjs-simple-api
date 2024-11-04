import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'users/users.service';
import { UsersEntity } from 'users/users.entity';
import { NotFoundException } from '@nestjs/common';
import { RegisterUserDto } from 'auth/dto/register-user';
import { UpdateUserDto } from 'users/dto/update-user';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<UsersEntity>;

  const mockUser = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      mockUsersRepository.find.mockResolvedValue([mockUser]);
      const result = await service.getAllUsers();
      expect(result).toEqual([mockUser]);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createUserDto: RegisterUserDto = {
        email: 'jane@example.com',
        password: 'password',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const newUser = { ...mockUser, email: 'jane@example.com' };
      mockUsersRepository.create.mockReturnValue(newUser);
      mockUsersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(newUser);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: Partial<UpdateUserDto> = {
        firstName: 'UpdatedJohn',
      };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        firstName: 'UpdatedJohn',
      });

      const result = await service.updateUser(1, updateUserDto);
      expect(result.firstName).toBe('UpdatedJohn');
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found during update', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      const updateUserDto: Partial<UpdateUserDto> = {
        firstName: 'UpdatedJohn',
      };

      await expect(service.updateUser(1, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteUser(1);
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if no user was deleted', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        select: ['id', 'email', 'password'],
      });
    });
  });
});
