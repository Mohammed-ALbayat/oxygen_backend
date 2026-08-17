import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class ReportDateRangeQueryDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  from: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  to: string;

  @ApiPropertyOptional({ description: 'Filter by department (specialty) id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departmentId?: number;
}
