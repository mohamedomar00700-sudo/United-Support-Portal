
import { Issue, IssueStatus, Priority } from './types';
import { LD_TEAM_TITLE } from './constants';

const SHEET_ID = '1X3MlikMug_yu1x8hogFpwfT3_gSOmle4CSrBcDdnLds';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;
// Apps Script endpoint (updated)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaD4JMTdxOirowPnc7BwsJrOk6Yt1vICO22-jEoWyO0RRzFTNffWGTvcQg1AUTMx1AfQ/exec';

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
    const text = await response.text();
    // quick sanity log when debugging (will appear in browser console)
    if (!text || text.trim() === '') {
      console.warn('fetchIssues: empty response from Sheet CSV');
      return [];
    }
    const parsed = parseCSV(text);
    if (!parsed || parsed.length === 0) {
      console.warn('fetchIssues: parsed CSV produced no rows; sample=', text.slice(0, 300));
    }
    return parsed;
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

    // Send as application/x-www-form-urlencoded to avoid CORS preflight
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, String(v ?? '')));

    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      cache: 'no-cache',
      body: params
    });

    // Best-effort: parse JSON if available
    try {
      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        return json ? (json.success === true || json.action === 'INSERT') : true;
      }
      return false;
    } catch (e) {
      console.error('Submit Error parsing response:', e);
      return false;
    }
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

    // Send as application/x-www-form-urlencoded to avoid preflight OPTIONS
    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, String(v ?? '')));
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      cache: 'no-cache',
      body: params
    });

    if (!resp.ok) {
      console.error('updateIssueInSheet: non-ok response', resp.status, resp.statusText);
      return false;
    }

    // Try to parse JSON response from Apps Script. If it's not JSON, treat as failure.
    try {
      const json = await resp.json();
      if (json && (json.success === true || json.action === 'UPDATE')) return true;
      console.error('updateIssueInSheet: script returned error', json);
      return false;
    } catch (e) {
      console.error('updateIssueInSheet: failed to parse JSON response', e);
      return false;
    }
  } catch (error) {
    console.error('Update Error:', error);
    return false; 
  }
}
