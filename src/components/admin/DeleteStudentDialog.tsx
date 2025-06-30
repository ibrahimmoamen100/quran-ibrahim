import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteStudentDialogProps {
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteStudentDialog = ({
  studentName,
  open,
  onOpenChange,
  onConfirm,
}: DeleteStudentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect max-w-md" dir="rtl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-red-700 font-cairo">
            تأكيد حذف الطالب
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            هل أنت متأكد من أنك تريد حذف الطالب
            <span className="font-semibold text-red-700 mx-1">"{studentName}"</span>
            ؟
          </DialogDescription>
          <div className="alert-error mt-4">
            <p className="text-sm">
              ⚠️ تحذير: لا يمكن التراجع عن هذه العملية. سيتم حذف جميع بيانات الطالب نهائياً.
            </p>
          </div>
        </DialogHeader>
        
        <DialogFooter className="flex justify-end space-x-4 space-x-reverse mt-6">
          <Button 
            variant="outline" 
            className="btn-secondary"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button 
            className="btn-danger"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Trash2 size={16} className="ml-2" />
            تأكيد الحذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
