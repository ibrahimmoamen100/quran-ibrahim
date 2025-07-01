// تكوين Cloudinary - يجب استبدال هذه القيم بتكوين حسابك
export const cloudinaryConfig = {
  // اسم السحابة من لوحة تحكم Cloudinary
  cloudName: "de3wqxddc",
  
  // Upload Preset - يجب إنشاؤه في لوحة تحكم Cloudinary
  // Settings > Upload > Upload presets > Add upload preset
  // تأكد من تفعيل "Unsigned" في الإعدادات
  uploadPreset: "ibrahim", // أو "ml_default" للاختبار
  
  // API Key - من لوحة تحكم Cloudinary
  apiKey: "854521536498331",
  
  // API Secret - من لوحة تحكم Cloudinary
  apiSecret: "bCNjN1kF9v7LMSX9ME34OizzEK4"
};

// تكوين افتراضي للاختبار (يمكنك تغييره لاحقاً)
export const defaultCloudinaryConfig = {
  cloudName: "demo",
  uploadPreset: "ml_default"
};

// دالة للتحقق من صحة التكوين
export const validateCloudinaryConfig = () => {
  const config = cloudinaryConfig;
  
  console.log('=== Cloudinary Config Validation ===');
  console.log('Cloud Name:', config.cloudName);
  console.log('Upload Preset:', config.uploadPreset);
  console.log('API Key:', config.apiKey ? 'Set' : 'Not set');
  console.log('API Secret:', config.apiSecret ? 'Set' : 'Not set');
  
  const issues = [];
  
  if (!config.cloudName || config.cloudName === 'demo') {
    issues.push('Cloud name is missing or using demo');
  }
  
  if (!config.uploadPreset) {
    issues.push('Upload preset is missing');
  }
  
  if (!config.apiKey) {
    issues.push('API key is missing');
  }
  
  if (!config.apiSecret) {
    issues.push('API secret is missing');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Configuration issues found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
    return false;
  }
  
  console.log('✅ Configuration appears valid');
  return true;
}; 