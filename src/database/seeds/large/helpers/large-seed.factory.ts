import { faker } from '@faker-js/faker';
import {
  AppointmentStatus,
  PaymentStatus,
} from 'src/appointments/entities/appointment.entity';
import { DayOfWeek } from 'src/doctor-schedules/entities/doctor-schedule.entity';
import { BloodType } from 'src/patients/entities/patient.entity';
import { Gender } from 'src/users/enums/gender.enum';
import {
  CLINICAL_NOTES,
  DAMASCUS_AREAS,
  DEFAULT_CLINICAL_NOTES,
  DOCTOR_PHONE_PREFIX,
  NEGATIVE_REVIEW_COMMENTS,
  NEUTRAL_REVIEW_COMMENTS,
  PATIENT_PHONE_PREFIX,
  POSITIVE_REVIEW_COMMENTS,
  SECRETARY_PHONE_PREFIX,
  SPECIALIZATIONS,
  STATUS_WEIGHTS,
} from './large-seed.config';

type NamePool = {
  maleFirst: string[];
  femaleFirst: string[];
  family: string[];
};

/** Disjoint pools so doctors, secretaries and patients never share a full name. */
const DOCTOR_NAMES: NamePool = {
  maleFirst: [
    'وسيم', 'مهند', 'عمار', 'إياد', 'حسام', 'فادي', 'معن', 'باسل',
    'شادي', 'معتز', 'أيهم', 'قصي', 'نضال', 'غسان', 'ماهر',
  ],
  femaleFirst: [
    'دانيا', 'علا', 'سناء', 'منى', 'ليلى', 'هند', 'رند', 'عبير',
    'سوسن', 'إيناس',
  ],
  family: [
    'الخطيب', 'نعمة', 'جبور', 'المقدسي', 'عيتاني', 'طرابلسي', 'كنعان',
    'حمدان', 'بكري', 'أتاسي', 'الحفار', 'قوتلي',
  ],
};

const SECRETARY_NAMES: NamePool = {
  maleFirst: ['أيمن', 'رضوان', 'هيثم', 'عدنان', 'صباح'],
  femaleFirst: ['سمر', 'نسرين', 'جمانة', 'بتول', 'إلهام', 'وفاء', 'منال'],
  family: ['بيطار', 'نحاس', 'فارس', 'معلوف', 'شقير', 'داغر', 'تلحوق'],
};

const PATIENT_NAMES: NamePool = {
  maleFirst: [
    'أحمد', 'عمر', 'يوسف', 'خالد', 'بشار', 'سامر', 'فراس', 'هادي',
    'إبراهيم', 'جمال', 'كريم', 'لؤي', 'مجد', 'نبيل', 'رامي', 'طارق',
    'وائل', 'زياد', 'بلال', 'أنس', 'غيث', 'حازم', 'مروان', 'نزار',
    'حسان', 'توفيق', 'سليمان', 'عبدالله', 'مصطفى', 'حيدر','محمد',
    'عبد الرحمن', 'سعيد', 'سهيل', 'بكر', 'عثمان', 'براء', 'ماهر'
  ],
  femaleFirst: [
    'لينا', 'رنا', 'هلا', 'نور', 'سلمى', 'ديما', 'ريم', 'مايا',
    'غادة', 'هبة', 'جنة', 'لما', 'ميس', 'نادية', 'رشا', 'سارة',
    'تلا', 'يارا', 'زينة', 'أمل', 'بشرى', 'فرح', 'ليان', 'ريمة',
    'شيماء', 'آلاء', 'داليا', 'هديل', 'روان', 'ملك',
  ],
  family: [
    'الحسن', 'حداد', 'خوري', 'السيد', 'درويش', 'ناصر', 'شعبان',
    'الأحمد', 'إبراهيم', 'منصور', 'صالح', 'بركت', 'كساب', 'عطار',
    'زاهر', 'رفاعي', 'صباغ', 'حلبي', 'ديب', 'عزيز', 'مرديني', 'قاسم',
    'طهان', 'يازجي', 'شاهين', 'غزال', 'الحموي', 'اسكندر', 'نجم', 'وهبي',
  ],
};

const WEEKEND_DAYS = [5, 6]; // Friday and Saturday in the Syrian working week

