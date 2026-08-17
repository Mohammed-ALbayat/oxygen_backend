import { ApiProperty } from '@nestjs/swagger';

export class CancellationReasonCountDto {
  @ApiProperty()
  reason: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ description: 'Share of all cancellations in the range' })
  percentage: number;
}

export class CancellationReportDto {
  @ApiProperty()
  totalCancelled: number;

  @ApiProperty({ type: CancellationReasonCountDto, isArray: true })
  topReasons: CancellationReasonCountDto[];
}
