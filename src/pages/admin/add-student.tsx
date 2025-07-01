import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ArrowLeft, Save, UserPlus, Calendar, BookOpen, CreditCard, Award } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { WeeklySchedule } from "@/components/admin/WeeklySchedule";
import { SurahSelector } from "@/components/admin/SurahSelector";
import { ImageUpload } from "@/components/ui/image-upload";
import { CertificateUpload } from "@/components/ui/certificate-upload";
import { 
  studentsService, 
  studentSchedulesService, 
  studentSurahsService, 
  studentCertificatesService 
} from "@/integrations/firebase/services";
import { UploadResult } from "@/integrations/cloudinary/services";

const AddStudent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    username: "",
    image: "",
    password: "",
  });
  const [uploadedImage, setUploadedImage] = useState<UploadResult | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({
    paymentType: "monthly", // or "perSession"
    totalSessions: 12,
    attendedSessions: 0,
    isPaid: false,
  });
  const [schedules, setSchedules] = useState<{day: string, time: string}[]>([]);
  const [surahs, setSurahs] = useState<{name: string, rating: number}[]>([]);
  const [notes, setNotes] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [nextLesson, setNextLesson] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (result: UploadResult) => {
    console.log('Image upload result received:', result);
    setUploadedImage(result);
    setPersonalInfo(prev => ({
      ...prev,
      image: result.secureUrl
    }));
    console.log('Personal info updated with image:', result.secureUrl);
  };

  const handleAddSurah = (surahName: string) => {
    if (!surahs.some(s => s.name === surahName)) {
      setSurahs([...surahs, { name: surahName, rating: 0 }]);
    }
  };

  const increaseAttendedSessions = () => {
    if (paymentInfo.attendedSessions < paymentInfo.totalSessions) {
      setPaymentInfo({
        ...paymentInfo,
        attendedSessions: paymentInfo.attendedSessions + 1
      });
    }
  };

  const decreaseAttendedSessions = () => {
    if (paymentInfo.attendedSessions > 0) {
      setPaymentInfo({
        ...paymentInfo,
        attendedSessions: paymentInfo.attendedSessions - 1
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current form data:', {
      personalInfo,
      uploadedImage,
      paymentInfo,
      schedules,
      surahs,
      certificates,
      notes,
      nextLesson
    });
    
    // Validate form
    if (!personalInfo.name || !personalInfo.username) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملئ جميع الحقول الإلزامية",
        variant: "destructive",
      });
      return;
    }

    // التحقق من الصورة
    if (!personalInfo.image || personalInfo.image === '/logo.png') {
      console.log('No custom image uploaded, using default logo');
    } else {
      console.log('Custom image will be used:', personalInfo.image);
    }

    setLoading(true);
    
    try {
      console.log("Starting to add student...");
      
      // إضافة الطالب إلى قاعدة البيانات
      const paymentType = paymentInfo.paymentType === "monthly" ? "شهري" : "بالحلقة";
      const paymentStatus = paymentInfo.isPaid ? "تم الدفع" : "لم يتم الدفع";
      const attendanceValue = paymentInfo.paymentType === "monthly" 
        ? `${paymentInfo.attendedSessions} / ${paymentInfo.totalSessions}` 
        : "0 / 0";

      const studentData = {
        name: personalInfo.name,
        username: personalInfo.username,
        image: personalInfo.image || "/logo.png",
        payment_type: paymentType,
        attendance: attendanceValue,
        payment_status: paymentStatus,
        notes: notes,
        total_sessions: paymentInfo.totalSessions,
        is_paid: paymentInfo.isPaid,
        next_lesson_surah: nextLesson,
        password: personalInfo.password || "123456"  // استخدام كلمة مرور افتراضية إذا لم يتم تحديدها
      };

      console.log("Student data to add:", studentData);

      const studentId = await studentsService.addStudent(studentData);

      console.log("Student added successfully with ID:", studentId);

      // إضافة مواعيد الطالب
      if (schedules.length > 0) {
        console.log("Adding schedules...");
        const schedulesPromises = schedules.map(schedule => 
          studentSchedulesService.addStudentSchedule({
            student_id: studentId,
            day: schedule.day,
            time: schedule.time
          })
        );
        await Promise.all(schedulesPromises);
        console.log("Schedules added successfully");
      }

      // إضافة السور المكلف بها الطالب
      if (surahs.length > 0) {
        console.log("Adding surahs...");
        const surahsPromises = surahs.map(surah => 
          studentSurahsService.addStudentSurah({
            student_id: studentId,
            name: surah.name,
            rating: surah.rating
          })
        );
        await Promise.all(surahsPromises);
        console.log("Surahs added successfully");
      }

      // إضافة شهادات الطالب
      if (certificates.length > 0) {
        console.log("Adding certificates...");
        const certificatesPromises = certificates.map(url => 
          studentCertificatesService.addStudentCertificate({
            student_id: studentId,
            url
          })
        );
        await Promise.all(certificatesPromises);
        console.log("Certificates added successfully");
      }

      toast({
        title: "تم إضافة الطالب بنجاح",
        description: `تم إضافة الطالب ${personalInfo.name} بنجاح`,
      });
      
      setLoading(false);
      navigate("/admin");
    } catch (error: any) {
      console.error('Error adding student:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = "حدث خطأ أثناء إضافة الطالب";
      
      if (error.code === 'permission-denied') {
        errorMessage = "خطأ في الصلاحيات: تأكد من تكوين قواعد الأمان في Firebase";
      } else if (error.code === 'unavailable') {
        errorMessage = "خطأ في الاتصال: تأكد من اتصال الإنترنت";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "خطأ في إضافة الطالب",
        description: errorMessage,
        variant: "destructive",
      });
      
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-2 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-4 p-2 hover:bg-white/50 rounded-xl"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-cairo">
                  إضافة طالب جديد
                </h1>
                <p className="text-gray-600 text-xl bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block mt-2">
                  تسجيل طالب جديد في نظام تحفيظ القرآن الكريم
                </p>
              </div>
            </div>
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <UserPlus className="text-white" size={36} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card-enhanced animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="card-header-enhanced">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              بيانات الطالب
            </h2>
            <p className="text-gray-600 mt-2 text-lg">
              قم بملء جميع البيانات المطلوبة لإضافة الطالب
            </p>
          </div>
          
          <div className="card-body-enhanced">
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="personal" className="tabs-enhanced relative">
                <TabsList className="flex flex-col w-full grid-cols-2 mb-8 relative h-auto">
                  <TabsTrigger value="personal" className="text-lg font-semibold">
                    <UserPlus className="w-5 h-5 mr-2" />
                    البيانات الشخصية
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-lg font-semibold">
                    <Calendar className="w-5 h-5 mr-2" />
                    الجدول الزمني
                  </TabsTrigger>
                  <TabsTrigger value="surahs" className="text-lg font-semibold">
                    <BookOpen className="w-5 h-5 mr-2" />
                    السور المكلف بها
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="text-lg font-semibold">
                    <CreditCard className="w-5 h-5 mr-2" />
                    معلومات الدفع
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="text-lg font-semibold">
                    <Award className="w-5 h-5 mr-2" />
                    الشهادات
                  </TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="form-group">
                        <label className="form-label">الاسم الكامل *</label>
                        <Input
                          className="form-input text-lg"
                          placeholder="أدخل الاسم الكامل للطالب"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">اسم المستخدم *</label>
                        <Input
                          className="form-input text-lg"
                          placeholder="أدخل اسم المستخدم"
                          value={personalInfo.username}
                          onChange={(e) => setPersonalInfo({...personalInfo, username: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">كلمة المرور</label>
                        <Input
                          className="form-input text-lg"
                          type="password"
                          placeholder="أدخل كلمة المرور (اختياري)"
                          value={personalInfo.password}
                          onChange={(e) => setPersonalInfo({...personalInfo, password: e.target.value})}
                        />
                        <p className="text-sm text-gray-500 mt-2">سيتم استخدام "123456" ككلمة مرور افتراضية إذا لم يتم تحديدها</p>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">الدرس القادم</label>
                        <Input
                          className="form-input text-lg"
                          placeholder="أدخل اسم السورة أو الدرس القادم"
                          value={nextLesson}
                          onChange={(e) => setNextLesson(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="form-group">
                        <label className="form-label">صورة الطالب</label>
                        <ImageUpload onImageUpload={handleImageUpload} />
                        {uploadedImage && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <p className="text-green-700 text-sm font-medium">تم رفع الصورة بنجاح</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">ملاحظات</label>
                        <Textarea
                          className="form-textarea text-lg"
                          placeholder="أدخل أي ملاحظات إضافية"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-8">
                  <div className="card-enhanced">
                    <div className="card-header-enhanced">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        الجدول الزمني للحفظ
                      </h3>
                    </div>
                    <div className="card-body-enhanced">
                      <WeeklySchedule 
                        schedules={schedules} 
                        setSchedules={setSchedules} 
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Surahs Tab */}
                <TabsContent value="surahs" className="space-y-8">
                  <div className="card-enhanced">
                    <div className="card-header-enhanced">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        السور المكلف بها الطالب
                      </h3>
                    </div>
                    <div className="card-body-enhanced">
                      <SurahSelector 
                        selectedSurahs={surahs} 
                        onAddSurah={handleAddSurah}
                        onRemoveSurah={(name) => setSurahs(surahs.filter(s => s.name !== name))}
                        onRatingChange={(name, rating) => {
                          setSurahs(surahs.map(s => s.name === name ? {...s, rating} : s));
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="form-group">
                        <label className="form-label">نوع الدفع</label>
                        <Select 
                          value={paymentInfo.paymentType} 
                          onValueChange={(value) => setPaymentInfo({...paymentInfo, paymentType: value})}
                        >
                          <SelectTrigger className="select-enhanced text-lg">
                            <SelectValue placeholder="اختر نوع الدفع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">شهري</SelectItem>
                            <SelectItem value="perSession">بالحلقة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">عدد الجلسات الإجمالي</label>
                        <Input
                          className="form-input text-lg"
                          type="number"
                          placeholder="أدخل عدد الجلسات"
                          value={paymentInfo.totalSessions}
                          onChange={(e) => setPaymentInfo({...paymentInfo, totalSessions: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="form-group">
                        <label className="form-label">الجلسات التي حضرها</label>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <Button 
                            type="button" 
                            className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white"
                            onClick={decreaseAttendedSessions}
                          >
                            <Minus className="w-6 h-6" />
                          </Button>
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {paymentInfo.attendedSessions}
                          </div>
                          <Button 
                            type="button" 
                            className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            onClick={increaseAttendedSessions}
                          >
                            <Plus className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">حالة الدفع</label>
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <input
                            type="checkbox"
                            id="isPaid"
                            checked={paymentInfo.isPaid}
                            onChange={(e) => setPaymentInfo({...paymentInfo, isPaid: e.target.checked})}
                            className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-xl focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="isPaid" className="text-lg font-medium text-gray-700">
                            تم دفع الرسوم
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Certificates Tab */}
                <TabsContent value="certificates" className="space-y-8">
                  <div className="card-enhanced">
                    <div className="card-header-enhanced">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        شهادات الطالب
                      </h3>
                    </div>
                    <div className="card-body-enhanced">
                      <CertificateUpload 
                        onCertificatesChange={setCertificates} 
                        currentCertificates={certificates}
                        folder="certificates"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Submit Button */}
              <div className="flex justify-end mt-12">
                <Button
                  type="submit"
                  className="button-primary text-xl px-12 py-4 font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-6 h-6 mr-3"></div>
                      جاري الإضافة...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-6 h-6 mr-3" />
                      إضافة الطالب
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddStudent;
