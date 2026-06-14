import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
  PaymentStatus,
} from './entities/appointment.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { calculateEndTime, getDayEnum } from './utils/doctor-schedule.utils';
import { generateTimeSlots } from './utils/doctor-schedule.utils';
import { DoctorSchedule } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
  ) {}

  // لا تنسَ جعل المعامل date اختيارياً بوضع علامة ?
  async getDoctorSlots(doctorId: number, date?: string) {
    const targetDates: Date[] = [];
    const isSingleDate = !!date;

    if (isSingleDate) {
      // 1. حيلة احترافية: تمرير السنة والشهر واليوم يدوياً لضمان إنشاء التاريخ بالتوقيت المحلي وليس UTC
      const [year, month, day] = date.split('-');
      targetDates.push(new Date(Number(year), Number(month) - 1, Number(day)));
    } else {
      const today = new Date();
      // تصفير الوقت لمنتصف الليل بالتوقيت المحلي لضمان عدم تداخل الأيام
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 14; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        targetDates.push(nextDate);
      }
    }

    // 2. التعديل الأهم: دالة تعطينا التاريخ النصي بناءً على التوقيت المحلي حصراً
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(targetDates[0]);
    const endDate = formatDate(targetDates[targetDates.length - 1]);

    // --- من هنا يبدأ استعلام قاعدة البيانات، الباقي يبقى كما هو تماماً ---
    const schedules = await this.scheduleRepository.find({
      where: {
        doctor: { user_id: doctorId },
        is_active: true,
      },
    });

    if (isSingleDate && schedules.length === 0) {
      throw new NotFoundException('No schedule found for this doctor');
    }

    // 3. جلب جميع المواعيد المحجوزة للطبيب ضمن نطاق التواريخ مرة واحدة
    const query = this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', { doctorId });

    if (isSingleDate) {
      query.andWhere('a.appointment_date = :startDate', { startDate });
    } else {
      query
        .andWhere('a.appointment_date >= :startDate', { startDate })
        .andWhere('a.appointment_date <= :endDate', { endDate });
    }

    const appointments = await query.getMany();

    // 4. بناء الرد النهائي وتوزيع الأوقات على الأيام
    const availableDays: any = [];

    for (const currentDate of targetDates) {
      const dateString = formatDate(currentDate);
      const dayEnum = getDayEnum(currentDate);

      // البحث عن جدول الطبيب الخاص بهذا اليوم المتاح في الذاكرة
      const schedule = schedules.find((s) => s.day_of_week === dayEnum);

      if (!schedule) {
        // إذا كان الطلب ليوم محدد، نرمي خطأ كما في المنطق السابق
        if (isSingleDate) {
          throw new NotFoundException(
            'No schedule found for this doctor on this day',
          );
        }
        // أما إذا كنا نجلب 14 يوماً، ببساطة نتجاوز الأيام التي لا يعمل بها الطبيب
        continue;
      }

      const allSlots = generateTimeSlots(
        schedule.start_time,
        schedule.end_time,
        schedule.slot_duration,
      );

      // تصفية المواعيد الخاصة بهذا اليوم فقط
      const dayAppointments = appointments.filter((a) => {
        // تحويل تاريخ الموعد القادم من قاعدة البيانات لضمان دقة المقارنة
        const appDate = formatDate(new Date(a.appointment_date));
        return appDate === dateString;
      });

      const bookedSlots = dayAppointments.map((a) => a.start_time.slice(0, 5));

      const slots = allSlots.map((slot) => ({
        time: slot,
        isBooked:
          bookedSlots.includes(slot) &&
          !dayAppointments
            .find((a) => a.start_time.slice(0, 5) === slot)
            ?.status.includes(AppointmentStatus.CANCELLED),
      }));

      availableDays.push({
        date: dateString,
        day: dayEnum,
        slots,
      });
    }

    // إرجاع النتيجة بشكل موحد
    return {
      doctorId,
      availableDays,
    };
  }

  async createAppointment(
    doctorId: number,
    patientId: number,
    date: string,
    start_time: string,
  ) {
    const targetDate = date;
    const dayEnum = getDayEnum(new Date(date));

    const today = new Date();
    if (new Date(targetDate) < new Date(today.toDateString())) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { user_id: doctorId },
      relations: ['specialty'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const schedule = await this.scheduleRepository.findOne({
      where: {
        doctor: { user_id: doctorId },
        day_of_week: dayEnum,
        is_active: true,
      },
    });

    if (!schedule) {
      throw new BadRequestException('Doctor not available on this day');
    }

    const allSlots = generateTimeSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration,
    );

    if (!allSlots.includes(start_time)) {
      throw new BadRequestException('Invalid time slot');
    }

    // التحقق من وجود تعارض في مواعيد المريض والطبيب بدون اعتبار المواعيد الملغاة

    const patientConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.patient_id = :patientId', { patientId })
      .andWhere('a.appointment_date = :date', { date: targetDate })
      .andWhere('a.start_time = :start_time', { start_time })
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (patientConflict) {
      throw new BadRequestException(
        'Patient already has an appointment at this time',
      );
    }

    const doctorConflict = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.doctor_id = :doctorId', { doctorId })
      .andWhere('a.appointment_date = :date', { date: targetDate })
      .andWhere('a.start_time = :start_time', { start_time })
      .andWhere('a.status != :cancelledStatus', {
        cancelledStatus: AppointmentStatus.CANCELLED,
      })
      .getOne();

    if (doctorConflict) {
      throw new BadRequestException('This slot is already booked');
    }

    const appointment = this.appointmentRepository.create({
      doctor: { user_id: doctorId },
      patient: { userId: patientId },
      department: doctor.specialty,
      appointment_date: targetDate,
      start_time,
      end_time: calculateEndTime(start_time, schedule.slot_duration),
      status: AppointmentStatus.PENDING,
      payment_status: PaymentStatus.UNPAID,
    });

    await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment booked successfully',
      appointment,
    };
  }

  async findAppointmentById(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getDepartmentsWithDoctors(specialtyId: number | undefined) {
    const query = this.specialtyRepository
      .createQueryBuilder('specialty')
      .leftJoin('specialty.doctors', 'doctor')
      .leftJoin('doctor.user', 'user')
      .leftJoin('doctor.schedules', 'schedule')
      .addSelect([
        'specialty.id',
        'specialty.title',
        'doctor.user_id',
        'user.full_name',
        'schedule.day_of_week',
        'schedule.start_time',
        'schedule.end_time',
      ]);

    if (specialtyId) {
      query.andWhere('specialty.id = :specialtyId', { specialtyId });
    }

    const specialties = await query.getMany();

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.title,
      doctors: (specialty.doctors || []).map((doctor) => ({
        id: doctor.user_id,
        name: doctor.user?.full_name,
        schedules: (doctor.schedules || []).map((s) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      })),
    }));
  }
}
