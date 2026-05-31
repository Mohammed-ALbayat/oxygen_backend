import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from './entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { Query } from '@nestjs/common';

@Controller('users/admin')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Put(':id/block')
  @Roles(UserRole.ADMIN)
  block(@Param('id') id: number) {
    return this.usersService.blockUser(id);
  }

  @Put(':id/unblock')
  @Roles(UserRole.ADMIN)
  unblock(@Param('id') id: number) {
    return this.usersService.unblockUser(id);
  }

  @Put(':id/toggle')
  @Roles(UserRole.ADMIN)
  toggleStatus(@Param('id') id: number) {
    return this.usersService.togglestatus(id);
  }

  @Put(':id/reset-password')
  @Roles(UserRole.ADMIN)
  resetPassword(
    @Param('id') id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  search(@Query() query: any) {
    return this.usersService.findAll(query);
  }
}
