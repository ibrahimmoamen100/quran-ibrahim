import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, User } from "lucide-react";
import siteLogo from "@/assets/site-logo.png";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout = ({ children }: StudentLayoutProps) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    navigate("/");
  };
  
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="nav-enhanced py-4 px-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-lg blur-lg opacity-30 animate-pulse-slow"></div>
              <img src={siteLogo} alt="Logo" className="relative h-16 w-16 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800 font-cairo">
                نظام إدارة تحفيظ القرآن الكريم
              </h1>
              <p className="text-green-600 text-sm">للشيخ إبراهيم</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
              <User size={16} className="text-green-600" />
              <span className="font-medium">منطقة الطالب</span>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              className="btn-danger"
              onClick={handleLogout}
            >
              <LogOut size={16} className="ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2 space-x-reverse">
            <BookOpen size={16} className="text-green-600" />
            <span className="text-gray-600 font-medium">منطقة الطالب الشخصية</span>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
            <span>© 2025 جميع الحقوق محفوظة</span>
            <span>•</span>
            <span>نظام إدارة تحفيظ القرآن الكريم</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
