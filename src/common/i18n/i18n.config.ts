import { join } from 'path';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

export const i18nModule = I18nModule.forRoot({
  fallbackLanguage: 'ar',
  loaderOptions: {
    path: join(__dirname, '../../i18n/'),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    new HeaderResolver(['x-lang']),
    AcceptLanguageResolver,
  ],
});
