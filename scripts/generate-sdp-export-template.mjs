import ExcelJS from 'exceljs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const outputPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'SDP_Export_Template_Full_Questions.xlsx');

const identityFields = [
  ['Ticket ID', 'Employee identifier / ticket ID'],
  ['Name', 'Employee full name'],
  ['Sector', 'Employee sector'],
  ['BU', 'Employee business unit'],
  ['BU Head', 'Business-unit head name'],
  ['BUHR', 'Business-unit HR name'],
];

const reflectionFields = [
  ['Question 1 - In three words, I would describe myself as... (Selected words)', 'Up to three words selected by the employee'],
  ['Question 1 - In three words, I would describe myself as... (Written response)', 'Employee-written response in their own words'],
  ['Question 2 - The qualities I want to be known for at work are...', 'Complete employee response'],
  ['Question 3 - The work I genuinely enjoy doing is...', 'Complete employee response'],
  ['Question 4 - Looking back on the past year, what moments best reflect who you are at your best?', 'Complete employee response'],
  ['Question 5 - Looking back on the past year, what moments best reflect where you still have room to grow?', 'Complete employee response'],
  ['Question 6 - Describe the version of yourself that you want to become in the next 3 years.', 'Complete employee response'],
];

const goalFields = Array.from({ length: 3 }, (_, index) => {
  const goal = `Goal ${index + 1}`;
  return [
    [`Development ${goal} - Goal Domain`, 'Functional, Behavioural, or Leadership'],
    [`Development ${goal} - What I want to build`, 'Give this goal a clear, specific title'],
    [`Development ${goal} - Why does this matter to me?`, 'Complete employee response'],
    [`Development ${goal} - I will know I have grown when...`, 'A behaviour or moment, not a number'],
    [`Development ${goal} - Action Plan - Do (70%): What will I practise, own, or deliver at work?`, 'Complete employee response'],
    [`Development ${goal} - Action Plan - Learn (10%): What will I read, study, or complete?`, 'Complete employee response'],
    [`Development ${goal} - Action Plan - Connect (20%): Who will I observe, learn from, or ask for feedback?`, 'Complete employee response'],
    [`Development ${goal} - Support I need: What do you need from your manager or the organisation? Be specific.`, 'Complete employee response'],
  ];
}).flat();

const conversationFields = [
  ['Mid-year check-in - What is working well?', 'Complete employee response'],
  ['Mid-year check-in - What needs to change?', 'Complete employee response'],
  ['Mid-year check-in - What support do I need from my manager?', 'Complete employee response'],
  ['Year-end check-in - What worked?', 'Complete employee response'],
  ['Year-end check-in - What did not work?', 'Complete employee response'],
  ['Year-end check-in - What strengths did I use and what growth did I achieve?', 'Complete employee response'],
];

const workbook = new ExcelJS.Workbook();
workbook.creator = 'SDP Tool';
workbook.subject = 'Proposed SDP export field template';
workbook.description = 'Review template only; integration is not included.';
workbook.created = new Date();

function addExportSheet(name, responseFields, sectionName, sectionColor) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', xSplit: 2, ySplit: 2 }] });
  const allFields = [...identityFields, ...responseFields];
  sheet.addRow(allFields.map((_, index) => index < identityFields.length ? 'Employee details' : sectionName));
  sheet.addRow(allFields.map(([fieldName]) => fieldName));
  sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: allFields.length } };
  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 72;

  const groups = [
    [1, identityFields.length, 'Employee details', '1F4E78'],
    [identityFields.length + 1, allFields.length, sectionName, sectionColor],
  ];
  for (const [start, end, label, color] of groups) {
    if (end > start) sheet.mergeCells(1, start, 1, end);
    const groupCell = sheet.getCell(1, start);
    groupCell.value = label;
    groupCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    groupCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color}` } };
    groupCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  for (let columnNumber = 1; columnNumber <= allFields.length; columnNumber += 1) {
    const header = sheet.getCell(2, columnNumber);
    header.font = { bold: true, color: { argb: 'FF17365D' }, size: 10 };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    header.alignment = { wrapText: true, vertical: 'middle' };
    header.border = { bottom: { style: 'thin', color: { argb: 'FF9EADBA' } } };
    const column = sheet.getColumn(columnNumber);
    column.width = columnNumber <= identityFields.length ? 20 : 32;
    column.alignment = { vertical: 'top', wrapText: true };
  }

  for (let rowNumber = 3; rowNumber <= 102; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.height = 42;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFD9E2F3' } } };
      cell.alignment = { vertical: 'top', wrapText: true };
    });
  }

  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  sheet.headerFooter.oddHeader = `&C&"Calibri,Bold"${name}`;
  sheet.headerFooter.oddFooter = '&LReview template&RPage &P of &N';
  return sheet;
}

addExportSheet('Reflect Responses', reflectionFields, 'Reflection responses', '4472C4');
const goalsSheet = addExportSheet('Goals', goalFields, 'Development goals', '70AD47');
addExportSheet('Check-ins', conversationFields, 'Check-in responses', 'ED7D31');

for (let goal = 0; goal < 3; goal += 1) {
  const domainColumn = identityFields.length + 1 + (goal * 8);
  const letter = goalsSheet.getColumn(domainColumn).letter;
  goalsSheet.dataValidations.add(`${letter}3:${letter}102`, {
    type: 'list', allowBlank: true, formulae: ['"Functional,Behavioural,Leadership"'],
  });
}

await workbook.xlsx.writeFile(outputPath);
console.log(outputPath);
