import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from 'src/users/entities/user.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationTargetType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationsRepository.create({
      title: dto.title,
      message: dto.message,
      user,
      target_type: dto.targetType,
      isRead: false,
    });

    return await this.notificationsRepository.save(notification);
  }
  async getUserNotifications(userId: number, status?: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const whereCondition: any = {
      user: { id: userId },
    };

    if (status === 'read') {
      whereCondition.isRead = true;
    }

    if (status === 'unread') {
      whereCondition.isRead = false;
    }

    return await this.notificationsRepository.find({
      where: whereCondition,
      order: {
        created_at: 'DESC',
      },
    });
  }

  async markAsRead(notificationId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;

    return await this.notificationsRepository.save(notification);
  }

  async getUnreadCount(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const count = await this.notificationsRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });

    return { count };
  }

  @OnEvent('appointment.created')
  async handleAppointmentCreated(payload: any) {
    if (!payload) return;
    await this.createNotification({
      userId: payload.patientUserId,
      title: 'Appointment Confirmed',
      message: `Your appointment is on ${payload.date} at ${payload.time}`,
      targetType: NotificationTargetType.PATIENT,
    });

    await this.createNotification({
      userId: payload.doctorUserId,
      title: 'New Appointment',
      message: `You have a new patient on ${payload.date} at ${payload.time}`,
      targetType: NotificationTargetType.DOCTOR,
    });
  }
}
