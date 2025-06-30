// أنواع البيانات للطلاب
export interface Student {
  id: string;
  name: string;
  username: string;
  password?: string;
  image?: string;
  attendance?: string;
  is_paid?: boolean;
  payment_status?: string;
  payment_type: string;
  total_sessions?: number;
  next_lesson_surah?: string;
  next_lesson_verses?: string;
  notes?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// أنواع البيانات لجدول الطالب
export interface StudentSchedule {
  id: string;
  student_id: string;
  day: string;
  time: string;
}

// أنواع البيانات لسور الطالب
export interface StudentSurah {
  id: string;
  student_id: string;
  name: string;
  rating?: number;
}

// أنواع البيانات لشهادات الطالب
export interface StudentCertificate {
  id: string;
  student_id: string;
  url: string;
}

// أنواع البيانات للملف الشخصي
export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  updated_at?: string;
}

// أنواع البيانات للإدراج
export interface StudentInsert {
  name: string;
  username: string;
  password?: string;
  image?: string;
  attendance?: string;
  is_paid?: boolean;
  payment_status?: string;
  payment_type: string;
  total_sessions?: number;
  next_lesson_surah?: string;
  next_lesson_verses?: string;
  notes?: string;
  user_id?: string;
}

export interface StudentScheduleInsert {
  student_id: string;
  day: string;
  time: string;
}

export interface StudentSurahInsert {
  student_id: string;
  name: string;
  rating?: number;
}

export interface StudentCertificateInsert {
  student_id: string;
  url: string;
}

// أنواع البيانات للتحديث
export interface StudentUpdate {
  name?: string;
  username?: string;
  password?: string;
  image?: string;
  attendance?: string;
  is_paid?: boolean;
  payment_status?: string;
  payment_type?: string;
  total_sessions?: number;
  next_lesson_surah?: string;
  next_lesson_verses?: string;
  notes?: string;
  user_id?: string;
  updated_at?: string;
} 