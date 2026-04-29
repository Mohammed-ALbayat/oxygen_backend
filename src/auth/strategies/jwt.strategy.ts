import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // استخراج التوكن من الـ Header كـ Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // رفض التوكن إذا انتهى وقته
      secretOrKey: jwtConstants.secret, // نفس المفتاح السري الذي وقعنا به
    });
  }

  // هذه الدالة تعمل تلقائياً بعد التأكد من صحة التوكن
  async validate(payload: any) {
    // ما نرجعه هنا سيتم وضعه داخل كائن الـ Request (req.user)
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}