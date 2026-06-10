import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';

export function generateToken(
  user: User,
  role: UserRole,
  jwtService: JwtService,
) {
  const payload = {
    sub: user.id,
    phone: user.phone,
    role: role,
  };

  return jwtService.sign(payload);
}
