import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';

const MAX_RANGE_DAYS = 366;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function validateDateRange(
  query: ReportDateRangeQueryDto,
  i18n: I18nService,
) {
  const from = new Date(query.from);
  const to = new Date(query.to);

  if (from > to) {
    throw new BadRequestException(i18n.t('reports.FROM_AFTER_TO'));
  }

  if ((to.getTime() - from.getTime()) / MS_PER_DAY > MAX_RANGE_DAYS) {
    throw new BadRequestException(i18n.t('reports.RANGE_EXCEEDS_ONE_YEAR'));
  }
}
