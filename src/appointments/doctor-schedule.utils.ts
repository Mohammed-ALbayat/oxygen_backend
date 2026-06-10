import { DayOfWeek } from 'src/doctor-schedules/entities/doctor-schedule.entity';

export function getDayEnum(date: Date): DayOfWeek {
  const day = date.getDay();

  return [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ][day];
}

export function generateTimeSlots(
  start: string,
  end: string,
  duration: number,
): string[] {
  const slots: string[] = [];

  let current = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);

  while (current < endTime) {
    slots.push(current.toTimeString().slice(0, 5));

    current = new Date(current.getTime() + duration * 60000);
  }

  return slots;
}

export function calculateEndTime(start: string, duration: number): string {
  const date = new Date(`2000-01-01T${start}`);

  const end = new Date(date.getTime() + duration * 60000);

  return end.toTimeString().slice(0, 5);
}
