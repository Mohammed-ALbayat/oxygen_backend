import { AppointmentStatus } from 'src/appointments/entities/appointment.entity';

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = Number(raw);

  return raw && Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : fallback;
}

export const ADMIN_PHONE = '0999999999';
export const ADMIN_PASSWORD = 'admin123';
export const DOCTOR_PASSWORD = 'doctor123';
export const SECRETARY_PASSWORD = 'secretary123';

/** Phone prefixes are kept apart per role so reruns stay predictable and collision free. */
export const DOCTOR_PHONE_PREFIX = '09991';
export const SECRETARY_PHONE_PREFIX = '09992';
export const PATIENT_PHONE_PREFIX = '0971';

export const BATCH_SIZE = 100;

export const LARGE_SEED_DEPOSIT_AMOUNT = 200;
export const EXAMINATION_PRICE_MIN = 500;
export const EXAMINATION_PRICE_MAX = 2500;

export const largeSeedConfig = {
  specialties: envInt('LARGE_SEED_SPECIALTIES', 10),
  doctors: envInt('LARGE_SEED_DOCTORS', 15),
  secretaries: envInt('LARGE_SEED_SECRETARIES', 5),
  patients: envInt('LARGE_SEED_PATIENTS', 200),
  appointments: envInt('LARGE_SEED_APPOINTMENTS', 700),
  months: envInt('LARGE_SEED_MONTHS', 6),
};

/**
 * Share of each status in the generated appointments. `start` is not listed here
 * because it is pinned to exactly one live consultation per doctor.
 */
export const STATUS_WEIGHTS: Record<
  Exclude<AppointmentStatus, AppointmentStatus.START>,
  number
> = {
  [AppointmentStatus.COMPLETE]: 0.55,
  [AppointmentStatus.CANCELLED]: 0.15,
  [AppointmentStatus.ACTIVE]: 0.12,
  [AppointmentStatus.PENDING]: 0.13,
  [AppointmentStatus.WAITING]: 0.05,
};

export const SPECIALTY_TITLES = [
  'قلبية',
  'جلدية',
  'جراحة العظام',
  'طب الأطفال',
  'الأمراض العصبية',
  'أمراض النساء والتوليد',
  'طب العيون',
  'الأنف والأذن والحنجرة',
  'الباطنة',
  'الطب النفسي',
  'المسالك البولية',
  'الغدد الصماء',
  'الجهاز الهضمي',
  'أمراض الرئة',
  'الروماتيزم',
];

export const CANCELLATION_REASONS = [
  'تعارض في الموعد',
  'تحسن الحالة',
  'وجدت طبيباً آخر',
  'أسباب مالية',
  'أخرى',
];

/** Sub-specialisations offered per department, used for the doctor `specialization` field. */
export const SPECIALIZATIONS: Record<string, string[]> = {
  'أمراض القلب': ['قسطرة القلب', 'فشل القلب', 'تخطيط صدى القلب'],
  'الأمراض الجلدية': ['تجميل الجلد', 'أمراض جلد الأطفال', 'جراحة الجلد'],
  'جراحة العظام': ['طب رياضي', 'استبدال المفاصل', 'جراحة العمود الفقري'],
  'طب الأطفال': ['حديثي الولادة', 'أمراض رئة الأطفال', 'طب أطفال عام'],
  'الأمراض العصبية': ['الصرع', 'طب السكتة الدماغية', 'اضطرابات الحركة'],
  'أمراض النساء والتوليد': ['توليد', 'الغدد التناسلية', 'جراحة نسائية'],
  'طب العيون': ['جراحة الشبكية', 'جراحة الساد', 'الجلوكوما'],
  'الأنف والأذن والحنجرة': ['أمراض الأنف', 'أمراض الأذن', 'جراحة الرأس والعنق'],
  'الباطنة': ['رعاية السكري', 'ارتفاع ضغط الدم', 'الطب الوقائي'],
  'الطب النفسي': ['اضطرابات المزاج', 'طب نفس الأطفال', 'طب الإدمان'],
  'المسالك البولية': ['جراحة المسالك البولية', 'طب الذكورة', 'أورام المسالك'],
  'الغدد الصماء': ['اضطرابات الغدة الدرقية', 'إدارة السكري', 'الاضطرابات الأيضية'],
  'الجهاز الهضمي': ['أمراض الكبد', 'منظار الجهاز الهضمي', 'التهاب الأمعاء'],
  'أمراض الرئة': ['رعاية الربو', 'طب النوم', 'أمراض الرئة الخلالية'],
  'الروماتيزم': ['اضطرابات المناعة', 'التهاب المفاصل', 'التهاب الأوعية'],
};

