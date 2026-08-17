import { AppointmentReviewDto } from '../dto/appointment-review.dto';
import { AppointmentReview } from '../entities/appointment-review.entity';

export function toReviewDto(
  review: AppointmentReview,
  appointmentId: number,
): AppointmentReviewDto {
  return {
    id: review.id,
    appointment_id: appointmentId,
    score: review.score,
    comment: review.comment,
    created_at: review.created_at,
  };
}
