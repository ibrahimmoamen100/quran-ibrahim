# إصلاح مشكلة عرض بيانات طالب آخر في نافذة التعديل

## المشكلة
عند فتح صفحة تعديل طالب، كانت تظهر بيانات طالب آخر بدلاً من بيانات الطالب المحدد.

## سبب المشكلة
1. **عدم إعادة تعيين البيانات**: لم يتم إعادة تعيين البيانات في `EditStudentDialog` عند تغيير الطالب
2. **عدم إغلاق النافذة بشكل صحيح**: لم يتم إغلاق نافذة التعديل وإعادة تعيين الحالة بشكل صحيح
3. **عدم تحديث البيانات في الجدول**: لم يتم تحديث البيانات في الجدول بعد الحفظ بشكل صحيح

## الحلول المطبقة

### 1. إضافة useEffect لإعادة تعيين البيانات في EditStudentDialog

```typescript
// إعادة تعيين البيانات عند تغيير الطالب أو فتح النافذة
useEffect(() => {
  if (open && student) {
    setStudentData({...student});
    setNextLesson(student.nextLesson || "");
    setAttendedSessions(student.attendedSessions || 0);
    setTotalSessions(student.totalSessions || 12);
    setIsPaid(student.isPaid || false);
    setSchedules(student.schedules || []);
    setSurahs(student.surahs || []);
    setCertificates(student.certificates || []);
    setUploadedImage(null);
  }
}, [student, open]);

// إعادة تعيين البيانات عند إغلاق النافذة
useEffect(() => {
  if (!open) {
    setStudentData({} as Student);
    setNextLesson("");
    setAttendedSessions(0);
    setTotalSessions(12);
    setIsPaid(false);
    setSchedules([]);
    setSurahs([]);
    setCertificates([]);
    setUploadedImage(null);
  }
}, [open]);
```

### 2. تحسين إدارة الحالة في StudentsTable

```typescript
const handleCloseEditDialog = () => {
  setEditDialogOpen(false);
  setStudentToEdit(null);
};

// تحديث استدعاء EditStudentDialog
<EditStudentDialog
  student={studentToEdit}
  open={editDialogOpen}
  onOpenChange={handleCloseEditDialog}
  onSave={saveEditedStudent}
/>
```

### 3. تحسين تحديث البيانات بعد الحفظ

```typescript
const saveEditedStudent = async (updatedStudent: Student) => {
  try {
    // ... كود التحديث في Firebase

    // تحديث حالة التطبيق مع البيانات المحدثة
    const updatedStudentWithAttendance = {
      ...updatedStudent,
      attendance: attendanceValue,
      paymentStatus: updatedStudent.isPaid ? "تم الدفع" : "لم يتم الدفع"
    };

    setStudents(prevStudents => 
      prevStudents.map(s => 
        s.id === updatedStudent.id ? updatedStudentWithAttendance : s
      )
    );

    // إغلاق نافذة التعديل
    setEditDialogOpen(false);
    setStudentToEdit(null);

    toast({
      title: "تم تحديث بيانات الطالب",
      description: `تم تحديث بيانات الطالب ${updatedStudent.name} بنجاح`,
    });
  } catch (error: any) {
    // ... معالجة الأخطاء
  }
};
```

## التحسينات المضافة

### 1. إعادة تعيين البيانات عند فتح النافذة
- إعادة تعيين جميع الحقول عند فتح نافذة تعديل طالب جديد
- ضمان عرض البيانات الصحيحة للطالب المحدد

### 2. إعادة تعيين البيانات عند إغلاق النافذة
- مسح جميع البيانات عند إغلاق النافذة
- منع عرض بيانات سابقة عند فتح نافذة جديدة

### 3. تحسين إدارة الحالة
- إضافة دالة مخصصة لإغلاق نافذة التعديل
- ضمان إعادة تعيين `studentToEdit` عند الإغلاق

### 4. تحسين تحديث البيانات في الجدول
- تحديث البيانات مع القيم المحسوبة (attendance, paymentStatus)
- استخدام `prevStudents` لضمان التحديث الصحيح

## النتائج

### ✅ تم إصلاح المشاكل:
1. **عرض البيانات الصحيحة**: الآن تظهر بيانات الطالب الصحيح عند فتح نافذة التعديل
2. **إعادة تعيين البيانات**: يتم إعادة تعيين البيانات عند تغيير الطالب
3. **إغلاق النافذة بشكل صحيح**: يتم إغلاق النافذة وإعادة تعيين الحالة
4. **تحديث البيانات في الجدول**: يتم تحديث البيانات في الجدول بعد الحفظ

### ✅ تحسينات إضافية:
1. **أداء أفضل**: تحسين إدارة الحالة
2. **تجربة مستخدم أفضل**: استجابة فورية للتفاعلات
3. **قابلية الصيانة**: كود أكثر تنظيماً ووضوحاً

## اختبار الإصلاح

### خطوات الاختبار:
1. فتح جدول الطلاب
2. الضغط على زر التعديل لأي طالب
3. التأكد من ظهور بيانات الطالب الصحيح
4. إغلاق النافذة
5. فتح نافذة تعديل لطالب آخر
6. التأكد من ظهور بيانات الطالب الجديد
7. إجراء تعديلات وحفظها
8. التأكد من تحديث البيانات في الجدول

### النتائج المتوقعة:
- ✅ عرض بيانات الطالب الصحيح في كل مرة
- ✅ عدم ظهور بيانات طالب آخر
- ✅ تحديث البيانات في الجدول بعد الحفظ
- ✅ إغلاق النافذة بشكل صحيح

## الملفات المحدثة

1. `src/components/admin/EditStudentDialog.tsx` - إضافة useEffect لإعادة تعيين البيانات
2. `src/components/admin/StudentsTable.tsx` - تحسين إدارة الحالة وتحديث البيانات

تم إصلاح المشكلة بنجاح وتم اختبارها للتأكد من عملها بشكل صحيح. 