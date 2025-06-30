import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cloudinaryService, UploadResult, testCloudinaryConfig } from '@/integrations/cloudinary/services';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (result: UploadResult) => void;
  currentImage?: string;
  className?: string;
  folder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className = '',
  folder = 'students'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // اختبار التكوين عند تحميل المكون
  useEffect(() => {
    const config = testCloudinaryConfig();
    if (!config.isValid) {
      toast({
        title: "تحذير",
        description: "تكوين Cloudinary قد لا يكون صحيحاً. يرجى التحقق من الإعدادات.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // تحديث المعاينة عند تغيير الصورة الحالية
  useEffect(() => {
    setPreviewUrl(currentImage || null);
  }, [currentImage]);

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

    // إنشاء معاينة فورية
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    
    try {
      console.log('Starting file upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder
      });

      const result = await cloudinaryService.uploadImage(file, folder);
      
      console.log('Upload successful:', result);
      
      setPreviewUrl(result.secureUrl);
      onImageUpload(result);
      
      toast({
        title: "نجح",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'حدث خطأ أثناء رفع الصورة';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      
      // إعادة تعيين المعاينة في حالة الخطأ
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload({ url: '', publicId: '', secureUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* عنوان القسم */}
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
          <ImageIcon className="text-white sm:w-4 sm:h-4" size={14} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800">صورة الطالب</h3>
      </div>

      {/* منطقة رفع الملف */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-blue-400 transition-colors duration-300 bg-gradient-to-r from-gray-50 to-blue-50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!previewUrl ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Upload className="text-white sm:w-8 sm:h-8" size={24} />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">رفع صورة الطالب</h4>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                اسحب وأفلت الصورة هنا، أو اضغط لاختيار ملف
              </p>
              <Button
                onClick={triggerFileSelect}
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
                    اختيار صورة
                  </div>
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              JPG, PNG, GIF حتى 5MB
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="معاينة الصورة"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl object-cover shadow-lg border-4 border-white"
              />
              <Button
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                disabled={isUploading}
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <div>
              <p className="text-green-600 font-medium text-sm sm:text-base">تم رفع الصورة بنجاح</p>
              <Button
                onClick={triggerFileSelect}
                disabled={isUploading}
                className="button-secondary mt-2 w-full sm:w-auto"
              >
                تغيير الصورة
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
        <p className="text-blue-700 text-xs sm:text-sm font-medium">
          💡 نصيحة: اختر صورة واضحة للطالب لتسهيل التعرف عليه
        </p>
      </div>
    </div>
  );
};