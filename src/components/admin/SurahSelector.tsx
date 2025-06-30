import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Star } from "lucide-react";

interface Surah {
  name: string;
  rating: number;
}

interface SurahSelectorProps {
  selectedSurahs: Surah[];
  onAddSurah: (surahName: string) => void;
  onRemoveSurah: (surahName: string) => void;
  onRatingChange: (surahName: string, rating: number) => void;
}

export const SurahSelector = ({ 
  selectedSurahs, 
  onAddSurah, 
  onRemoveSurah,
  onRatingChange
}: SurahSelectorProps) => {
  const [newSurah, setNewSurah] = useState("");
  
  // List of Quran Surahs
  const quranSurahs = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
  ];
  
  // نظام التقييم الجديد من 10 مع إمكانية 10.5
  const ratings = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5];
  
  // دالة لتنسيق عرض التقييم
  const formatRating = (rating: number): string => {
    if (rating % 1 === 0) {
      return `${rating}/10`;
    } else {
      return `${rating}/10`;
    }
  };

  // دالة لحساب عدد النجوم المكتملة والنصف
  const getStarDisplay = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
    
    return { fullStars, hasHalfStar, emptyStars };
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Add New Surah Section */}
      <div className="card-enhanced">
        <div className="p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4">
            إضافة سورة جديدة
          </h4>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <label className="form-label text-sm sm:text-base">اختر السورة</label>
              <Select value={newSurah} onValueChange={setNewSurah}>
                <SelectTrigger className="select-enhanced w-full">
                  <SelectValue placeholder="اختر السورة من القائمة" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {quranSurahs.map(surah => (
                    <SelectItem key={surah} value={surah}>{surah}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center sm:justify-start">
              <Button
                type="button"
                onClick={() => {
                  if (newSurah) onAddSurah(newSurah);
                  setNewSurah("");
                }}
                disabled={!newSurah}
                className="btn-primary w-full sm:w-auto"
              >
                <Plus size={16} className="ml-2" />
                إضافة السورة
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Surahs Section */}
      {selectedSurahs.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-gray-400 text-xl sm:text-2xl">📖</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">لا توجد سور مختارة</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">قم بإضافة السور المكلف بها الطالب من القائمة أعلاه</p>
        </div>
      ) : (
        <div className="card-enhanced">
          <div className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-bold text-green-800 mb-3 sm:mb-4">
              السور المكلف بها ({selectedSurahs.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {selectedSurahs.map((surah, index) => {
                const starDisplay = getStarDisplay(surah.rating);
                
                return (
                  <div 
                    key={index} 
                    className="card-enhanced group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h5 className="font-bold text-green-800 text-sm sm:text-lg truncate flex-1 mr-2">{surah.name}</h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveSurah(surah.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 flex-shrink-0"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">
                            التقييم
                          </label>
                          <Select 
                            value={surah.rating.toString()} 
                            onValueChange={(value) => onRatingChange(surah.name, parseFloat(value))}
                          >
                            <SelectTrigger className="select-enhanced text-xs sm:text-sm">
                              <SelectValue placeholder="اختر التقييم" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {ratings.map(rating => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {formatRating(rating)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">التقييم:</span>
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1 space-x-reverse">
                              {/* نجوم مكتملة */}
                              {Array.from({ length: starDisplay.fullStars }).map((_, i) => (
                                <span key={`full-${i}`} className="text-xs sm:text-sm text-yellow-500">
                                  ★
                                </span>
                              ))}
                              
                              {/* نجمة نصف */}
                              {starDisplay.hasHalfStar && (
                                <span className="text-xs sm:text-sm text-yellow-500">
                                  ⭐
                                </span>
                              )}
                              
                              {/* نجوم فارغة */}
                              {Array.from({ length: starDisplay.emptyStars }).map((_, i) => (
                                <span key={`empty-${i}`} className="text-xs sm:text-sm text-gray-300">
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-green-600 mr-2">
                              {formatRating(surah.rating)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(surah.rating / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
