
import { Issue, IssueStatus, Priority } from './types';
import { LD_TEAM_TITLE } from './constants';

const SHEET_ID = '1X3MlikMug_yu1x8hogFpwfT3_gSOmle4CSrBcDdnLds';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx:out:csv`;
// الرابط الأحدث الذي زودتنا به
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx7sbZiqAxSGcGIOqxVYnD8QR6-9vLbGxutKVMfvQWh-dJGsmiNZZ0X3Jj40t3iOxqBQQ/exec';

function parseCSV(csvText: string): Issue[] {
  if (!csvText || csvText.trim() === "") return [];
  
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const clean = (str: string) => {
    if (!str) return '';
    return str.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
  };

  const splitLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuote = !inQuote;
      else if (char === ',' && !inQuote) {
        result.push(cur);
        cur = '';
      } else cur += char;
    }
    result.push(cur);
    return result;
  };

  return lines.slice(1)
    .filter(line => line.trim() !== "")
    .map((line, index) => {
      const values = splitLine(line);
      // الترتيب الصارم لـ 13 عموداً
      return {
        id: clean(values[0]) || `ID-${index}`,
        createdAt: clean(values[1]),
        pharmacistName: clean(values[2]),
        mobileNumber: clean(values[3]),
        lmsEmail: clean(values[4]),
        category: clean(values[5]),
        priority: (clean(values[6]) as Priority) || 'عادي',
        description: clean(values[7]),
        screenshot: clean(values[8]),
        assignedTo: clean(values[9]) || LD_TEAM_TITLE,
        status: (clean(values[10]) as IssueStatus) || 'جديدة',
        resolvedAt: clean(values[11]),
        resolutionNotes: clean(values[12]),
      } as Issue;
    });
}

/**
 * جلب البيانات من جوجل شيت حصراً دون دمج أي بيانات محلية
 */
export async function fetchIssues(): Promise<Issue[]> {
  try {
    const response = await fetch(CSV_URL, { cache: 'no-cache' });
    if (response.ok) {
      const text = await response.text();
      return parseCSV(text);
    }
    return [];
  } catch (error) {
    console.error('Error fetching data from Sheet:', error);
    return [];
  }
}

/**
 * إرسال البلاغ مباشرة إلى السكربت
 */
export async function submitIssue(issue: Partial<Issue>): Promise<boolean> {
  const tempId = 'ID-' + Date.now();
  const now = new Date().toLocaleString('ar-EG');
  
  try {
    const payload = {
      action: 'INSERT',
      id: tempId,
      createdAt: now,
      pharmacistName: issue.pharmacistName,
      mobileNumber: issue.mobileNumber,
      lmsEmail: issue.lmsEmail,
      category: issue.category,
      description: issue.description,
      priority: issue.priority || 'عادي',
      screenshot: issue.screenshot || '',
      status: 'جديدة',
      assignedTo: LD_TEAM_TITLE,
      resolvedAt: '',
      resolutionNotes: ''
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    return true;
  } catch (error) {
    console.error('Submit Error:', error);
    return false; 
  }
}

/**
 * تحديث البلاغ في الشيت مباشرة
 */
export async function updateIssueInSheet(issue: Issue): Promise<boolean> {
  try {
    const payload = {
      action: 'UPDATE',
      id: issue.id,
      createdAt: issue.createdAt,
      pharmacistName: issue.pharmacistName,
      mobileNumber: issue.mobileNumber,
      lmsEmail: issue.lmsEmail,
      category: issue.category,
      description: issue.description,
      priority: issue.priority,
      screenshot: issue.screenshot || '',
      status: issue.status,
      assignedTo: issue.assignedTo,
      resolvedAt: issue.resolvedAt,
      resolutionNotes: issue.resolutionNotes
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (error) {
    console.error('Update Error:', error);
    return false; 
  }
}
