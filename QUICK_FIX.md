# حل سريع لمشكلة رفع صور الطلاب

## المشكلة
لا يتم رفع صور الطلاب في صفحة المسؤول

## الحل السريع

### 1. تحقق من إعدادات Cloudinary
افتح ملف `src/integrations/cloudinary/config.ts` وتأكد من صحة البيانات:

```typescript
export const cloudinaryConfig = {
  cloudName: "de3wqxddc", // تأكد من صحة اسم السحابة
  uploadPreset: "ibrahim", // تأكد من وجود هذا الـ preset
  apiKey: "854521536498331",
  apiSecret: "bCNjN1kF9v7LMSX9ME34OizzEK4"
};
```

### 2. إنشاء Upload Preset جديد
1. اذهب إلى [cloudinary.com](https://cloudinary.com) وسجل دخول
2. اذهب إلى **Settings** > **Upload** > **Upload presets**
3. اضغط **Add upload preset**
4. أدخل اسم: `ibrahim`
5. **مهم**: فعّل **Unsigned**
6. احفظ

### 3. إصلاح مشكلة معامل Format ✅ (تم إصلاحها)
- تم إزالة معامل `format` من FormData لأنه غير مسموح به في unsigned upload
- الملف المحدث: `src/integrations/cloudinary/services.ts`

### 4. اختبار التكوين
1. افتح التطبيق
2. اذهب إلى صفحة إضافة طالب
3. اضغط F12 لفتح وحدة التحكم
4. اضغط زر "اختبار التكوين" في قسم رفع الصورة
5. تحقق من الرسائل في وحدة التحكم

### 5. إذا استمرت المشكلة
- تحقق من اتصال الإنترنت
- تأكد من أن CORS مفعل في Cloudinary
- جرب رفع صورة أصغر من 1MB

### 6. رسائل الخطأ الشائعة
- **"Upload preset not found"**: أنشئ preset جديد
- **"Cloud name not found"**: تحقق من اسم السحابة
- **"Network error"**: تحقق من الإنترنت
- **"Format parameter is not allowed"**: ✅ تم إصلاحها

## للمزيد من التفاصيل
راجع ملف `CLOUDINARY_SETUP.md` 