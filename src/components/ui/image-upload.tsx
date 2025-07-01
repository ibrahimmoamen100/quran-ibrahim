import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cloudinaryService, UploadResult, testCloudinaryConfig } from '@/integrations/cloudinary/services';
import { validateCloudinaryConfig } from '@/integrations/cloudinary/config';

interface ImageUploadProps {
  onImageUpload: (result: UploadResult) => void;
  currentImage?: string;
  className?: string;
  folder?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  className = '',
  folder = 'students',
  onUploadingChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // اختبار التكوين عند تحميل المكون
  useEffect(() => {
    console.log('ImageUpload component mounted');
    
    // اختبار التكوين المحسن
    const isValid = validateCloudinaryConfig();
    console.log('Config validation result:', isValid);
    
    const config = testCloudinaryConfig();
    console.log('Cloudinary config test result:', config);
    
    if (!isValid || !config.isValid) {
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
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB كحد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت. يرجى ضغط الصورة أو اختيار صورة أصغر",
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
    if (onUploadingChange) onUploadingChange(true);
    
    try {
      console.log('Starting file upload to Cloudinary...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder,
        timestamp: new Date().toISOString()
      });

      // اختبار التكوين قبل الرفع
      const config = testCloudinaryConfig();
      console.log('Cloudinary config before upload:', config);

      if (!config.isValid) {
        throw new Error('تكوين Cloudinary غير صحيح. يرجى التحقق من الإعدادات.');
      }

      const result = await cloudinaryService.uploadImage(file, folder);
      
      console.log('Upload successful:', result);
      
      setPreviewUrl(result.secureUrl);
      onImageUpload(result);
      
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم حفظ الصورة في السحابة وعرضها بنجاح",
      });
    } catch (error) {
      console.error('Upload error details:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'حدث خطأ أثناء رفع الصورة';
      let errorTitle = 'خطأ في رفع الصورة';
      
      if (error instanceof Error) {
        const message = error.message;
        
        // تحليل رسائل الخطأ الشائعة
        if (message.includes('Upload preset not found')) {
          errorTitle = 'خطأ في إعدادات Cloudinary';
          errorMessage = 'Upload Preset غير موجود. يرجى التحقق من إعدادات Cloudinary';
        } else if (message.includes('Cloud name not found')) {
          errorTitle = 'خطأ في إعدادات Cloudinary';
          errorMessage = 'اسم السحابة غير صحيح. يرجى التحقق من إعدادات Cloudinary';
        } else if (message.includes('Network error')) {
          errorTitle = 'خطأ في الاتصال';
          errorMessage = 'فشل الاتصال بـ Cloudinary. تحقق من اتصال الإنترنت';
        } else if (message.includes('Timeout')) {
          errorTitle = 'انتهت مهلة الاتصال';
          errorMessage = 'انتهت مهلة الاتصال. جرب مرة أخرى أو تحقق من سرعة الإنترنت';
        } else if (message.includes('تكوين Cloudinary غير صحيح')) {
          errorTitle = 'خطأ في التكوين';
          errorMessage = message;
        } else {
          errorMessage = message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // إعادة تعيين المعاينة في حالة الخطأ
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
      if (onUploadingChange) onUploadingChange(false);
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing image');
    setPreviewUrl(null);
    onImageUpload({ url: '', publicId: '', secureUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const triggerFileSelect = () => {
    console.log('Triggering file select');
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
        <p className="text-blue-700 text-xs sm:text-sm font-medium mb-2">
          💡 نصيحة: اختر صورة واضحة للطالب لتسهيل التعرف عليه
        </p>
        
        {/* زر اختبار للتشخيص */}
        <Button
          onClick={() => {
            console.log('=== Manual Cloudinary Test ===');
            const config = testCloudinaryConfig();
            console.log('Current config:', config);
            
            // إنشاء ملف اختبار بسيط
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
            
            console.log('Test file created:', testFile);
            
            // محاولة رفع ملف اختبار (سيفشل لأنه ليس صورة)
            cloudinaryService.uploadImage(testFile, 'test')
              .then(result => {
                console.log('Test upload succeeded (unexpected):', result);
              })
              .catch(error => {
                console.log('Test upload failed (expected):', error.message);
              });
          }}
          variant="outline"
          size="sm"
          className="mt-2 text-xs"
        >
          اختبار التكوين
        </Button>
      </div>
    </div>
  );
};