/** Diagnosis, medication and follow-up wording per department for visit records. */
export const CLINICAL_NOTES: Record<
  string,
  { diagnosis: string; medicals: string; suggestions: string }[]
> = {
  'أمراض القلب': [
    {
      diagnosis: 'ارتفاع ضغط الدم من الدرجة الأولى',
      medicals: 'أملوديبين 5 ملغ مرة يومياً',
      suggestions: 'تقليل الملح، المشي 30 دقيقة يومياً، إعادة الفحص خلال شهر',
    },
    {
      diagnosis: 'ذبحة صدرية مستقرة',
      medicals: 'أسبرين 81 ملغ، أتورفاستاتين 20 ملغ مساءً',
      suggestions: 'تجنب المجهود الشديد، فحص جهد خلال أسبوعين',
    },
  ],
  'الأمراض الجلدية': [
    {
      diagnosis: 'نوبة التهاب الجلد التأتبي',
      medicals: 'كريم هيدروكورتيزون 1% مرتين يومياً لمدة 10 أيام',
      suggestions: 'مرطب خالٍ من العطر، تجنب الاستحمام بالماء الساخن',
    },
    {
      diagnosis: 'حب شباب متوسط الشدة',
      medicals: 'كريم موضعي للحبوب مساءً، دواء فموي 100 ملغ لمدة 6 أسابيع',
      suggestions: 'واقي شمس غير مسد للمسام يومياً، مراجعة خلال 6 أسابيع',
    },
  ],
  'جراحة العظام': [
    {
      diagnosis: 'إجهاد غضروف الركبة الأيمن',
      medicals: 'إيبوبروفين 400 ملغ بعد الأكل لمدة 7 أيام',
      suggestions: 'علاج طبيعي مرتين أسبوعياً، تجنب السلالم والقرفصاء',
    },
    {
      diagnosis: 'تشنج عضلات أسفل الظهر',
      medicals: 'باراسيتامول 10 غ حسب الحاجة، مرخٍ للعضلات 2 ملغ مساءً',
      suggestions: 'تمارين تقوية العضلات الأساسية، كرسي مريح في العمل',
    },
  ],
  'طب الأطفال': [
    {
      diagnosis: 'التهاب أذن وسط حاد',
      medicals: 'شراب مضاد حيوي 250 ملغ ثلاث مرات يومياً لمدة 7 أيام',
      suggestions: 'إكمال العلاج، العودة إذا استمر الحر أكثر من 48 ساعة',
    },
    {
      diagnosis: 'فقر دم نقص حديد خفيف',
      medicals: 'قطرات حديد 15 ملغ يومياً مع فيتامين سي',
      suggestions: 'غذاء غني بالحديد، إعادة فحص الدم خلال 8 أسابيع',
    },
  ],
  'الأمراض العصبية': [
    {
      diagnosis: 'صداع نصفي بدون هالة',
      medicals: 'دواء للصداع 50 ملغ عند البدء، بيتا حاصر 40 ملغ يومياً',
      suggestions: 'تدوين الصداع، نوم منتظم',
    },
    {
      diagnosis: 'اعتلال جذر عنقي',
      medicals: 'مسكن للألم العصبي 75 ملغ مساءً',
      suggestions: 'علاج طبيعي للرقبة، رنين مغناطيسي إذا استمرت الأعراض',
    },
  ],
  'أمراض النساء والتوليد': [
    {
      diagnosis: 'متلازمة تكيس المبايض',
      medicals: 'ميتفورمين 500 ملغ مرتين يومياً',
      suggestions: 'خطة إدارة الوزن، فحص هرموني خلال 3 أشهر',
    },
    {
      diagnosis: 'متابعة حمل روتينية',
      medicals: 'حمض فوليك 400 ميكروغرام، حديد فموي يومياً',
      suggestions: 'موجات فوق صوتية خلال 4 أسابيع، مراقبة ضغط الدم',
    },
  ],
  'طب العيون': [
    {
      diagnosis: 'متلازمة جفاف العين',
      medicals: 'دموع اصطناعية أربع مرات يومياً',
      suggestions: 'استراحة من الشاشة كل 20 دقيقة، مرطب هواء في المنزل',
    },
    {
      diagnosis: 'مياه بيضاء مبكرة، العين اليسرى',
      medicals: 'لا حاجة لدواء',
      suggestions: 'مراجعة سنوية، نظارات شمسية في الخارج',
    },
  ],
  'الأنف والأذن والحنجرة': [
    {
      diagnosis: 'التهاب الأنف التحسسي',
      medicals: 'بخاخ أنفي مضاد للحساسية، مضاد هيستامين 10 ملغ يومياً',
      suggestions: 'أغطية ضد عث الغبار، تجنب المحفزات المعروفة',
    },
    {
      diagnosis: 'التهاب لوزتين حاد',
      medicals: 'مضاد حيوي 500 ملغ ثلاث مرات يومياً لمدة 7 أيام',
      suggestions: 'مضمضة بماء وملح دافئ، شرب سوائل كافية',
    },
  ],
  'الباطنة': [
    {
      diagnosis: 'سكري النوع الثاني، سيطرة غير كافية',
      medicals: 'ميتفورمين 1000 ملغ مرتين يومياً',
      suggestions: 'متابعة النظام الغذائي، فحص السكر التراكمي خلال 3 أشهر',
    },
    {
      diagnosis: 'نقص فيتامين د',
      medicals: 'فيتامين د 50000 وحدة أسبوعياً لمدة 8 أسابيع',
      suggestions: 'التعرض للشمس 15 دقيقة يومياً، إعادة الفحص بعد الدورة',
    },
  ],
  'الطب النفسي': [
    {
      diagnosis: 'اضطراب القلق المعمم',
      medicals: 'مضاد اكتئاب 50 ملغ كل صباح',
      suggestions: 'جلسات علاج معرفي أسبوعياً، تمارين التنفس',
    },
    {
      diagnosis: 'أرق حاد',
      medicals: 'هرمون النوم 3 ملغ قبل النوم',
      suggestions: 'نظام صحي للنوم، تجنب المنبهات بعد الظهر',
    },
  ],
};

