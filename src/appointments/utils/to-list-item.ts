import { AdminAppointmentListItemDto } from '../dto/admin-appointment-list-item.dto';
import { Appointment } from '../entities/appointment.entity';

export function toListItem(
  appointment: Appointment,
): AdminAppointmentListItemDto {
  const appointmentDate =
    appointment.appointment_date instanceof Date
      ? appointment.appointment_date.toISOString().slice(0, 10)
      : String(appointment.appointment_date).slice(0, 10);

  return {
    id: appointment.id,
    department_id: appointment.department?.id ?? null,
    department_name: appointment.department?.title ?? null,
    appointment_date: appointmentDate,
    start_time: appointment.start_time,
    end_time: appointment.end_time,
    status: appointment.status,
    payment_status: appointment.payment_status,
    created_at: appointment.created_at,
    doctor_id: appointment.doctor.user_id,
    doctor_name: appointment.doctor.user.full_name,
    patient_id: appointment.patient.userId,
    patient_name: appointment.patient.user.full_name,
    cancellation_reason: appointment.cancellation_reason ?? null,
  };
}
