import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Settings, Home, Menu, X } from "lucide-react";
import siteLogo from "@/assets/site-logo.png";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="nav-enhanced py-3 sm:py-4 px-4 sm:px-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-lg blur-lg opacity-30 animate-pulse-slow"></div>
              <img src='./logo.png' alt="Logo" className="relative h-12 w-12 sm:h-16 sm:w-16 object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 font-cairo">
                نظام إدارة تحفيظ القرآن الكريم
              </h1>
              <p className="text-green-600 text-xs sm:text-sm">للشيخ إبراهيم</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4 space-x-reverse">
            <Link 
              to="/"
              className="nav-link flex items-center px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
            >
              <Home size={16} className="ml-2" />
              <span className="text-sm sm:text-base">الرئيسية</span>
            </Link>
            
            <Button 
              variant="outline"
              size="sm"
              className="btn-danger text-xs sm:text-sm"
              onClick={handleLogout}
            >
              <LogOut size={14} className="ml-2" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
              <span className="sm:hidden">خروج</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center space-x-3 space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/"
                className="nav-link flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={16} className="ml-3" />
                الرئيسية
              </Link>
              
              <Button 
                variant="outline"
                size="sm"
                className="btn-danger w-full justify-start"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} className="ml-3" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        )}

        {/* Date Display */}
        <div className="flex justify-center sm:justify-end mt-3 sm:mt-0">
          <span className="text-xs sm:text-sm text-gray-600 font-mono dir-ltr bg-white/50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
            {currentDate}
          </span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Users size={12} className="text-green-600" />
            <span className="text-gray-600 font-medium text-xs sm:text-sm lg:text-base">لوحة تحكم المسؤول</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 sm:space-x-reverse text-xs sm:text-sm text-gray-500">
            <span>© 2025 جميع الحقوق محفوظة</span>
            <span className="hidden sm:inline">•</span>
            <span>نظام إدارة تحفيظ القرآن الكريم</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
