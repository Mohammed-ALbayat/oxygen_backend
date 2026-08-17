import { ApiProperty } from '@nestjs/swagger';

export class DepartmentWaitingTimeDto {
  @ApiProperty()
  departmentId: number;

  @ApiProperty()
  departmentName: string | null;

  @ApiProperty()
  avgWaitingSeconds: number;

  @ApiProperty()
  avgWaitingMinutes: number;

  @ApiProperty({ description: 'Number of appointments with a measured wait' })
  sampleSize: number;
}

export class WaitingTimeReportDto {
  @ApiProperty()
  overallAverageSeconds: number;

  @ApiProperty()
  overallAverageMinutes: number;

  @ApiProperty()
  sampleSize: number;

  @ApiProperty({ type: DepartmentWaitingTimeDto, isArray: true })
  byDepartment: DepartmentWaitingTimeDto[];
}
