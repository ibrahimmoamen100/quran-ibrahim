import { useState, useEffect } from "react";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  studentsService, 
  studentSchedulesService, 
  studentSurahsService, 
  studentCertificatesService 
} from "@/integrations/firebase/services";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock, 
  Star,
  CheckCircle,
  PlayCircle
} from "lucide-react";

interface StudentData {
  id: string;
  name: string;
  username: string;
  image: string;
  paymentType: string;
  isPaid: boolean;
  totalSessions?: number;
  attendedCount?: number;
  surahs: { name: string; rating: number }[];
  nextLesson: {
    surah: string;
    verses: string;
  };
  schedule: { day: string; time: string }[];
  certificates: string[];
}

const StudentDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Setting the current date in Arabic format
    const today = new Date();
    setCurrentDate(`${today.getHours()}:${today.getMinutes().toString().padStart(2, '0')} | ${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`);
  }, []);

  // التحقق من وجود معرف الطالب في التخزين المحلي
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    
    if (!studentId) {
      toast({
        title: "غير مصرح",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    fetchStudentData(studentId);
  }, [toast, navigate]);

  // جلب بيانات الطالب من Firebase
  async function fetchStudentData(studentId: string) {
    try {
      setLoading(true);

      const student = await studentsService.getStudentById(studentId);

      if (!student) {
        setLoading(false);
        toast({
          title: "لا توجد بيانات",
          description: "لم يتم العثور على بيانات الطالب",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // جلب مواعيد الطالب
      const schedulesData = await studentSchedulesService.getStudentSchedules(student.id);

      // جلب السور المكلف بها الطالب
      const surahsData = await studentSurahsService.getStudentSurahs(student.id);

      // جلب شهادات الطالب
      const certificatesData = await studentCertificatesService.getStudentCertificates(student.id);

      // تحويل البيانات إلى التنسيق المطلوب
      const formattedStudent: StudentData = {
        id: student.id,
        name: student.name,
        username: student.username,
        image: student.image || "/logo.png",
        paymentType: student.payment_type,
        isPaid: student.is_paid || false,
        totalSessions: student.total_sessions,
        attendedCount: student.attendance ? parseInt(student.attendance.split('/')[0].trim()) : 0,
        surahs: surahsData?.map(s => ({ name: s.name, rating: s.rating })) || [],
        nextLesson: {
          surah: student.next_lesson_surah || "",
          verses: student.next_lesson_verses || "",
        },
        schedule: schedulesData?.map(s => ({ day: s.day, time: s.time })) || [],
        certificates: certificatesData?.map(c => c.url) || [],
      };

      setStudentData(formattedStudent);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب بيانات الطالب",
        variant: "destructive",
      });
      setLoading(false);
      navigate("/");
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
            <p className="text-gray-600 text-xl font-medium">جاري تحميل البيانات...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!studentData) {
    return (
      <StudentLayout>
        <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">👤</span>
            </div>
            <p className="text-gray-600 text-xl font-medium">لم يتم العثور على بيانات الطالب</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const attendancePercentage = studentData.totalSessions && studentData.totalSessions > 0 
    ? (studentData.attendedCount || 0) / studentData.totalSessions * 100 
    : 0;

  return (
    <StudentLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="order-2 lg:order-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 font-cairo">
                {studentData.name}
              </h1>
              <p className="text-gray-600 mb-4 dir-ltr font-mono text-lg">
                {studentData.username}@
              </p>
              <div className="flex items-center space-x-4 space-x-reverse">
            {studentData.isPaid ? (
                  <Badge className="badge-success text-lg px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    تم الدفع {studentData.paymentType === "شهري" ? "بالشهر" : "بالحلقة"}
                  </Badge>
            ) : (
                  <Badge className="badge-error text-lg px-4 py-2">
                    لم يتم الدفع
                  </Badge>
            )}
                <span className="text-sm text-gray-500 dir-ltr bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                  {currentDate}
                </span>
              </div>
          </div>
            <div className="flex items-center order-1 lg:order-2 mb-6 lg:mb-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-500 animate-pulse-slow"></div>
                <div className="relative bg-white rounded-full p-3 border-4 border-white shadow-2xl hover:scale-110 transition-all duration-500">
              <img
                src={studentData.image}
                alt={studentData.name}
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/logo.png";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="card-enhanced hover-lift">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold mb-2">الجلسات الحاضرة</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {studentData.attendedCount || 0}
                  </p>
                  <p className="text-blue-600 text-sm font-medium mt-1">
                    من {studentData.totalSessions || 0} جلسة
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="text-white" size={28} />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={attendancePercentage} className="h-3 bg-gray-200">
                  <div className="h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-500" 
                       style={{ width: `${attendancePercentage}%` }}></div>
                </Progress>
                <p className="text-xs text-gray-500 mt-2">{Math.round(attendancePercentage)}% معدل الحضور</p>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold mb-2">السور المكلف بها</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {studentData.surahs.length}
                  </p>
                  <p className="text-purple-600 text-sm font-medium mt-1">سورة مكلف بها</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold mb-2">الشهادات</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {studentData.certificates.length}
                  </p>
                  <p className="text-yellow-600 text-sm font-medium mt-1">شهادة محققة</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>

          <div className="card-enhanced hover-lift">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-bold mb-2">المستوى العام</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {studentData.surahs.length > 0 ? Math.round(studentData.surahs.reduce((acc, s) => acc + s.rating, 0) / studentData.surahs.length) : 0}
                  </p>
                  <p className="text-green-600 text-sm font-medium mt-1">من 5 نجوم</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Next Lesson Card */}
          <div className="lg:col-span-2">
            <div className="card-enhanced animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="card-header-enhanced">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  الدرس القادم
                </h2>
              </div>
              <div className="card-body-enhanced">
                {studentData.nextLesson.surah ? (
                  <div className="space-y-6">
                    <div className="flex items-center">

                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-2">
                          {studentData.nextLesson.surah}
                        </h3>
                        {studentData.nextLesson.verses && (
                          <p className="text-gray-600 text-lg">
                            الآيات: {studentData.nextLesson.verses}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="text-white" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">لا يوجد درس قادم محدد</h3>
                    <p className="text-gray-500">سيتم تحديد الدرس القادم من قبل المعلم</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="card-enhanced animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="card-header-enhanced">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                الجدول الزمني
              </h2>
            </div>
            <div className="card-body-enhanced">
              {studentData.schedule.length > 0 ? (
                <div className="space-y-4">
                  {studentData.schedule.map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{item.day}</h4>
                        <p className="text-gray-600">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <p className="text-gray-500">لم يتم تحديد جدول زمني بعد</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Surahs and Certificates Tabs */}
        <div className="mt-10">
          <Tabs defaultValue="surahs" className="tabs-enhanced">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="surahs" className="text-lg font-semibold">
                <BookOpen className="w-5 h-5 mr-2" />
                السور المكلف بها
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-lg font-semibold">
                <Award className="w-5 h-5 mr-2" />
                الشهادات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="surahs" className="space-y-6">
              <div className="card-enhanced">
                <div className="card-header-enhanced">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    السور المكلف بها
                  </h3>
                </div>
                <div className="card-body-enhanced">
                  {studentData.surahs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {studentData.surahs.map((surah, index) => (
                        <div key={index} className="card-enhanced hover-lift">
                          <div className="card-body-enhanced">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-bold text-gray-800">{surah.name}</h4>
                              <div className="flex space-x-1 space-x-reverse">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span 
                                    key={star} 
                                    className={`text-lg ${star <= surah.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                              <p className="text-purple-700 text-sm font-medium">
                                التقييم: {surah.rating}/10 نجوم
                              </p>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد سور مكلف بها</h3>
                      <p className="text-gray-500">سيتم إضافة السور المكلف بها من قبل المعلم</p>
                    </div>
                  )}
                </div>
                  </div>
          </TabsContent>
          
            <TabsContent value="certificates" className="space-y-6">
              <div className="card-enhanced">
                <div className="card-header-enhanced">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    الشهادات والإنجازات
                  </h3>
                </div>
                <div className="card-body-enhanced">
                {studentData.certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {studentData.certificates.map((certificate, index) => (
                        <div key={index} className="card-enhanced hover-lift">
                          <div className="card-body-enhanced">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Award className="text-white" size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 text-center mb-2">
                              شهادة إنجاز #{index + 1}
                            </h4>
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                              <p className="text-yellow-700 text-sm font-medium text-center">
                                شهادة محققة في حفظ القرآن الكريم
                              </p>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="text-white" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد شهادات بعد</h3>
                      <p className="text-gray-500">استمر في الحفظ لتحصل على شهادات الإنجاز</p>
                    </div>
                  )}
                </div>
              </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
