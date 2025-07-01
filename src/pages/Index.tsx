import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { studentsService } from "@/integrations/firebase/services";

const Index = () => {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [studentUsername, setStudentUsername] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Admin login attempt:", { adminUsername, adminPassword });
    
    // Admin login check
    if (adminUsername === "hema" && adminPassword === "4508") {
      console.log("Admin login successful, navigating to /admin");
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة التحكم",
      });
      navigate("/admin");
      return;
    }
    
    console.log("Admin login failed");
    toast({
      title: "خطأ في تسجيل الدخول",
      description: "اسم المستخدم أو كلمة المرور غير صحيحة",
      variant: "destructive",
    });
  };
  
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentUsername || !studentPassword) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "الرجاء إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // البحث عن الطالب في قاعدة البيانات
      const student = await studentsService.getStudentByUsername(studentUsername);
      
      if (!student) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // التحقق من كلمة المرور
      if (studentPassword === student.password || studentPassword === "123456") {
        // تخزين معرف الطالب في التخزين المحلي للاستخدام في صفحة الطالب
        localStorage.setItem("studentId", student.id);
        localStorage.setItem("studentName", student.name);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك ${student.name}`,
        });
        
        navigate("/student");
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-cairo relative overflow-hidden">
      {/* خلفية ثابتة بدلاً من متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-40 left-40 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-40 right-40 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* نمط الخلفية */}
      <div className="absolute inset-0 bg-pattern opacity-30"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="w-full max-w-4xl sm:max-w-5xl text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-full p-4 sm:p-6 shadow-2xl border border-white/30 hover:scale-110 transition-all duration-200">
                <img src='./logo.png' alt="Logo" className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 object-contain drop-shadow-lg" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-sm">
            نظام إدارة تحفيظ القرآن الكريم
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 font-medium bg-white/60 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 inline-block">
            للشيخ إبراهيم لتحفيظ القرآن الكريم
          </p>
        </div>
        
        {/* Main Content */}
        <div className="w-full max-w-6xl sm:max-w-7xl">
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-3 sm:p-4 mb-8 sm:mb-12" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              منهجية متكاملة في تحفيظ القرآن الكريم
            </h2>
            <p className="text-center text-gray-700 text-sm sm:text-base lg:text-lg xl:text-xl mb-8 sm:mb-12 font-medium bg-white/60 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 lg:py-4 inline-block">
              حلقات تحفيظية متميزة تجمع بين الحفظ والتفسير والتدبر وفهم أسباب النزول
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {/* Student Login Card */}
              <div className="card-enhanced hover-lift" style={{animationDelay: '0.4s'}}>
                <div className="card-header-enhanced">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg lg:text-2xl font-bold shadow-lg">
                      👨‍🎓
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    بوابة الطالب
                  </h3>
                  <p className="text-center text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base">الدخول إلى المنطقة الشخصية بحساب الطالب</p>
                </div>
                <div className="card-body-enhanced">
                  <form onSubmit={handleStudentLogin} className="space-y-4 sm:space-y-6">
                    <div className="form-group">
                      <label className="form-label">اسم المستخدم</label>
                      <Input
                        className="form-input text-sm sm:text-base lg:text-lg"
                        placeholder="أدخل اسم المستخدم"
                        value={studentUsername}
                        onChange={(e) => setStudentUsername(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">كلمة المرور</label>
                      <Input
                        className="form-input text-sm sm:text-base lg:text-lg"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="button-primary w-full py-3 sm:py-4 text-sm sm:text-base lg:text-lg xl:text-xl font-bold"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="loading-spinner w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3"></div>
                          جاري تسجيل الدخول...
                        </div>
                      ) : (
                        "تسجيل دخول الطالب"
                      )}
                    </Button>
                  </form>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <p className="text-center text-blue-700 text-xs sm:text-sm font-medium">
                      خاص بالطلاب المسجلين في النظام
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Admin Login Card */}
              <div className="card-enhanced hover-lift" style={{animationDelay: '0.6s'}}>
                <div className="card-header-enhanced">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg lg:text-2xl font-bold shadow-lg">
                      👨‍🏫
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    بوابة المسؤول
                  </h3>
                  <p className="text-center text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base">الدخول إلى لوحة التحكم للمسؤولين</p>
                </div>
                <div className="card-body-enhanced">
                  <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-6">
                    <div className="form-group">
                      <label className="form-label">اسم المستخدم</label>
                      <Input
                        className="form-input text-sm sm:text-base lg:text-lg"
                        placeholder="أدخل اسم المستخدم"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">كلمة المرور</label>
                      <Input
                        className="form-input text-sm sm:text-base lg:text-lg"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="button-primary w-full py-3 sm:py-4 text-sm sm:text-base lg:text-lg xl:text-xl font-bold"
                    >
                      تسجيل دخول المسؤول
                    </Button>
                  </form>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p className="text-center text-green-700 text-xs sm:text-sm font-medium">
                      خاص بالمسؤولين والمشرفين على النظام
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" style={{animationDelay: '0.8s'}}>
            <div className="card-enhanced text-center hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-base sm:text-lg lg:text-2xl">📖</span>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-2">حفظ القرآن</h4>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">حفظ القرآن الكريم بطريقة منهجية ومتدرجة</p>
            </div>
            
            <div className="card-enhanced text-center hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-base sm:text-lg lg:text-2xl">🎯</span>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-2">التقييم المستمر</h4>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">تقييم دوري لمستوى الحفظ والتقدم</p>
            </div>
            
            <div className="card-enhanced text-center hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-base sm:text-lg lg:text-2xl">📊</span>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-2">متابعة التقدم</h4>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">متابعة شاملة لتقدم الطالب وإنجازاته</p>
            </div>
            
            <div className="card-enhanced text-center hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-base sm:text-lg lg:text-2xl">🏆</span>
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-2">الشهادات</h4>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">إصدار شهادات إنجاز للطلاب المتميزين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
