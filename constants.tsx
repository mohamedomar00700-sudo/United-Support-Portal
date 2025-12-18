
import { 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  Settings, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  MapPin,
  Building2,
  Phone,
  User,
  Tags,
  AlertTriangle,
  Zap,
  Check,
  Lock,
  ShieldCheck,
  Mail,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Activity,
  BarChart3,
  Smartphone
} from 'lucide-react';
import React from 'react';
import { AppSheetConfig, IssueStatus, Priority } from './types';

export const ADMIN_ACCESS_CODE = "LD2025";

export const ISSUE_CATEGORIES = [
  'مشكلة تسجيل دخول (LMS)',
  'عدم ظهور الدورات',
  'خطأ تقني في الاختبار',
  'تحديث البيانات الشخصية',
  'أخرى'
];

export const PLATFORM_LINKS = {
  TALENT: 'https://unitedtalentacademy.moodlecloud.com',
  PHARMACY: 'https://unitedpharmacyacademy.moodlecloud.com'
};

export const LEARNING_RESOURCES = [
  { 
    id: 1, 
    title: 'دليل الطالب لاستخدام منصة Moodle', 
    type: 'فيديو تعليمي', 
    icon: <Video size={18} />, 
    link: 'https://www.youtube.com/watch?v=F08h_000K6A',
    description: 'شرح شامل لكيفية الدخول وحل التكليفات للطلاب الجدد.'
  },
  { 
    id: 2, 
    title: 'تطبيق مودل على الهاتف الجوال', 
    type: 'دليل تقني', 
    icon: <Smartphone size={18} />, 
    link: 'https://www.youtube.com/watch?v=2B9N8WqOsh0',
    description: 'طريقة تحميل وربط تطبيق الموبايل بالمنصة الرسمية.'
  },
  { 
    id: 3, 
    title: 'كيفية أداء الاختبارات في المنصة', 
    type: 'فيديو توضيحي', 
    icon: <BookOpen size={18} />, 
    link: 'https://www.youtube.com/watch?v=M9pXvN_2-2M',
    description: 'خطوات البدء في الاختبارات وضمان حفظ الإجابات.'
  },
];

export const SUGGESTED_SOLUTIONS: Record<string, string[]> = {
  'مشكلة تسجيل دخول (LMS)': [
    'تأكد من استخدام رابط المنصة الصحيح المرسل لك رسمياً.',
    'تأكد من كتابة البريد الإلكتروني كاملاً بشكل صحيح.',
    'تأكد من إيقاف مفتاح (Caps Lock) عند كتابة كلمة السر.',
    'جرب الدخول من متصفح خفي (Incognito Mode).'
  ],
  'عدم ظهور الدورات': [
    'تحقق من الرابط: هل أنت على المنصة الصحيحة؟ (Academy vs Talent).',
    'تأكد من مرور 24 ساعة على الأقل من تاريخ تفعيل حسابك.',
    'تأكد من إنهاء المتطلبات السابقة للدورة (Pre-requisites).',
    'قم بتحديث الصفحة أو تسجيل الخروج والدخول مرة أخرى.'
  ],
  'خطأ تقني في الاختبار': [
    'تأكد من استقرار اتصال الإنترنت لديك.',
    'استخدم متصفح Google Chrome للحصول على أفضل أداء.',
    'لا تقم بتحديث الصفحة أثناء سير الاختبار.'
  ],
  'تحديث البيانات الشخصية': [
    'يمكنك تحديث رقم الجوال من خلال صفحة "الملف الشخصي" داخل المنصة.',
    'لتحديث بيانات الاسم أو المسمى الوظيفي، يرجى كتابة الطلب هنا وسيقوم الفريق بمراجعته.'
  ]
};

export const LD_TEAM_TITLE = 'منسق التدريب والتطوير';
export const LD_TEAM_MEMBERS = [LD_TEAM_TITLE];

export const STATUS_COLORS: Record<IssueStatus, string> = {
  'جديدة': 'bg-blue-50/50 text-blue-600 border-blue-100/50 backdrop-blur-md',
  'تحت المعالجة': 'bg-amber-50/50 text-amber-600 border-amber-100/50 backdrop-blur-md',
  'بانتظار رد الصيدلي': 'bg-purple-50/50 text-purple-600 border-purple-100/50 backdrop-blur-md',
  'تم الحل': 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 backdrop-blur-md',
};

// Fixed error on line 112: Removed 'metah' property as it is not part of the Priority type.
export const PRIORITY_COLORS: Record<Priority, string> = {
  'عاجل': 'bg-red-50/50 text-red-600 border-red-100/50',
  'متوسط': 'bg-orange-50/50 text-orange-600 border-orange-100/50',
  'عادي': 'bg-slate-50/50 text-slate-500 border-slate-100/50',
};

export const APPSHEET_COLUMNS: AppSheetConfig[] = [
  { columnName: 'Issue ID', type: 'UniqueID', editable: 'FALSE', showIf: 'TRUE', initialValue: '', arabicLabel: 'رقم البلاغ' },
  { columnName: 'Date Submitted', type: 'DateTime', editable: 'FALSE', showIf: 'TRUE', initialValue: '', arabicLabel: 'تاريخ الإنشاء' },
  { columnName: 'Pharmacist Name', type: 'Name', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'اسم الصيدلي' },
  { columnName: 'Mobile Number', type: 'Phone', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'رقم الجوال' },
  { columnName: 'LMS Email', type: 'Email', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'بريد المنصة' },
  { columnName: 'Issue Category', type: 'Enum', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'التصنيف' },
  { columnName: 'Priority', type: 'Enum', editable: 'TRUE', showIf: 'TRUE', initialValue: 'عادي', arabicLabel: 'الأولوية' },
  { columnName: 'Issue Description', type: 'LongText', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'الوصف' },
  { columnName: 'Screenshot Link', type: 'Image', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'المرفق' },
  { columnName: 'Assigned To', type: 'Text', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'المسؤول' },
  { columnName: 'Status', type: 'Enum', editable: 'TRUE', showIf: 'TRUE', initialValue: 'جديدة', arabicLabel: 'الحالة' },
  { columnName: 'Date Resolved', type: 'DateTime', editable: 'FALSE', showIf: 'TRUE', initialValue: '', arabicLabel: 'تاريخ الحل' },
  { columnName: 'Notes', type: 'LongText', editable: 'TRUE', showIf: 'TRUE', initialValue: '', arabicLabel: 'ملاحظات' },
];

export const ICONS = {
  New: PlusCircle,
  History: History,
  Dashboard: LayoutDashboard,
  Config: Settings,
  Resolved: CheckCircle2,
  Pending: Clock,
  Error: AlertCircle,
  Chat: MessageSquare,
  Map: MapPin,
  Office: Building2,
  Phone: Phone,
  User: User,
  Tag: Tags,
  Urgent: Zap,
  Alert: AlertTriangle,
  Done: Check,
  Lock: Lock,
  Shield: ShieldCheck,
  Mail: Mail,
  Tip: Lightbulb,
  Link: ExternalLink,
  Status: Activity,
  Guide: BookOpen,
  Analytics: BarChart3
};