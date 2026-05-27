import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/users/entities/user.entity';

export function generateToken(
  user: any,
  role: UserRole,
  jwtService: JwtService,
) {
  const payload = {
    sub: user.id,
    phone: user.phone,
    role: role,
    tv: user.token_version,
  };

  return {
    access_token: jwtService.sign(payload),
    user: {
      id: user.id,
      phone: user.phone,
      role: role,
    },
  };

//private generateToken(user: any, role: UserRole) {
  //   const payload = {
  //     sub: user.id,
  //     phone: user.phone,
  //     role: role,
  //     tv: user.token_version,
  //   };

  //   return {
  //     access_token: this.jwtService.sign(payload),
  //     user: {
  //       id: user.id,
  //       full_name: user.full_name,
  //       role: role,
  //     },
  //   };
  // }
}