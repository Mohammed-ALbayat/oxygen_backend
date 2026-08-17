import { ApiProperty } from '@nestjs/swagger';

export class DepartmentRevenueDto {
  @ApiProperty()
  departmentId: number;

  @ApiProperty()
  title: string | null;

  @ApiProperty()
  revenue: number;
}

export class RevenueReportDto {
  @ApiProperty({ description: 'Deposits plus full fees, minus refunds' })
  totalRevenue: number;

  @ApiProperty()
  depositRevenue: number;

  @ApiProperty()
  fullFeeRevenue: number;

  @ApiProperty({ description: 'Total amount refunded in the range' })
  refunds: number;

  @ApiProperty({ type: DepartmentRevenueDto, isArray: true })
  breakdownByDepartment: DepartmentRevenueDto[];
}
