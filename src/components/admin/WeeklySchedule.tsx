import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Clock, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Schedule {
  day: string;
  time: string;
}

interface WeeklyScheduleProps {
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
}

export const WeeklySchedule = ({ schedules, setSchedules }: WeeklyScheduleProps) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedHour, setSelectedHour] = useState("1");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  
  const daysInArabic = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString());
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
  
  const handleAddSchedule = () => {
    if (selectedDay) {
      const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      
      // إضافة الموعد إلى القائمة
      setSchedules([...schedules, { day: selectedDay, time: formattedTime }]);
      
      // إعادة ضبط قيم الإدخال
      setSelectedDay("");
      setSelectedHour("1");
      setSelectedMinute("00");
      setSelectedPeriod("AM");
    }
  };
  
  const handleRemoveSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add New Schedule Section */}
      <div className="card-enhanced">
        <div className="p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4 flex items-center">
            <Calendar className="ml-2 sm:w-5 sm:h-5" size={18} />
            إضافة موعد جديد
          </h4>
          
          <div className="space-y-4 sm:space-y-6 mb-4">
            <div className="form-group">
              <label className="form-label text-sm sm:text-base">اليوم</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="select-enhanced w-full">
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  {daysInArabic.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="form-group">
              <label className="form-label text-sm sm:text-base">الوقت</label>
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <div className="col-span-1">
                  <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger className="select-enhanced text-xs sm:text-sm">
                      <SelectValue placeholder="الساعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-lg">:</span>
                </div>
                
                <div className="col-span-1">
                  <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger className="select-enhanced text-xs sm:text-sm">
                      <SelectValue placeholder="الدقائق" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="select-enhanced text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">صباحاً</SelectItem>
                      <SelectItem value="PM">مساءً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleAddSchedule}
            disabled={!selectedDay}
            className="btn-primary w-full"
          >
            <Plus size={16} className="ml-2" />
            إضافة موعد
          </Button>
        </div>
      </div>
      
      {/* Selected Schedules Section */}
      {schedules.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Clock className="text-gray-400 sm:w-8 sm:h-8" size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">لا توجد مواعيد محددة</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">قم بإضافة مواعيد الحلقات الأسبوعية من القائمة أعلاه</p>
        </div>
      ) : (
        <div className="card-enhanced">
          <div className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4 flex items-center">
              <Clock className="ml-2 sm:w-5 sm:h-5" size={18} />
              المواعيد المحددة ({schedules.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {schedules.map((schedule, index) => (
                <div 
                  key={index} 
                  className="card-enhanced group hover:scale-105 transition-transform duration-300"
                >
                  <div className="p-3 sm:p-4 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Calendar className="text-white sm:w-6 sm:h-6" size={20} />
                    </div>
                    <h5 className="font-bold text-blue-800 text-sm sm:text-lg mb-1 sm:mb-2">{schedule.day}</h5>
                    <p className="text-gray-600 font-mono text-sm sm:text-lg mb-2 sm:mb-3">{schedule.time}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSchedule(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                    >
                      <Trash2 className="ml-1 sm:w-4 sm:h-4" size={14} />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