export const DEFAULT_CLINICAL_NOTES = [
  {
    diagnosis: 'متابعة روتينية، الحالة مستقرة',
    medicals: 'الاستمرار على العلاج الحالي',
    suggestions: 'مراجعة خلال 3 أشهر أو عند تغير الأعراض',
  },
  {
    diagnosis: 'عدوى فيروسية خفيفة',
    medicals: 'باراسيتامول 500 ملغ حسب الحاجة، راحة وسوائل',
    suggestions: 'العودة إذا تجاوز الحر 39 درجة أو استمر أكثر من 3 أيام',
  },
];

export const POSITIVE_REVIEW_COMMENTS = [
  'طبيب منتبه جداً، شرح كل شيء بوضوح.',
  'وقت انتظار قصير وفحص شامل.',
  'طاقم محترف وعيادة نظيفة.',
  'خطة العلاج نجحت كما وُصفت.',
  'أجاب على جميع أسئلتي بصبر.',
];

export const NEUTRAL_REVIEW_COMMENTS = [
  'استشارة جيدة لكن الانتظار كان أطول من المتوقع.',
  'زيارة مقبولة بشكل عام، الاستقبال يحتاج تنظيماً أفضل.',
  'الطبيب كان مفيداً، لكن الموعد بدا متسرعاً.',
];

export const NEGATIVE_REVIEW_COMMENTS = [
  'انتظرت أكثر من ساعة بعد موعدي.',
  'الاستشارة كانت قصيرة جداً بالنسبة لمشاكلي.',
  'اضطررت لتكرار تاريخي الطبي عدة مرات لموظفين مختلفين.',
];

export const DAMASCUS_AREAS = [
  'المزة',
  'المالكي',
  'كفر سوسة',
  'برامكة',
  'القصعة',
  'باب توما',
  'ركن الدين',
  'دمر',
  'برزة',
  'الميدان',
  'شعلان',
  'أبو رمانة',
];

export const ALLERGIES = [
  'البنسللين',
  'الفول السوداني',
  'عث الغبار',
  'حبوب اللقاح',
  'عدم تحمل اللاكتوز',
  'الأسبرين',
];

export const CHRONIC_DISEASES = [
  'ارتفاع ضغط الدم',
  'السكري من النوع الثاني',
  'الربو',
  'قصور الغدة الدرقية',
  'الصداع النصفي المزمن',
];

export const PREVIOUS_OPERATIONS = [
  'استئصال الزند',
  'استئصال اللوزتين',
  'منظار الركبة',
  'عملية قيصرية',
  'استئصال المرارة',
];

export const PERMANENT_MEDICATIONS = [
  'ليفوثيروكسين 50 ميكروغرام يومياً',
  'ميتفورمين 850 ملغ مرتين يومياً',
  'بخاخ سالبيوتامول عند الحاجة',
  'ليسينوبريل 10 ملغ يومياً',
];

