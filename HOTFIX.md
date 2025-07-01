# إصلاح سريع - مشكلة معامل Format

## المشكلة
عند محاولة رفع صورة، يظهر خطأ:
```
Format parameter is not allowed when using unsigned upload
```

## السبب
معامل `format` غير مسموح به عند استخدام unsigned upload في Cloudinary.

## الحل المطبق
تم إزالة معامل `format` من FormData في خدمة Cloudinary.

### الملفات المحدثة:
- `src/integrations/cloudinary/services.ts`

### التغييرات:
1. إزالة `formData.append('format', 'auto');` من دالة `uploadImage`
2. إضافة `formData.append('resource_type', 'image');` بدلاً منه

## اختبار الحل
1. أعد تشغيل التطبيق
2. جرب رفع صورة جديدة
3. تحقق من عدم ظهور خطأ format في وحدة التحكم

## ملاحظة
هذا الإصلاح يحل مشكلة رفع الصور مع unsigned upload. إذا كنت تستخدم signed upload، يمكن إضافة معامل format مرة أخرى. 