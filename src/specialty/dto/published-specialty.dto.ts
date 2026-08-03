import { ApiProperty } from '@nestjs/swagger';

export class PublishedSpecialtyDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;
}
