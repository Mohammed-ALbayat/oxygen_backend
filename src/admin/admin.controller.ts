import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ApiEndpoint } from 'src/common/swagger/api-endpoint.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { AdminMeResponseDto } from './dto/admin-me-response.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('me')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: AdminMeResponseDto })
  @ApiEndpoint('Get current admin profile and account details', [
    UserRole.ADMIN,
  ])
  getMe(@CurrentUser() user: User): Promise<AdminMeResponseDto> {
    return this.adminService.getMe(user);
  }
}
