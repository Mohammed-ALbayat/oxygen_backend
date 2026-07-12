import { PartialType, PickType } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto';

export class UpdateVisitDto extends PartialType(
  PickType(CreateVisitDto, ['diagnosis', 'medicals', 'suggestions'] as const),
) {}
