import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentWaitingTimeService {
  /**
   * Records how long a patient waited in the queue by mutating the appointment
   * in place. The caller is responsible for persisting the appointment.
   */
  applyTransition(
    appointment: Appointment,
    previousStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ) {
    if (previousStatus === newStatus) {
      return;
    }

    if (newStatus === AppointmentStatus.WAITING) {
      appointment.waiting_entered_at = new Date();
      appointment.waiting_duration_seconds = null;
      return;
    }

    if (previousStatus !== AppointmentStatus.WAITING) {
      return;
    }

    if (newStatus === AppointmentStatus.START) {
      appointment.waiting_duration_seconds = this.elapsedSeconds(
        appointment.waiting_entered_at,
      );
      return;
    }

    // The patient left the queue without being seen, so there is nothing to measure.
    appointment.waiting_entered_at = null;
  }

  private elapsedSeconds(enteredAt: Date | null): number | null {
    if (!enteredAt) {
      return null;
    }

    const elapsed = Date.now() - new Date(enteredAt).getTime();

    return Math.max(0, Math.round(elapsed / 1000));
  }
}
