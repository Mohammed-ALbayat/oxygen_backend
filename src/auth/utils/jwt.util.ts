import { JwtService } from '@nestjs/jwt';

export function generateToken(
  user: any,
  role: string,
  jwtService: JwtService,
) {
  const payload = {
    sub: user.id,
    phone: user.phone,
    role,
  };

  return {
    access_token: jwtService.sign(payload),
    user: {
      id: user.id,
      phone: user.phone,
      role,
    },
  };
}