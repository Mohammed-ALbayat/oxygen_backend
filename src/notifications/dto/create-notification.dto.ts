import { IsEnum, IsInt, IsString, MinLength } from 'class-validator';

import { NotificationTargetType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsInt()
  userId: number;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  message: string;

  @IsEnum(NotificationTargetType)
  targetType: NotificationTargetType;
}
