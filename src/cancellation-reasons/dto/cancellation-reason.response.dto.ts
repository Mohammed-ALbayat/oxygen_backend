import { ApiProperty } from '@nestjs/swagger';

export class CancellationReasonDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  is_active: boolean;
}
