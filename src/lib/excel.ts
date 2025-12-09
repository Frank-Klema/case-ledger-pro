/**
 * @fileoverview Excel import/export utilities for legal case management.
 * Provides functions for exporting cases to Excel, importing from Excel files,
 * and downloading a template file.
 */

import * as XLSX from 'xlsx';
import { LegalCase, CaseFormData, CaseType, CaseStatus, CasePriority } from '@/types/case';

/**
 * Exports an array of legal cases to an Excel file.
 * Creates a formatted worksheet with all case fields including garnishee details.
 * 
 * @param cases - Array of legal cases to export
 * @param filename - Base filename for the export (defaults to 'legal_cases')
 */
export const exportToExcel = (cases: LegalCase[], filename: string = 'legal_cases') => {
  // Transform case data to spreadsheet-friendly format
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
    'Judgment Collected': c.judgmentCollected ? 'Yes' : 'No',
    'Last Counsel': c.lastCounsel || '',
    'Archived': c.isArchived ? 'Yes' : 'No',
    // Garnishee-specific fields
    'Garnishee Court': c.garnisheeDetails?.garnisheeCourt || '',
    'Represented Garnishee': c.garnisheeDetails?.representedGarnishee || '',
    'Garnishee Comment': c.garnisheeDetails?.garnisheeComment || '',
    'Garnishee Deadline': c.garnisheeDetails?.garnisheeDeadline || '',
    'Created At': c.createdAt,
    'Updated At': c.updatedAt,
  }));

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cases');

  // Auto-size columns for better readability
  const maxWidth = 50;
  const colWidths = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)))
  }));
  worksheet['!cols'] = colWidths;

  // Write file with date-stamped filename
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Validates and normalizes a case type value.
 * Returns 'other' if the value doesn't match any valid type.
 * 
 * @param value - Raw case type string from import
 * @returns Valid CaseType value
 */
const validateCaseType = (value: string): CaseType => {
  const types: CaseType[] = ['civil', 'criminal', 'family', 'corporate', 'property', 'labor', 'garnishee', 'other'];
  const normalized = value?.toLowerCase().trim();
  return types.includes(normalized as CaseType) ? (normalized as CaseType) : 'other';
};

/**
 * Validates and normalizes a case status value.
 * Returns 'open' if the value doesn't match any valid status.
 * 
 * @param value - Raw status string from import
 * @returns Valid CaseStatus value
 */
const validateStatus = (value: string): CaseStatus => {
  const statuses: CaseStatus[] = ['open', 'pending', 'closed', 'archived'];
  const normalized = value?.toLowerCase().trim();
  return statuses.includes(normalized as CaseStatus) ? (normalized as CaseStatus) : 'open';
};

/**
 * Validates and normalizes a priority value.
 * Returns 'medium' if the value doesn't match any valid priority.
 * 
 * @param value - Raw priority string from import
 * @returns Valid CasePriority value
 */
const validatePriority = (value: string): CasePriority => {
  const priorities: CasePriority[] = ['low', 'medium', 'high', 'urgent'];
  const normalized = value?.toLowerCase().trim();
  return priorities.includes(normalized as CasePriority) ? (normalized as CasePriority) : 'medium';
};

/**
 * Validates and normalizes a boolean value from import.
 * Accepts 'yes', 'true', '1' as true values.
 * 
 * @param value - Raw boolean string from import
 * @returns Boolean value
 */
const validateBoolean = (value: string): boolean => {
  const normalized = String(value || '').toLowerCase().trim();
  return ['yes', 'true', '1'].includes(normalized);
};

/**
 * Imports legal cases from an Excel file.
 * Parses the file and validates all fields according to expected types.
 * 
 * @param file - Excel file to import
 * @returns Promise resolving to array of CaseFormData objects
 */
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

        // Map each row to a CaseFormData object with validation
        const cases: CaseFormData[] = jsonData.map((row: any) => {
          const caseType = validateCaseType(row['Type'] || row['type'] || '');
          
          return {
            caseNumber: String(row['Case Number'] || row['caseNumber'] || ''),
            title: String(row['Title'] || row['title'] || ''),
            client: String(row['Client'] || row['client'] || ''),
            opposingParty: String(row['Opposing Party'] || row['opposingParty'] || ''),
            type: caseType,
            status: validateStatus(row['Status'] || row['status'] || ''),
            priority: validatePriority(row['Priority'] || row['priority'] || ''),
            court: String(row['Court'] || row['court'] || ''),
            judge: String(row['Judge'] || row['judge'] || ''),
            filingDate: String(row['Filing Date'] || row['filingDate'] || ''),
            nextHearing: String(row['Next Hearing'] || row['nextHearing'] || ''),
            description: String(row['Description'] || row['description'] || ''),
            notes: String(row['Notes'] || row['notes'] || ''),
            judgmentCollected: validateBoolean(row['Judgment Collected'] || row['judgmentCollected'] || ''),
            lastCounsel: String(row['Last Counsel'] || row['lastCounsel'] || ''),
            isArchived: validateBoolean(row['Archived'] || row['isArchived'] || ''),
            // Garnishee fields (only populated if type is garnishee)
            garnisheeDetails: caseType === 'garnishee' ? {
              garnisheeCourt: String(row['Garnishee Court'] || row['garnisheeCourt'] || ''),
              representedGarnishee: String(row['Represented Garnishee'] || row['representedGarnishee'] || ''),
              garnisheeComment: String(row['Garnishee Comment'] || row['garnisheeComment'] || ''),
              garnisheeDeadline: String(row['Garnishee Deadline'] || row['garnisheeDeadline'] || ''),
            } : undefined,
          };
        });

        resolve(cases);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

/**
 * Downloads a template Excel file for case imports.
 * Contains sample data demonstrating the expected format for both
 * regular cases and garnishee proceedings.
 */
export const downloadTemplate = () => {
  const templateData = [
    {
      'Case Number': 'CASE-2024-001',
      'Title': 'Sample Civil Case',
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
      'Judgment Collected': 'No',
      'Last Counsel': 'John Smith',
      'Archived': 'No',
      'Garnishee Court': '',
      'Represented Garnishee': '',
      'Garnishee Comment': '',
      'Garnishee Deadline': '',
    },
    {
      'Case Number': 'GARN-2024-001',
      'Title': 'Sample Garnishee Proceeding',
      'Client': 'ABC Company',
      'Opposing Party': 'XYZ Corp',
      'Type': 'garnishee',
      'Status': 'pending',
      'Priority': 'high',
      'Court': 'High Court',
      'Judge': 'Hon. Judge Name',
      'Filing Date': '2024-01-20',
      'Next Hearing': '2024-03-01',
      'Description': 'Garnishee proceeding description',
      'Notes': 'Case notes',
      'Judgment Collected': 'Yes',
      'Last Counsel': 'Jane Doe',
      'Archived': 'No',
      'Garnishee Court': 'Commercial Court',
      'Represented Garnishee': 'Third Party Bank',
      'Garnishee Comment': 'Awaiting bank response on funds held',
      'Garnishee Deadline': '2024-02-28',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, 'case_import_template.xlsx');
};
