import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, BookOpen, Award, TrendingUp, Plus, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StudentsTable } from "@/components/admin/StudentsTable";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { studentsService } from "@/integrations/firebase/services";
import type { Student } from "@/integrations/firebase/types";

const AdminPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsService.getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // حساب الإحصائيات
  const totalStudents = students.length;
  const activeStudents = students.length; // جميع الطلاب نشطون افتراضياً
  const completedStudents = 0; // سيتم إضافته لاحقاً
  const newStudents = students.filter(s => {
    const createdAt = new Date(s.created_at || '');
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30;
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <div className="flex flex-col gap-4 lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6">
            <div className="w-full lg:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 font-cairo text-center lg:text-right">
                لوحة إدارة الطلاب
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 inline-block text-center lg:text-right w-full lg:w-auto">
                إدارة شاملة لطلاب تحفيظ القرآن الكريم
              </p>
            </div>
            <Button 
              className="button-primary text-xs sm:text-sm lg:text-base px-4 sm:px-6 py-2 sm:py-3 font-bold w-full lg:w-auto"
              onClick={() => navigate("/admin/add-student")}
            >
              <Plus className="ml-2 sm:ml-3 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              إضافة طالب جديد
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" style={{animationDelay: '0.2s'}}>
          <div className="card-enhanced hover-lift">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm font-bold mb-1 sm:mb-2">إجمالي الطلاب</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalStudents}</p>
                  <p className="text-green-600 text-xs sm:text-sm font-medium mt-1">+12% هذا الشهر</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Users className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm font-bold mb-1 sm:mb-2">الطلاب النشطون</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{activeStudents}</p>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium mt-1">جميع الطلاب نشطون</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <TrendingUp className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm font-bold mb-1 sm:mb-2">الطلاب الجدد</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{newStudents}</p>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium mt-1">آخر 30 يوم</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <BookOpen className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-xs sm:text-sm font-bold mb-1 sm:mb-2">المكتملون</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{completedStudents}</p>
                  <p className="text-yellow-600 text-xs sm:text-sm font-medium mt-1">حفظ كامل</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Award className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Table Section */}
        <div className="card-enhanced" style={{animationDelay: '0.4s'}}>
          <div className="card-header-enhanced">
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center lg:text-right">
              قائمة الطلاب
            </h3>
          </div>
          
          <div className="card-body-enhanced">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 relative">
              <div className="relative">
                <Input
                  className="form-input pl-10 sm:pl-12 pr-4 text-xs sm:text-sm lg:text-base"
                  placeholder="البحث عن طالب بالاسم أو اسم المستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {loading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="loading-spinner w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"></div>
                  <span className="mr-2 sm:mr-4 text-gray-600 text-xs sm:text-sm lg:text-base font-medium">جاري تحميل البيانات...</span>
                </div>
              ) : (
                <StudentsTable searchQuery={searchQuery} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-enhanced" style={{animationDelay: '0.6s'}}>
          <div className="card-header-enhanced">
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center lg:text-right">
              النشاط الأخير
            </h3>
          </div>
          <div className="card-body-enhanced">
            <div className="space-y-3 sm:space-y-4">
              {students.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl border border-gray-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-lg mr-3 sm:mr-4 flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm lg:text-base truncate">{student.name}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">تم تسجيله في {new Date(student.created_at || '').toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="badge-success text-xs sm:text-sm flex-shrink-0">نشط</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
