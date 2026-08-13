import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = process.env.QUEUE_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException(
        'API Key غير صالح أو مفقود. وصول غير مصرح به لشاشة الطابور.',
      );
    }

    return true;
  }
}
