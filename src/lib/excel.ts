import * as XLSX from 'xlsx';
import { LegalCase, CaseFormData, CaseType, CaseStatus, CasePriority } from '@/types/case';

export const exportToExcel = (cases: LegalCase[], filename: string = 'legal_cases') => {
  const exportData = cases.map(c => ({
    'Case Number': c.caseNumber,
    'Title': c.title,
    'Client': c.client,
    'Opposing Party': c.opposingParty,
    'Type': c.type,
    'Status': c.status,
    'Priority': c.priority,
    'Court': c.court,
    'Judge': c.judge,
    'Filing Date': c.filingDate,
    'Next Hearing': c.nextHearing,
    'Description': c.description,
    'Notes': c.notes,
    'Created At': c.createdAt,
    'Updated At': c.updatedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const validateCaseType = (value: string): CaseType => {
  const types: CaseType[] = ['civil', 'criminal', 'family', 'corporate', 'property', 'labor', 'other'];
  const normalized = value?.toLowerCase().trim();
  return types.includes(normalized as CaseType) ? (normalized as CaseType) : 'other';
};

const validateStatus = (value: string): CaseStatus => {
  const statuses: CaseStatus[] = ['open', 'pending', 'closed', 'archived'];
  const normalized = value?.toLowerCase().trim();
  return statuses.includes(normalized as CaseStatus) ? (normalized as CaseStatus) : 'open';
};

const validatePriority = (value: string): CasePriority => {
  const priorities: CasePriority[] = ['low', 'medium', 'high', 'urgent'];
  const normalized = value?.toLowerCase().trim();
  return priorities.includes(normalized as CasePriority) ? (normalized as CasePriority) : 'medium';
};

export const importFromExcel = (file: File): Promise<CaseFormData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const cases: CaseFormData[] = jsonData.map((row: any) => ({
          caseNumber: String(row['Case Number'] || row['caseNumber'] || ''),
          title: String(row['Title'] || row['title'] || ''),
          client: String(row['Client'] || row['client'] || ''),
          opposingParty: String(row['Opposing Party'] || row['opposingParty'] || ''),
          type: validateCaseType(row['Type'] || row['type'] || ''),
          status: validateStatus(row['Status'] || row['status'] || ''),
          priority: validatePriority(row['Priority'] || row['priority'] || ''),
          court: String(row['Court'] || row['court'] || ''),
          judge: String(row['Judge'] || row['judge'] || ''),
          filingDate: String(row['Filing Date'] || row['filingDate'] || ''),
          nextHearing: String(row['Next Hearing'] || row['nextHearing'] || ''),
          description: String(row['Description'] || row['description'] || ''),
          notes: String(row['Notes'] || row['notes'] || ''),
        }));

        resolve(cases);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const downloadTemplate = () => {
  const templateData = [{
    'Case Number': 'CASE-2024-001',
    'Title': 'Sample Case Title',
    'Client': 'John Doe',
    'Opposing Party': 'Jane Smith',
    'Type': 'civil',
    'Status': 'open',
    'Priority': 'medium',
    'Court': 'District Court',
    'Judge': 'Hon. Judge Name',
    'Filing Date': '2024-01-15',
    'Next Hearing': '2024-02-15',
    'Description': 'Brief description of the case',
    'Notes': 'Additional notes',
  }];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, 'case_import_template.xlsx');
};
