import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum AmountType {
  COLLECTED = 'collected',
  DEPOSIT = 'deposit',
}

export class UpdateCollectedAmountDto {
  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  collectedAmount: number;

  @ApiPropertyOptional({
    enum: AmountType,
    default: AmountType.COLLECTED,
    description:
      'Where to store the amount. Use deposit when the patient paid a deposit; collected otherwise.',
  })
  @IsOptional()
  @IsEnum(AmountType)
  amountType?: AmountType = AmountType.COLLECTED;
}
