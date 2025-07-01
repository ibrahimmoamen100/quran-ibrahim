import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WeeklySchedule } from './WeeklySchedule';
import { SurahSelector } from './SurahSelector';
import { ImageUpload } from '@/components/ui/image-upload';
import { CertificateUpload } from '@/components/ui/certificate-upload';
import { Student } from "./StudentsTable";
import { UploadResult } from "@/integrations/cloudinary/services";

interface EditStudentDialogProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedStudent: Student) => void;
}

export const EditStudentDialog = ({ student, open, onOpenChange, onSave }: EditStudentDialogProps) => {
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<Student>({...student});
  const [uploadedImage, setUploadedImage] = useState<UploadResult | null>(null);
  const [nextLesson, setNextLesson] = useState(student.nextLesson || "");
  const [attendedSessions, setAttendedSessions] = useState(student.attendedSessions || 0);
  const [totalSessions, setTotalSessions] = useState(student.totalSessions || 12);
  const [isPaid, setIsPaid] = useState(student.isPaid || false);
  const [schedules, setSchedules] = useState(student.schedules || []);
  const [surahs, setSurahs] = useState(student.surahs || []);
  const [certificates, setCertificates] = useState(student.certificates || []);

  // Reset isPaid when attendedSessions reaches totalSessions
  useEffect(() => {
    if (attendedSessions >= totalSessions) {
      setAttendedSessions(0);
      setIsPaid(false);
      toast({
        title: "تم إعادة ضبط عداد الحلقات",
        description: "تم الوصول إلى الحد الأقصى للحلقات، وتم إعادة الضبط",
      });
    }
  }, [attendedSessions, totalSessions, toast]);

  const handleImageUpload = (result: UploadResult) => {
    console.log('EditStudentDialog: Image upload result received:', result);
    setStudentData({...studentData, image: result.secureUrl});
    console.log('EditStudentDialog: Student data updated with image:', result.secureUrl);
  };

  const handleAddSurah = (surahName: string) => {
    if (!surahs.find(s => s.name === surahName)) {
      setSurahs([...surahs, { name: surahName, rating: 0 }]);
    }
  };

  const increaseAttendedSessions = () => {
    if (attendedSessions < totalSessions) {
      setAttendedSessions(prev => prev + 1);
    }
  };

  const decreaseAttendedSessions = () => {
    if (attendedSessions > 0) {
      setAttendedSessions(prev => prev - 1);
    }
  };

  const handleSave = () => {
    // Update the student data with the latest changes
    const updatedStudent = {
      ...studentData,
      schedules,
      surahs,
      certificates,
      nextLesson,
      attendedSessions,
      totalSessions,
      isPaid
    };

    // إزالة password إذا كان undefined أو فارغ
    if (!updatedStudent.password || updatedStudent.password.trim() === '') {
      delete updatedStudent.password;
    }

    // التأكد من أن جميع الحقول المطلوبة لها قيم صحيحة
    const sanitizedStudent = {
      ...updatedStudent,
      name: updatedStudent.name || '',
      username: updatedStudent.username || '',
      image: updatedStudent.image || '',
      paymentType: updatedStudent.paymentType || 'بالحلقة',
      notes: updatedStudent.notes || '',
      nextLesson: updatedStudent.nextLesson || '',
      attendedSessions: updatedStudent.attendedSessions || 0,
      totalSessions: updatedStudent.totalSessions || 0,
      isPaid: updatedStudent.isPaid || false,
      schedules: updatedStudent.schedules || [],
      surahs: updatedStudent.surahs || [],
      certificates: updatedStudent.certificates || []
    };
    
    onSave(sanitizedStudent);
    toast({
      title: "تم حفظ التغييرات",
      description: `تم تحديث بيانات الطالب ${studentData.name} بنجاح`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden glass-effect" dir="rtl">
        <DialogHeader className="card-header-enhanced p-4 sm:p-6">
          <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 text-center font-cairo">
            تعديل بيانات الطالب
          </DialogTitle>
          <p className="text-sm sm:text-base text-green-700 text-center mt-2">
            تحديث معلومات الطالب: {studentData.name}
          </p>
        </DialogHeader>
        
        <div className="card-body-enhanced p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <Tabs defaultValue="personal" className="w-full tabs-enhanced">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 mb-4 sm:mb-6 h-auto">
              <TabsTrigger value="personal" className="text-xs sm:text-sm font-medium py-2 px-1 sm:px-2">
                البيانات الشخصية
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs sm:text-sm font-medium py-2 px-1 sm:px-2">
                الجدول الزمني
              </TabsTrigger>
              <TabsTrigger value="surahs" className="text-xs sm:text-sm font-medium py-2 px-1 sm:px-2">
                السور المكلف بها
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm font-medium py-2 px-1 sm:px-2">
                معلومات الدفع
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs sm:text-sm font-medium py-2 px-1 sm:px-2">
                الشهادات
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 sm:space-y-6">
              <div className="card-enhanced">
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                    المعلومات الشخصية
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">اسم الطالب *</label>
                      <Input
                        className="form-input text-sm sm:text-base"
                        placeholder="أدخل اسم الطالب الكامل"
                        value={studentData.name}
                        onChange={(e) => setStudentData({...studentData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">اسم المستخدم *</label>
                      <Input
                        className="form-input text-sm sm:text-base"
                        placeholder="أدخل اسم المستخدم"
                        value={studentData.username}
                        onChange={(e) => setStudentData({...studentData, username: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">كلمة المرور</label>
                      <Input
                        className="form-input text-sm sm:text-base"
                        type="password"
                        placeholder="أدخل كلمة المرور الجديدة (اختياري)"
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          if (value) {
                            setStudentData({...studentData, password: value});
                          } else {
                            const { password, ...rest } = studentData;
                            setStudentData(rest);
                          }
                        }}
                      />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        اتركها فارغة إذا لم ترغب في تغيير كلمة المرور
                      </p>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">السورة التالية</label>
                      <Input
                        className="form-input text-sm sm:text-base"
                        placeholder="أدخل السورة التالية للحفظ"
                        value={nextLesson}
                        onChange={(e) => setNextLesson(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group mt-4 sm:mt-6">
                    <label className="form-label text-sm sm:text-base">صورة الطالب</label>
                    <ImageUpload 
                      onImageUpload={handleImageUpload}
                      currentImage={studentData.image}
                      folder="students"
                    />
                  </div>

                  <div className="form-group mt-4 sm:mt-6">
                    <label className="form-label text-sm sm:text-base">ملاحظات</label>
                    <Textarea
                      className="form-textarea text-sm sm:text-base"
                      placeholder="أدخل أي ملاحظات إضافية عن الطالب"
                      value={studentData.notes || ''}
                      onChange={(e) => setStudentData({...studentData, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
              <div className="card-enhanced">
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                    جدول الطالب الأسبوعي
                  </h3>
                  <WeeklySchedule 
                    schedules={schedules} 
                    setSchedules={setSchedules} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="surahs" className="space-y-4 sm:space-y-6">
              <div className="card-enhanced">
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                    السور المكلف بها الطالب
                  </h3>
                  <SurahSelector 
                    selectedSurahs={surahs} 
                    onAddSurah={handleAddSurah} 
                    onRemoveSurah={(name) => setSurahs(surahs.filter(s => s.name !== name))}
                    onRatingChange={(name, rating) => {
                      setSurahs(surahs.map(s => s.name === name ? {...s, rating} : s));
                    }}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-4 sm:space-y-6">
              <div className="card-enhanced">
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                    معلومات الدفع والحضور
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">نوع الدفع</label>
                      <Select 
                        value={studentData.paymentType} 
                        onValueChange={(value) => setStudentData({...studentData, paymentType: value})}
                      >
                        <SelectTrigger className="select-enhanced text-sm sm:text-base">
                          <SelectValue placeholder="اختر نوع الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="شهري">شهري</SelectItem>
                          <SelectItem value="بالحلقة">بالحلقة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label text-sm sm:text-base">حالة الدفع</label>
                      <Select 
                        value={isPaid ? "paid" : "unpaid"} 
                        onValueChange={(value) => setIsPaid(value === "paid")}
                      >
                        <SelectTrigger className="select-enhanced text-sm sm:text-base">
                          <SelectValue placeholder="اختر حالة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">تم الدفع</SelectItem>
                          <SelectItem value="unpaid">لم يتم الدفع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {studentData.paymentType === "شهري" && (
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-6">
                      <div className="form-group">
                        <label className="form-label text-sm sm:text-base">إجمالي الجلسات</label>
                        <Input
                          className="form-input text-sm sm:text-base"
                          type="number"
                          placeholder="عدد الجلسات الشهرية"
                          value={totalSessions}
                          onChange={(e) => setTotalSessions(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label text-sm sm:text-base">الجلسات الحاضرة</label>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={decreaseAttendedSessions}
                            className="w-10 h-10 p-0"
                          >
                            <Minus size={16} />
                          </Button>
                          <Input
                            className="form-input text-center text-sm sm:text-base"
                            type="number"
                            value={attendedSessions}
                            onChange={(e) => setAttendedSessions(parseInt(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={increaseAttendedSessions}
                            className="w-10 h-10 p-0"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="certificates" className="space-y-4 sm:space-y-6">
              <div className="card-enhanced">
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">
                    شهادات الطالب
                  </h3>
                  <CertificateUpload 
                    onCertificatesChange={setCertificates} 
                    currentCertificates={certificates}
                    folder="certificates"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-4 sm:pt-6 border-t border-gray-200 mt-6 sm:mt-8">
            <Button
              type="button"
              variant="outline"
              className="btn-secondary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-3 font-semibold"
              onClick={handleSave}
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
