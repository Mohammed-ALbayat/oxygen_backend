import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from './enums/user-roles.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';

@ApiTags('Users Admin')
@ApiBearerAuth()
@Controller('users/admin')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Delete(':id')
  @ApiEndpoint('Permanently delete a user by id', [UserRole.ADMIN])
  delete(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Put(':id/block')
  @ApiEndpoint('Block a user account by id', [UserRole.ADMIN])
  block(@Param('id') id: number) {
    return this.usersService.blockUser(id);
  }

  @Put(':id/unblock')
  @ApiEndpoint('Unblock a previously blocked user by id', [UserRole.ADMIN])
  unblock(@Param('id') id: number) {
    return this.usersService.unblockUser(id);
  }

  @Put(':id/toggle')
  @ApiEndpoint('Toggle user active/inactive status by id', [UserRole.ADMIN])
  toggleStatus(@Param('id') id: number) {
    return this.usersService.togglestatus(id);
  }

  @Put(':id/reset-password')
  @ApiEndpoint('Reset a user password by admin', [UserRole.ADMIN])
  resetPassword(
    @Param('id') id: number,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiEndpoint('Search and list users with optional filters', [UserRole.ADMIN])
  search(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query() filters: { full_name?: string; phone?: string; role?: string },
  ) {
    return this.usersService.findAll(page, limit, filters);
  }
}
