import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Users, Eye, Calendar, BookOpen, Award } from "lucide-react";
import { EditStudentDialog } from "./EditStudentDialog";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { 
  studentsService, 
  studentSchedulesService, 
  studentSurahsService, 
  studentCertificatesService 
} from "@/integrations/firebase/services";

export interface Student {
  id: string;
  image: string;
  name: string;
  username: string;
  paymentType: string;
  attendance: string;
  paymentStatus: string;
  notes?: string;
  totalSessions?: number;
  attendedSessions?: number;
  isPaid?: boolean;
  schedules?: {day: string, time: string}[];
  surahs?: {name: string, rating: number}[];
  certificates?: string[];
  password?: string;
  nextLesson?: string;
}

interface StudentsTableProps {
  searchQuery: string;
}

export const StudentsTable = ({ searchQuery }: StudentsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب بيانات الطلاب من Firebase
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const studentsData = await studentsService.getAllStudents();

        // تحويل بيانات الطلاب من Firebase إلى تنسيق التطبيق
        const formattedStudents: Student[] = await Promise.all(studentsData.map(async (student) => {
          // جلب مواعيد الطالب
          const schedulesData = await studentSchedulesService.getStudentSchedules(student.id);
          
          // جلب السور المكلف بها الطالب
          const surahsData = await studentSurahsService.getStudentSurahs(student.id);
          
          // جلب شهادات الطالب
          const certificatesData = await studentCertificatesService.getStudentCertificates(student.id);

          return {
            id: student.id,
            image: student.image || "/logo.png",
            name: student.name,
            username: student.username,
            paymentType: student.payment_type,
            attendance: student.attendance || "",
            paymentStatus: student.is_paid ? "تم الدفع" : "لم يتم الدفع",
            notes: student.notes,
            totalSessions: student.total_sessions,
            attendedSessions: parseInt(student.attendance?.split('/')[0]) || 0,
            isPaid: student.is_paid,
            schedules: schedulesData?.map(s => ({ day: s.day, time: s.time })) || [],
            surahs: surahsData?.map(s => ({ name: s.name, rating: s.rating })) || [],
            certificates: certificatesData?.map(c => c.url) || [],
            nextLesson: student.next_lesson_surah || ""
          };
        }));

        setStudents(formattedStudents);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب بيانات الطلاب",
          variant: "destructive",
        });
        setLoading(false);
      }
    }

    fetchStudents();
  }, [toast]);

  // تصفية الطلاب حسب كلمة البحث
  const filteredStudents = students.filter(student => 
    student.name.includes(searchQuery) || 
    student.username.includes(searchQuery)
  );

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      try {
        // حذف بيانات الطالب من Firebase
        await studentsService.deleteStudent(studentToDelete.id);

        // تحديث حالة التطبيق بعد الحذف
        setStudents(students.filter(s => s.id !== studentToDelete.id));

        toast({
          title: "تم حذف الطالب",
          description: `تم حذف الطالب ${studentToDelete.name} بنجاح`,
        });
      } catch (error: any) {
        console.error('Error deleting student:', error);
        toast({
          title: "خطأ في حذف الطالب",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const saveEditedStudent = async (updatedStudent: Student) => {
    try {
      // Update attendance value
      const attendanceValue = updatedStudent.paymentType === "شهري" 
        ? `${updatedStudent.attendedSessions} / ${updatedStudent.totalSessions}` 
        : "0 / 0";
      
      // إنشاء كائن التحديث مع استبعاد القيم undefined
      const updateData: any = {
        name: updatedStudent.name || '',
        username: updatedStudent.username || '',
        image: updatedStudent.image || '',
        payment_type: updatedStudent.paymentType || '',
        is_paid: updatedStudent.isPaid || false,
        attendance: attendanceValue,
        notes: updatedStudent.notes || '',
        total_sessions: updatedStudent.totalSessions || 0,
        next_lesson_surah: updatedStudent.nextLesson || ""
      };

      // إضافة password فقط إذا كان له قيمة
      if (updatedStudent.password && updatedStudent.password.trim() !== '') {
        updateData.password = updatedStudent.password;
      }
      
      // تحديث بيانات الطالب في Firebase
      await studentsService.updateStudent(updatedStudent.id, updateData);

      // حذف المواعيد الحالية وإضافة المواعيد الجديدة
      if (updatedStudent.schedules && updatedStudent.schedules.length > 0) {
        await studentSchedulesService.deleteStudentSchedules(updatedStudent.id);
        
        const schedulesPromises = updatedStudent.schedules.map(schedule => 
          studentSchedulesService.addStudentSchedule({
            student_id: updatedStudent.id,
            day: schedule.day,
            time: schedule.time
          })
        );
        await Promise.all(schedulesPromises);
      }

      // حذف السور الحالية وإضافة السور الجديدة
      if (updatedStudent.surahs && updatedStudent.surahs.length > 0) {
        await studentSurahsService.deleteStudentSurahs(updatedStudent.id);
        
        const surahsPromises = updatedStudent.surahs.map(surah => 
          studentSurahsService.addStudentSurah({
            student_id: updatedStudent.id,
            name: surah.name,
            rating: surah.rating
          })
        );
        await Promise.all(surahsPromises);
      }

      // حذف الشهادات الحالية وإضافة الشهادات الجديدة
      if (updatedStudent.certificates && updatedStudent.certificates.length > 0) {
        await studentCertificatesService.deleteStudentCertificates(updatedStudent.id);
        
        const certificatesPromises = updatedStudent.certificates.map(certificate => 
          studentCertificatesService.addStudentCertificate({
            student_id: updatedStudent.id,
            url: certificate
          })
        );
        await Promise.all(certificatesPromises);
      }

      // تحديث حالة التطبيق
      setStudents(students.map(s => 
        s.id === updatedStudent.id ? updatedStudent : s
      ));

      toast({
        title: "تم تحديث بيانات الطالب",
        description: `تم تحديث بيانات الطالب ${updatedStudent.name} بنجاح`,
      });
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "خطأ في تحديث بيانات الطالب",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner w-10 h-10"></div>
        <span className="mr-4 text-gray-600 text-lg font-medium">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="text-white" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد نتائج</h3>
        <p className="text-gray-500">لم يتم العثور على طلاب يطابقون معايير البحث</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="flex items-center">

          <div>
            <h3 className="text-xl font-bold text-gray-800">قائمة الطلاب</h3>
            <p className="text-gray-600">إجمالي الطلاب: {filteredStudents.length}</p>
          </div>
        </div>

      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card-enhanced hover-lift group">
            <div className="card-body-enhanced">
              {/* Student Header */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={student.image} 
                      alt={student.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/logo.png";
                      }}
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    student.isPaid ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="mr-2 flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{student.name}</h4>
                  <p className="text-gray-600 text-sm">@{student.username}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={student.isPaid ? "badge-success" : "badge-error"}>
                      {student.paymentStatus}
                    </Badge>
                    <Badge className="badge-info">{student.paymentType}</Badge>
                  </div>
                </div>
              </div>

              {/* Student Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{student.attendedSessions || 0}</div>
                  <div className="text-xs text-gray-600">جلسات حضرها</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{student.surahs?.length || 0}</div>
                  <div className="text-xs text-gray-600">سور مكلف بها</div>
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-3 mb-6">
                {student.schedules && student.schedules.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{student.schedules[0].day} - {student.schedules[0].time}</span>
                  </div>
                )}
                {student.nextLesson && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                    <span>الدرس القادم: {student.nextLesson}</span>
                  </div>
                )}
                {student.certificates && student.certificates.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>{student.certificates.length} شهادة</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 button-primary text-sm"
                  onClick={() => handleEditStudent(student)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
                <Button 
                  className="button-danger text-sm px-4"
                  onClick={() => handleDeleteStudent(student)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      {editDialogOpen && studentToEdit && (
        <EditStudentDialog
          student={studentToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={saveEditedStudent}
        />
      )}

      {deleteDialogOpen && studentToDelete && (
        <DeleteStudentDialog
          studentName={studentToDelete.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteStudent}
        />
      )}
    </div>
  );
};
