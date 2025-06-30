import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type {
  Student,
  StudentSchedule,
  StudentSurah,
  StudentCertificate,
  Profile,
  StudentInsert,
  StudentScheduleInsert,
  StudentSurahInsert,
  StudentCertificateInsert,
  StudentUpdate
} from './types';

// اختبار الاتصال بـ Firebase
console.log("Firebase services initialized, db instance:", db);

// تحويل Timestamp إلى string
const convertTimestamp = (timestamp: Timestamp | null): string | null => {
  return timestamp ? timestamp.toDate().toISOString() : null;
};

// تحويل string إلى Timestamp
const convertToTimestamp = (dateString: string | null): Timestamp | null => {
  return dateString ? Timestamp.fromDate(new Date(dateString)) : null;
};

// دالة لتنظيف البيانات من قيم undefined
const cleanData = (data: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// خدمات الطلاب
export const studentsService = {
  // جلب جميع الطلاب
  async getAllStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: convertTimestamp(doc.data().created_at),
      updated_at: convertTimestamp(doc.data().updated_at)
    })) as Student[];
  },

  // جلب طالب واحد بواسطة المعرف
  async getStudentById(id: string): Promise<Student | null> {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at)
      } as Student;
    }
    return null;
  },

  // جلب طالب بواسطة اسم المستخدم
  async getStudentByUsername(username: string): Promise<Student | null> {
    const q = query(
      collection(db, 'students'),
      where('username', '==', username)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: convertTimestamp(data.created_at),
        updated_at: convertTimestamp(data.updated_at)
      } as Student;
    }
    return null;
  },

  // إضافة طالب جديد
  async addStudent(studentData: StudentInsert): Promise<string> {
    // تنظيف البيانات من قيم undefined
    const cleanedData = cleanData({
      ...studentData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    console.log('Adding student with cleaned data:', cleanedData);
    
    const docRef = await addDoc(collection(db, 'students'), cleanedData);
    return docRef.id;
  },

  // تحديث بيانات الطالب
  async updateStudent(id: string, updateData: StudentUpdate): Promise<void> {
    const docRef = doc(db, 'students', id);
    
    // تنظيف البيانات من قيم undefined
    const cleanedData = cleanData({
      ...updateData,
      updated_at: serverTimestamp()
    });
    
    console.log('Updating student with cleaned data:', cleanedData);
    
    await updateDoc(docRef, cleanedData);
  },

  // حذف طالب
  async deleteStudent(id: string): Promise<void> {
    const docRef = doc(db, 'students', id);
    await deleteDoc(docRef);
  }
};

// خدمات جدول الطالب
export const studentSchedulesService = {
  // جلب جدول طالب معين
  async getStudentSchedules(studentId: string): Promise<StudentSchedule[]> {
    const q = query(
      collection(db, 'student_schedules'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    const schedules = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudentSchedule[];
    
    // ترتيب النتائج محلياً بدلاً من ترتيبها في قاعدة البيانات
    return schedules.sort((a, b) => a.day.localeCompare(b.day));
  },

  // إضافة جدول جديد
  async addStudentSchedule(scheduleData: StudentScheduleInsert): Promise<string> {
    const docRef = await addDoc(collection(db, 'student_schedules'), scheduleData);
    return docRef.id;
  },

  // تحديث جدول
  async updateStudentSchedule(id: string, updateData: Partial<StudentSchedule>): Promise<void> {
    const docRef = doc(db, 'student_schedules', id);
    await updateDoc(docRef, updateData);
  },

  // حذف جدول
  async deleteStudentSchedule(id: string): Promise<void> {
    const docRef = doc(db, 'student_schedules', id);
    await deleteDoc(docRef);
  },

  // حذف جميع جداول طالب معين
  async deleteStudentSchedules(studentId: string): Promise<void> {
    const q = query(
      collection(db, 'student_schedules'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// خدمات سور الطالب
export const studentSurahsService = {
  // جلب سور طالب معين
  async getStudentSurahs(studentId: string): Promise<StudentSurah[]> {
    const q = query(
      collection(db, 'student_surahs'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    const surahs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudentSurah[];
    
    // ترتيب النتائج محلياً بدلاً من ترتيبها في قاعدة البيانات
    return surahs.sort((a, b) => a.name.localeCompare(b.name));
  },

  // إضافة سورة جديدة
  async addStudentSurah(surahData: StudentSurahInsert): Promise<string> {
    const docRef = await addDoc(collection(db, 'student_surahs'), surahData);
    return docRef.id;
  },

  // تحديث سورة
  async updateStudentSurah(id: string, updateData: Partial<StudentSurah>): Promise<void> {
    const docRef = doc(db, 'student_surahs', id);
    await updateDoc(docRef, updateData);
  },

  // حذف سورة
  async deleteStudentSurah(id: string): Promise<void> {
    const docRef = doc(db, 'student_surahs', id);
    await deleteDoc(docRef);
  },

  // حذف جميع سور طالب معين
  async deleteStudentSurahs(studentId: string): Promise<void> {
    const q = query(
      collection(db, 'student_surahs'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// خدمات شهادات الطالب
export const studentCertificatesService = {
  // جلب شهادات طالب معين
  async getStudentCertificates(studentId: string): Promise<StudentCertificate[]> {
    const q = query(
      collection(db, 'student_certificates'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StudentCertificate[];
  },

  // إضافة شهادة جديدة
  async addStudentCertificate(certificateData: StudentCertificateInsert): Promise<string> {
    const docRef = await addDoc(collection(db, 'student_certificates'), certificateData);
    return docRef.id;
  },

  // تحديث شهادة
  async updateStudentCertificate(id: string, updateData: Partial<StudentCertificate>): Promise<void> {
    const docRef = doc(db, 'student_certificates', id);
    await updateDoc(docRef, updateData);
  },

  // حذف شهادة
  async deleteStudentCertificate(id: string): Promise<void> {
    const docRef = doc(db, 'student_certificates', id);
    await deleteDoc(docRef);
  },

  // حذف جميع شهادات طالب معين
  async deleteStudentCertificates(studentId: string): Promise<void> {
    const q = query(
      collection(db, 'student_certificates'),
      where('student_id', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// خدمات الملف الشخصي
export const profilesService = {
  // جلب ملف شخصي بواسطة المعرف
  async getProfileById(id: string): Promise<Profile | null> {
    const docRef = doc(db, 'profiles', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        updated_at: convertTimestamp(data.updated_at)
      } as Profile;
    }
    return null;
  },

  // إضافة ملف شخصي جديد
  async addProfile(profileData: Omit<Profile, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'profiles'), {
      ...profileData,
      updated_at: serverTimestamp()
    });
    return docRef.id;
  },

  // تحديث ملف شخصي
  async updateProfile(id: string, updateData: Partial<Profile>): Promise<void> {
    const docRef = doc(db, 'profiles', id);
    await updateDoc(docRef, {
      ...updateData,
      updated_at: serverTimestamp()
    });
  }
}; 