const WORKING_DAYS = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
];

const CLINIC_OPEN_HOUR = 9;
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = 16; // 09:00 to 17:00

export interface AppointmentSlot {
  start_time: string;
  end_time: string;
}

function uniqueNameFromPool(
  gender: Gender,
  pool: NamePool,
  index: number,
): string {
  const firstNames = gender === Gender.MALE ? pool.maleFirst : pool.femaleFirst;
  const first = firstNames[index % firstNames.length];
  const family =
    pool.family[Math.floor(index / firstNames.length) % pool.family.length];

  return `${first} ${family}`;
}

export function adminFullName(): string {
  return 'كمال الريس';
}

export function doctorFullName(gender: Gender, index: number): string {
  return `د. ${uniqueNameFromPool(gender, DOCTOR_NAMES, index)}`;
}

export function secretaryFullName(gender: Gender, index: number): string {
  return uniqueNameFromPool(gender, SECRETARY_NAMES, index);
}

export function patientFullName(gender: Gender, index: number): string {
  return uniqueNameFromPool(gender, PATIENT_NAMES, index);
}

export function doctorPhone(index: number): string {
  return `${DOCTOR_PHONE_PREFIX}${String(index).padStart(5, '0')}`;
}

export function secretaryPhone(index: number): string {
  return `${SECRETARY_PHONE_PREFIX}${String(index).padStart(5, '0')}`;
}

export function patientPhone(index: number): string {
  return `${PATIENT_PHONE_PREFIX}${String(index).padStart(6, '0')}`;
}

/** Midnight of the day the script runs, used for every live queue and consultation row. */
export function today(): Date {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** MySQL `date` columns are written as plain strings so no timezone shifting occurs. */
export function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

/** Weekday-weighted date inside the report window, so weekends stay sparse. */
export function pastWorkingDate(monthsBack: number): Date {
  const reference = today();
  const totalDays = Math.round(monthsBack * 30.5);

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = addDays(
      reference,
      -faker.number.int({ min: 1, max: totalDays }),
    );

    if (!WEEKEND_DAYS.includes(candidate.getDay())) {
      return candidate;
    }
  }

  return addDays(reference, -faker.number.int({ min: 1, max: totalDays }));
}

export function futureWorkingDate(maxDaysAhead = 45): Date {
  const reference = today();

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = addDays(
      reference,
      faker.number.int({ min: 1, max: maxDaysAhead }),
    );

    if (!WEEKEND_DAYS.includes(candidate.getDay())) {
      return candidate;
    }
  }

  return addDays(reference, faker.number.int({ min: 1, max: maxDaysAhead }));
}

export function appointmentSlot(slotIndex?: number): AppointmentSlot {
  const index =
    slotIndex ?? faker.number.int({ min: 0, max: SLOTS_PER_DAY - 1 });
  const startMinutes = CLINIC_OPEN_HOUR * 60 + index * SLOT_MINUTES;

  return {
    start_time: minutesToTime(startMinutes),
    end_time: minutesToTime(startMinutes + SLOT_MINUTES),
  };
}

function minutesToTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}:00`;
}

export function doctorWorkingDays(): DayOfWeek[] {
  return faker.helpers.arrayElements(
    WORKING_DAYS,
    faker.number.int({ min: 2, max: 4 }),
  );
}

export function doctorSpecialization(specialtyTitle: string): string {
  const options = SPECIALIZATIONS[specialtyTitle];

  return options
    ? faker.helpers.arrayElement(options)
    : `استشاري ${specialtyTitle}`;
}

export function doctorBio(name: string, specialtyTitle: string): string {
  const years = faker.number.int({ min: 4, max: 28 });
  const university = faker.helpers.arrayElement([
    'جامعة دمشق',
    'جامعة حلب',
    'جامعة تشرين',
    'جامعة القاهرة',
    'جامعة العلوم والتكنولوجيا الأردنية',
  ]);

  const bareName = name.startsWith('د. ') ? name.slice(3) : name;

  return `الدكتور ${bareName} استشاري ${specialtyTitle} بخبرة ${years} سنة، تخرج من ${university}.`;
}

export function patientAddress(): string {
  return `${faker.helpers.arrayElement(DAMASCUS_AREAS)}، بناء ${faker.number.int({ min: 1, max: 90 })}، دمشق`;
}

export function bloodType(): BloodType {
  return faker.helpers.weightedArrayElement([
    { value: BloodType.O_POSITIVE, weight: 30 },
    { value: BloodType.A_POSITIVE, weight: 26 },
    { value: BloodType.B_POSITIVE, weight: 18 },
    { value: BloodType.AB_POSITIVE, weight: 7 },
    { value: BloodType.O_NEGATIVE, weight: 8 },
    { value: BloodType.A_NEGATIVE, weight: 5 },
    { value: BloodType.B_NEGATIVE, weight: 4 },
    { value: BloodType.AB_NEGATIVE, weight: 2 },
  ]);
}

export function clinicalNote(specialtyTitle: string) {
  const notes = CLINICAL_NOTES[specialtyTitle] ?? DEFAULT_CLINICAL_NOTES;

  return faker.helpers.arrayElement(notes);
}

export function reviewScore(): number {
  return faker.helpers.weightedArrayElement([
    { value: 5, weight: 45 },
    { value: 4, weight: 30 },
    { value: 3, weight: 13 },
    { value: 2, weight: 7 },
    { value: 1, weight: 5 },
  ]);
}

export function reviewComment(score: number): string | null {
  if (faker.datatype.boolean({ probability: 0.2 })) {
    return null;
  }

  if (score >= 4) {
    return faker.helpers.arrayElement(POSITIVE_REVIEW_COMMENTS);
  }

  return score === 3
    ? faker.helpers.arrayElement(NEUTRAL_REVIEW_COMMENTS)
    : faker.helpers.arrayElement(NEGATIVE_REVIEW_COMMENTS);
}

export function waitingDurationSeconds(): number {
  return faker.number.int({ min: 300, max: 5400 });
}

/**
 * Builds the exact status list for the run: one live consultation per doctor and
 * the remaining volume spread across the weighted statuses.
 */
export function buildStatusPlan(
  totalAppointments: number,
  doctorCount: number,
): AppointmentStatus[] {
  const startCount = Math.min(doctorCount, totalAppointments);
  const remaining = totalAppointments - startCount;
  const plan: AppointmentStatus[] = [];

  for (let i = 0; i < startCount; i++) {
    plan.push(AppointmentStatus.START);
  }

  const entries = Object.entries(STATUS_WEIGHTS) as [
    AppointmentStatus,
    number,
  ][];

  let assigned = 0;

  entries.forEach(([status, weight], index) => {
    const isLast = index === entries.length - 1;
    const count = isLast
      ? remaining - assigned
      : Math.round(remaining * weight);

    for (let i = 0; i < count; i++) {
      plan.push(status);
    }

    assigned += count;
  });

  return plan;
}

export function paymentStatusFor(status: AppointmentStatus): PaymentStatus {
  switch (status) {
    case AppointmentStatus.COMPLETE:
      return faker.helpers.weightedArrayElement([
        { value: PaymentStatus.PAID, weight: 62 },
        { value: PaymentStatus.INSURANCE, weight: 22 },
        { value: PaymentStatus.DEPOSIT_PAID, weight: 10 },
        { value: PaymentStatus.REFUNDED, weight: 6 },
      ]);
    case AppointmentStatus.CANCELLED:
      return faker.helpers.weightedArrayElement([
        { value: PaymentStatus.UNPAID, weight: 60 },
        { value: PaymentStatus.REFUNDED, weight: 30 },
        { value: PaymentStatus.DEPOSIT_PAID, weight: 10 },
      ]);
    case AppointmentStatus.START:
    case AppointmentStatus.WAITING:
    case AppointmentStatus.ACTIVE:
      return faker.helpers.weightedArrayElement([
        { value: PaymentStatus.DEPOSIT_PAID, weight: 45 },
        { value: PaymentStatus.PAID, weight: 25 },
        { value: PaymentStatus.INSURANCE, weight: 20 },
        { value: PaymentStatus.UNPAID, weight: 10 },
      ]);
    default:
      return faker.helpers.weightedArrayElement([
        { value: PaymentStatus.UNPAID, weight: 65 },
        { value: PaymentStatus.DEPOSIT_PAID, weight: 35 },
      ]);
  }
}

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}
