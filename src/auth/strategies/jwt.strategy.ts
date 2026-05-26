import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {
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
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) return null;

    if (user.token_version !== payload.tv) {
      return null; // token قديم
    }

    return user;
    // return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}