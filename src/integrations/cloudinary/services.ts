import { cloudinaryConfig } from './config';

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

// دالة لإعادة المحاولة تلقائياً
const retryUpload = async <T>(
  uploadFunction: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}`);
      return await uploadFunction();
    } catch (error) {
      lastError = error as Error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // زيادة التأخير مع كل محاولة
      }
    }
  }
  
  throw lastError!;
};

export class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor(cloudName?: string, uploadPreset?: string) {
    this.cloudName = cloudName || cloudinaryConfig.cloudName;
    this.uploadPreset = uploadPreset || cloudinaryConfig.uploadPreset;
  }

  // رفع صورة من ملف
  async uploadImage(file: File, folder: string = 'students'): Promise<UploadResult> {
    return retryUpload(async () => {
      return new Promise((resolve, reject) => {
        console.log('=== Cloudinary Upload Start ===');
        console.log('File details:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        console.log('Cloudinary config:', {
          cloudName: this.cloudName,
          uploadPreset: this.uploadPreset,
          folder
        });
        console.log('Upload URL:', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);

        // إضافة معاملات إضافية للتحسين (بدون format)
        formData.append('resource_type', 'image');

        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          console.log('=== Cloudinary Response ===');
          console.log('Response status:', xhr.status);
          console.log('Response headers:', xhr.getAllResponseHeaders());
          console.log('Response text:', xhr.responseText);
          
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Parsed response:', response);
              
              if (response.secure_url) {
                console.log('✅ Upload successful!');
                console.log('Secure URL:', response.secure_url);
                console.log('Public ID:', response.public_id);
                
                resolve({
                  url: response.secure_url,
                  publicId: response.public_id,
                  secureUrl: response.secure_url
                });
              } else {
                console.error('❌ No secure_url in response');
                reject(new Error('لم يتم الحصول على رابط الصورة من Cloudinary'));
              }
            } catch (error) {
              console.error('❌ Error parsing Cloudinary response:', error);
              reject(new Error('خطأ في تحليل استجابة Cloudinary'));
            }
          } else {
            console.error('❌ Cloudinary upload failed');
            console.error('Status:', xhr.status);
            console.error('Status text:', xhr.statusText);
            console.error('Response:', xhr.responseText);
            
            let errorMessage = `خطأ في رفع الصورة: ${xhr.status}`;
            
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              console.error('Parsed error response:', errorResponse);
              
              if (errorResponse.error && errorResponse.error.message) {
                errorMessage = errorResponse.error.message;
              } else if (errorResponse.message) {
                errorMessage = errorResponse.message;
              }
            } catch (e) {
              console.error('Failed to parse error response:', e);
            }
            
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => {
          console.error('❌ Network error during Cloudinary upload');
          console.error('Network error details:', {
            readyState: xhr.readyState,
            status: xhr.status,
            statusText: xhr.statusText
          });
          reject(new Error('خطأ في الاتصال بـ Cloudinary - تأكد من اتصال الإنترنت'));
        };

        xhr.ontimeout = () => {
          console.error('❌ Timeout during Cloudinary upload');
          reject(new Error('انتهت مهلة الاتصال بـ Cloudinary - جرب مرة أخرى أو تحقق من سرعة الإنترنت'));
        };

        xhr.onreadystatechange = () => {
          console.log('XHR ready state:', xhr.readyState);
          if (xhr.readyState === 1) {
            console.log('Request opened');
          } else if (xhr.readyState === 2) {
            console.log('Headers received');
          } else if (xhr.readyState === 3) {
            console.log('Loading response');
          } else if (xhr.readyState === 4) {
            console.log('Request completed');
          }
        };

        console.log('Opening XHR request...');
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
        xhr.timeout = 60000; // زيادة المهلة إلى 60 ثانية
        
        console.log('Sending request...');
        xhr.send(formData);
      });
    }, 3, 2000); // 3 محاولات مع تأخير 2 ثانية
  }

  // رفع صورة من URL
  async uploadImageFromUrl(imageUrl: string, folder: string = 'students'): Promise<UploadResult> {
    return retryUpload(async () => {
      return new Promise((resolve, reject) => {
        console.log('Starting URL upload to Cloudinary...');
        console.log('Image URL:', imageUrl);
        console.log('Folder:', folder);

        const formData = new FormData();
        formData.append('file', imageUrl);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);
        formData.append('resource_type', 'image');

        const xhr = new XMLHttpRequest();
        
        xhr.onload = () => {
          console.log('Cloudinary URL upload response status:', xhr.status);
          console.log('Cloudinary URL upload response:', xhr.responseText);
          
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Parsed URL upload response:', response);
              
              if (response.secure_url) {
                resolve({
                  url: response.secure_url,
                  publicId: response.public_id,
                  secureUrl: response.secure_url
                });
              } else {
                reject(new Error('لم يتم الحصول على رابط الصورة من Cloudinary'));
              }
            } catch (error) {
              console.error('Error parsing Cloudinary URL upload response:', error);
              reject(new Error('خطأ في تحليل استجابة Cloudinary'));
            }
          } else {
            console.error('Cloudinary URL upload failed with status:', xhr.status);
            console.error('Response:', xhr.responseText);
            
            let errorMessage = `خطأ في رفع الصورة من الرابط: ${xhr.status}`;
            
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.error && errorResponse.error.message) {
                errorMessage = errorResponse.error.message;
              }
            } catch (e) {
              // إذا فشل في تحليل رسالة الخطأ، استخدم الرسالة الافتراضية
            }
            
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => {
          console.error('Network error during Cloudinary URL upload');
          reject(new Error('خطأ في الاتصال بـ Cloudinary - تأكد من اتصال الإنترنت'));
        };

        xhr.ontimeout = () => {
          console.error('Timeout during Cloudinary URL upload');
          reject(new Error('انتهت مهلة الاتصال بـ Cloudinary - جرب مرة أخرى أو تحقق من سرعة الإنترنت'));
        };

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
        xhr.timeout = 60000; // زيادة المهلة إلى 60 ثانية
        xhr.send(formData);
      });
    }, 3, 2000); // 3 محاولات مع تأخير 2 ثانية
  }

  // حذف صورة
  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('public_id', publicId);

      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`خطأ في حذف الصورة: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('خطأ في الاتصال بـ Cloudinary'));
      };

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`);
      xhr.send(formData);
    });
  }

  // تحويل URL إلى Cloudinary URL محسن
  getOptimizedUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    if (!url.includes('cloudinary.com')) {
      return url; // إذا لم تكن صورة Cloudinary، أرجع URL الأصلي
    }

    const { width, height, quality = 'auto', format = 'auto' } = options;
    let optimizedUrl = url;

    // إضافة معاملات التحسين
    if (width || height) {
      const transform = `w_${width || 'auto'},h_${height || 'auto'}`;
      optimizedUrl = optimizedUrl.replace('/upload/', `/upload/${transform}/`);
    }

    if (quality !== 'auto') {
      const qualityTransform = `q_${quality}`;
      optimizedUrl = optimizedUrl.replace('/upload/', `/upload/${qualityTransform}/`);
    }

    if (format !== 'auto') {
      const formatTransform = `f_${format}`;
      optimizedUrl = optimizedUrl.replace('/upload/', `/upload/${formatTransform}/`);
    }

    return optimizedUrl;
  }
}

// تصدير مثيل افتراضي
export const cloudinaryService = new CloudinaryService();

// دالة اختبار للتأكد من صحة التكوين
export const testCloudinaryConfig = () => {
  console.log('=== Testing Cloudinary Configuration ===');
  
  const cloudName = cloudinaryService['cloudName'];
  const uploadPreset = cloudinaryService['uploadPreset'];
  
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  console.log('API Key:', cloudinaryConfig.apiKey ? '✅ Set' : '❌ Not set');
  console.log('API Secret:', cloudinaryConfig.apiSecret ? '✅ Set' : '❌ Not set');
  
  // اختبار بسيط للاتصال
  const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  console.log('Test URL:', testUrl);
  
  // التحقق من صحة التكوين
  const hasCloudName = cloudName && cloudName.trim() !== '';
  const hasUploadPreset = uploadPreset && uploadPreset.trim() !== '';
  const isNotDemo = cloudName !== 'demo';
  const hasApiKey = cloudinaryConfig.apiKey && cloudinaryConfig.apiKey.trim() !== '';
  const hasApiSecret = cloudinaryConfig.apiSecret && cloudinaryConfig.apiSecret.trim() !== '';
  
  const isValid = hasCloudName && hasUploadPreset && isNotDemo;
  
  console.log('Configuration validation:');
  console.log('- Has Cloud Name:', hasCloudName ? '✅' : '❌');
  console.log('- Has Upload Preset:', hasUploadPreset ? '✅' : '❌');
  console.log('- Is Not Demo:', isNotDemo ? '✅' : '❌');
  console.log('- Has API Key:', hasApiKey ? '✅' : '❌');
  console.log('- Has API Secret:', hasApiSecret ? '✅' : '❌');
  console.log('Overall valid:', isValid ? '✅' : '❌');
  
  if (!isValid) {
    console.warn('⚠️ Cloudinary configuration issues detected:');
    if (!hasCloudName) console.warn('  - Cloud name is missing or empty');
    if (!hasUploadPreset) console.warn('  - Upload preset is missing or empty');
    if (!isNotDemo) console.warn('  - Using demo cloud name (should use your own)');
    if (!hasApiKey) console.warn('  - API key is missing');
    if (!hasApiSecret) console.warn('  - API secret is missing');
  }
  
  return {
    cloudName,
    uploadPreset,
    apiKey: cloudinaryConfig.apiKey,
    apiSecret: cloudinaryConfig.apiSecret,
    testUrl,
    isValid,
    details: {
      hasCloudName,
      hasUploadPreset,
      isNotDemo,
      hasApiKey,
      hasApiSecret
    }
  };
}; 