/**
 * @fileoverview Excel import/export for garnishee cases.
 */

import * as XLSX from 'xlsx';
import { LegalCase, CaseFormData, CaseStatus, CasePriority } from '@/types/case';

const validateStatus = (value: string): CaseStatus => {
  const statuses: CaseStatus[] = ['open', 'pending', 'closed', 'archived'];
  const n = String(value || '').toLowerCase().trim();
  return (statuses as string[]).includes(n) ? (n as CaseStatus) : 'open';
};

const validatePriority = (value: string): CasePriority => {
  const priorities: CasePriority[] = ['low', 'medium', 'high', 'urgent'];
  const n = String(value || '').toLowerCase().trim();
  return (priorities as string[]).includes(n) ? (n as CasePriority) : 'medium';
};

const validateBoolean = (value: string): boolean => {
  const n = String(value || '').toLowerCase().trim();
  return ['yes', 'true', '1', 'y'].includes(n);
};

/** Convert any incoming date value (Excel serial, string) to ISO yyyy-mm-dd. */
const toIsoDate = (value: unknown): string => {
  if (value == null || value === '') return '';
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(value);
    if (!d) return '';
    const mm = String(d.m).padStart(2, '0');
    const dd = String(d.d).padStart(2, '0');
    return `${d.y}-${mm}-${dd}`;
  }
  const s = String(value).trim();
  if (!s) return '';
  // dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
  if (m) {
    let [, dd, mm, yy] = m;
    if (yy.length === 2) yy = (Number(yy) > 50 ? '19' : '20') + yy;
    return `${yy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  // ISO already
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return '';
};

const formatIsoForExcel = (s: string): string => {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return s;
  return `${m[3]}/${m[2]}/${m[1]}`;
};

export const exportToExcel = (cases: LegalCase[], filename = 'garnishee_cases') => {
  const exportData = cases.map(c => ({
    'Case Number': c.caseNumber,
    'Title': c.title,
    'Judgment Creditor': c.judgmentCreditor,
    'Judgment Debtor': c.judgmentDebtor,
    'Garnishee': c.garnishee,
    'Status': c.status,
    'Priority': c.priority,
    'Court': c.court,
    'Judge': c.judge,
    'Filing Date': formatIsoForExcel(c.filingDate),
    'Next Hearing': formatIsoForExcel(c.nextHearing),
    'Garnishee Deadline': formatIsoForExcel(c.garnisheeDeadline),
    'Description': c.description,
    'Notes': c.notes,
    'Judgment Collected': c.judgmentCollected ? 'Yes' : 'No',
    'Last Counsel': c.lastCounsel || '',
    'Archived': c.isArchived ? 'Yes' : 'No',
    'Created At': formatIsoForExcel(c.createdAt.slice(0, 10)),
    'Updated At': formatIsoForExcel(c.updatedAt.slice(0, 10)),
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

  if (exportData.length) {
    const maxWidth = 50;
    worksheet['!cols'] = Object.keys(exportData[0]).map(key => ({
      wch: Math.min(
        maxWidth,
        Math.max(key.length, ...exportData.map(row => String((row as any)[key] || '').length))
      ),
    }));
  }

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const pick = (row: any, ...keys: string[]) => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  }
  return '';
};

export const importFromExcel = (file: File): Promise<CaseFormData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { raw: true, defval: '' });

        const cases: CaseFormData[] = rows
          .map(row => ({
            caseNumber: String(pick(row, 'Case Number', 'caseNumber') || ''),
            title: String(pick(row, 'Title', 'title') || ''),
            judgmentCreditor: String(pick(row, 'Judgment Creditor', 'judgmentCreditor', 'Client', 'client') || ''),
            judgmentDebtor: String(pick(row, 'Judgment Debtor', 'judgmentDebtor', 'Opposing Party', 'opposingParty') || ''),
            garnishee: String(pick(row, 'Garnishee', 'garnishee', 'Represented Garnishee', 'representedGarnishee') || ''),
            status: validateStatus(String(pick(row, 'Status', 'status'))),
            priority: validatePriority(String(pick(row, 'Priority', 'priority'))),
            court: String(pick(row, 'Court', 'court', 'Garnishee Court', 'garnisheeCourt') || ''),
            judge: String(pick(row, 'Judge', 'judge') || ''),
            filingDate: toIsoDate(pick(row, 'Filing Date', 'filingDate')),
            nextHearing: toIsoDate(pick(row, 'Next Hearing', 'nextHearing')),
            garnisheeDeadline: toIsoDate(pick(row, 'Garnishee Deadline', 'garnisheeDeadline')),
            description: String(pick(row, 'Description', 'description') || ''),
            notes: String(pick(row, 'Notes', 'notes', 'Garnishee Comment', 'garnisheeComment') || ''),
            judgmentCollected: validateBoolean(String(pick(row, 'Judgment Collected', 'judgmentCollected'))),
            lastCounsel: String(pick(row, 'Last Counsel', 'lastCounsel') || ''),
            isArchived: validateBoolean(String(pick(row, 'Archived', 'isArchived'))),
          }))
          .filter(c => c.caseNumber || c.title);

        resolve(cases);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const downloadTemplate = () => {
  const templateData = [
    {
      'Case Number': 'GARN-2026-001',
      'Title': 'Sample Garnishee Proceeding',
      'Judgment Creditor': 'ABC Holdings Ltd',
      'Judgment Debtor': 'XYZ Trading Ltd',
      'Garnishee': 'First Bank Plc',
      'Status': 'open',
      'Priority': 'high',
      'Court': 'High Court of Lagos State',
      'Judge': 'Hon. Justice Adekunle',
      'Filing Date': '15/01/2026',
      'Next Hearing': '20/02/2026',
      'Garnishee Deadline': '10/02/2026',
      'Description': 'Garnishee proceeding to attach judgment debtor funds',
      'Notes': 'Awaiting bank response on funds held',
      'Judgment Collected': 'No',
      'Last Counsel': 'Jane Doe',
      'Archived': 'No',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'garnishee_import_template.xlsx');
};