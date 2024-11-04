import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UsersEntity } from './users.entity';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user details.
   * @returns The currently authenticated user entity.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req): Promise<UsersEntity> {
    return await this.usersService.getUserById(req.user.id); // Assumes req.user contains the user
  }

  /**
   * Get a user by their ID.
   * @param id The user's ID.
   * @returns The user entity.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<UsersEntity> {
    return await this.usersService.getUserById(id);
  }

  /**
   * Update a user by their ID.
   * @param id The user's ID.
   * @param updateData The data to update.
   * @returns The updated user entity.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateData: UpdateUserDto,
  ): Promise<UsersEntity> {
    return await this.usersService.updateUser(id, updateData);
  }

  /**
   * Delete a user by their ID.
   * @param id The user's ID.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return await this.usersService.deleteUser(id);
  }

  /**
   * Get all users.
   * @returns A list of all users.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<UsersEntity[]> {
    return await this.usersService.getAllUsers();
  }
}
