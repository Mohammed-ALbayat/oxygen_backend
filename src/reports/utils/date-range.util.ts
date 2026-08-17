import { BadRequestException } from '@nestjs/common';
import { ReportDateRangeQueryDto } from '../dto/report-date-range.query.dto';

const MAX_RANGE_DAYS = 366;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function validateDateRange(query: ReportDateRangeQueryDto) {
  const from = new Date(query.from);
  const to = new Date(query.to);

  if (from > to) {
    throw new BadRequestException('"from" must not be later than "to"');
  }

  if ((to.getTime() - from.getTime()) / MS_PER_DAY > MAX_RANGE_DAYS) {
    throw new BadRequestException('Report range cannot exceed one year');
  }
}
