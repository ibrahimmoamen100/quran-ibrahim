import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Settings, Home } from "lucide-react";
import siteLogo from "@/assets/site-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  
  useEffect(() => {
    // Setting the current date in Arabic format
    const today = new Date();
    setCurrentDate(`${today.getHours()}:${today.getMinutes().toString().padStart(2, '0')} | ${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`);
  }, []);
  
  const handleLogout = () => {
    navigate("/");
  };

  const handleHome = () => {
    navigate("/admin");
  };
  
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="nav-enhanced py-4 px-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-lg blur-lg opacity-30 animate-pulse-slow"></div>
              <img src='./logo.png' alt="Logo" className="relative h-16 w-16 object-contain" />
            </div>

          </div>
          
          <div className="flex items-center flex-row md:flex-row justify-between">
            <Link 
              to="/"
              className="nav-link"
            >
              <Home size={16} className="ml-2" />
              الرئيسية
            </Link>
            

            
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
          <span className="text-sm text-gray-600 font-mono dir-ltr bg-white/50 px-3 py-1 rounded-lg">
              {currentDate}
            </span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Users size={16} className="text-green-600" />
            <span className="text-gray-600 font-medium">لوحة تحكم المسؤول</span>
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
