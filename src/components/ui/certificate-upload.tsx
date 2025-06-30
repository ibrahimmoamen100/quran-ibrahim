import React, { useState } from 'react';
import { Button } from './button';
import { Upload, X, Image as ImageIcon, Plus, Award } from 'lucide-react';
import { cloudinaryService, UploadResult } from '@/integrations/cloudinary/services';
import { useToast } from '@/hooks/use-toast';

interface CertificateUploadProps {
  onCertificatesChange: (certificates: string[]) => void;
  currentCertificates?: string[];
  className?: string;
  folder?: string;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({
  onCertificatesChange,
  currentCertificates = [],
  className = '',
  folder = 'certificates'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [certificates, setCertificates] = useState<string[]>(currentCertificates);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const { toast } = useToast();

  // تحديث الشهادات عند تغيير القيم الحالية
  React.useEffect(() => {
    setCertificates(currentCertificates);
  }, [currentCertificates]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    // تحذير للملفات الكبيرة
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "تحذير",
        description: "الملف كبير نسبياً، قد يستغرق الرفع وقتاً أطول",
        variant: "default",
      });
    }

    setIsUploading(true);
    setUploadProgress('جاري رفع الشهادة...');
    
    try {
      console.log('Starting certificate upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder
      });

      const result = await cloudinaryService.uploadImage(file, folder);
      
      console.log('Certificate upload successful:', result);
      
      const newCertificates = [...certificates, result.secureUrl];
      setCertificates(newCertificates);
      onCertificatesChange(newCertificates);
      
      toast({
        title: "نجح",
        description: "تم رفع الشهادة بنجاح",
      });
    } catch (error) {
      console.error('Certificate upload error:', error);
      
      let errorMessage = 'حدث خطأ أثناء رفع الشهادة';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleRemoveCertificate = (index: number) => {
    const newCertificates = certificates.filter((_, i) => i !== index);
    setCertificates(newCertificates);
    onCertificatesChange(newCertificates);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف الشهادة بنجاح",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // إعادة تعيين قيمة input للسماح باختيار نفس الملف مرة أخرى
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* عنوان القسم */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
          <Award className="text-white sm:w-4 sm:h-4" size={14} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">شهادات الطالب</h3>
      </div>

      {/* عرض الشهادات الحالية */}
      {certificates.length > 0 && (
        <div className="card-enhanced">
          <div className="p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4 flex items-center">
              <Award className="ml-2 sm:w-5 sm:h-5" size={18} />
              الشهادات المضافة ({certificates.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {certificates.map((cert, index) => (
                <div key={index} className="relative group">
                  <div className="image-container">
                    <img 
                      src={cert} 
                      alt={`شهادة ${index + 1}`} 
                      className="w-full h-20 sm:h-32 object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all duration-300 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-1 left-1 sm:top-2 sm:left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full shadow-lg"
                    onClick={() => handleRemoveCertificate(index)}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black bg-opacity-70 text-white text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-sm">
                    شهادة {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* منطقة رفع الشهادات */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-green-400 transition-colors duration-300 bg-gradient-to-r from-gray-50 to-green-50">
        {/* عرض التقدم */}
        {uploadProgress && (
          <div className="mb-3 sm:mb-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <div className="loading-spinner w-4 h-4 sm:w-5 sm:h-5"></div>
              <span className="text-blue-700 font-medium text-sm sm:text-base">{uploadProgress}</span>
            </div>
          </div>
        )}

        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-3 sm:mb-4">
          <Upload className="text-white sm:w-8 sm:h-8" size={24} />
        </div>
        
        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">رفع شهادات الطالب</h4>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
          اسحب وأفلت الشهادات هنا، أو اضغط لاختيار الملفات
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileUpload(file);
              };
              input.click();
            }}
            disabled={isUploading}
            className="button-primary w-full sm:w-auto"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                جاري الرفع...
              </div>
            ) : (
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                رفع شهادة واحدة
              </div>
            )}
          </Button>
          
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = true;
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  Array.from(files).forEach(file => handleFileUpload(file));
                }
              };
              input.click();
            }}
            disabled={isUploading}
            className="button-secondary w-full sm:w-auto"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="loading-spinner w-4 h-4 mr-2"></div>
                جاري الرفع...
              </div>
            ) : (
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                رفع عدة شهادات
              </div>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-3 sm:mt-4">
          JPG, PNG, GIF حتى 5MB لكل ملف
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
        <p className="text-green-700 text-xs sm:text-sm font-medium">
          💡 نصيحة: يمكنك رفع عدة شهادات في نفس الوقت لسهولة الإدارة
        </p>
      </div>
    </div>
  );
}; 