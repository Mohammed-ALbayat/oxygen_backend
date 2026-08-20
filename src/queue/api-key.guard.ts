import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly i18n: I18nService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = process.env.QUEUE_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException(
        this.i18n.t('queue.INVALID_API_KEY'),
      );
    }

    return true;
  }
}
