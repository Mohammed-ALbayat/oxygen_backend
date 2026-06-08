import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/users/enums/user-roles.enum';

export function generateToken(
  user: any,
  role: UserRole,
  jwtService: JwtService,
) {
  const payload = {
    sub: user.id,
    phone: user.phone,
    role: role,
  };

  return {
    access_token: jwtService.sign(payload),
    user: {
      id: user.id,
      phone: user.phone,
      role: role,
    },
  };
}
