
export type IssueStatus = 'جديدة' | 'تحت المعالجة' | 'بانتظار رد الصيدلي' | 'تم الحل';
export type Priority = 'عاجل' | 'متوسط' | 'عادي';

export interface Issue {
  id: string;
  createdAt: string;
  pharmacistName: string;
  mobileNumber: string;
  lmsEmail: string;
  category: string;
  priority: Priority;
  description: string;
  screenshot?: string;
  assignedTo?: string;
  status: IssueStatus;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type ViewMode = 'PHARMACIST' | 'ADMIN';

export interface AppSheetConfig {
  columnName: string;
  type: string;
  editable: string;
  showIf: string;
  initialValue: string;
  arabicLabel: string;
}
