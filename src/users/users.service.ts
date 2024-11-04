import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from './users.entity';
import { RegisterUserDto } from 'auth/dto/register-user';
import { UpdateUserDto } from './dto/update-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  /**
   * Retrieves the currently authenticated user by their ID.
   * @param id The user's ID.
   * @returns The user entity.
   * @throws NotFoundException if the user is not found.
   */
  async getUserById(id: number): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Retrieves all users.
   * @returns An array of user entities.
   */
  async getAllUsers(): Promise<UsersEntity[]> {
    return await this.usersRepository.find();
  }

  /**
   * Updates a user's information.
   * @param id The ID of the user to update.
   * @param updateData The data to update.
   * @returns The updated user entity.
   * @throws NotFoundException if the user is not found.
   */
  async updateUser(
    id: number,
    updateData: Partial<UpdateUserDto>,
  ): Promise<UsersEntity> {
    const user = await this.getUserById(id);
    Object.assign(user, updateData);
    return await this.usersRepository.save(user);
  }

  /**
   * Deletes a user by their ID.
   * @param id The ID of the user to delete.
   * @throws NotFoundException if the user is not found.
   */
  async deleteUser(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  /**
   * Create a new user and store in the database.
   * @param createUserDto The user data to create.
   */
  async create(createUserDto: RegisterUserDto): Promise<UsersEntity> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  /**
   * Find user by email.
   * @param email The email to find.
   */
  async findByEmail(email: string): Promise<UsersEntity | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }
}
