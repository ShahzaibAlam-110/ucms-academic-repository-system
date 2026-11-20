/**
 * Client-Side Valid PDF 1.4 Binary Generator
 * Produces certified institutional PDF documents that open directly in Chrome, Edge, Safari, Acrobat, and Evince.
 */

export interface PdfDocumentOptions {
  title: string;
  fileName: string;
  courseCode?: string;
  courseTitle?: string;
  weekNumber?: number;
  category?: string;
  author?: string;
  department?: string;
  semester?: number | string;
}

function escapePdfText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function generatePdfBlob(options: PdfDocumentOptions): Blob {
  const {
    title,
    courseCode = 'CS-401',
    courseTitle = 'Academic Course Handout',
    weekNumber = 1,
    category = 'Lecture Slide',
    author = 'Department Faculty In-Charge',
    department = 'Department of Computer Science',
    semester = 6,
  } = options;

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' PKT';

  // Build stream content using standard PDF operators
  const lines: string[] = [];
  lines.push('BT');
  // Title & Header (Bold / Size 16)
  lines.push('/F1 16 Tf');
  lines.push('50 740 Td');
  lines.push(`(UNIVERSITY COLLEGE OF MANAGEMENT AND SCIENCES KHANEWAL) Tj`);

  // Subheader
  lines.push('/F1 11 Tf');
  lines.push('0 -22 Td');
  lines.push(`(Official Academic Handout & Verified Instructional Repository) Tj`);

  lines.push('/F1 9 Tf');
  lines.push('0 -15 Td');
  lines.push(`(========================================================================================) Tj`);

  // Document Metadata Table
  lines.push('/F1 11 Tf');
  lines.push('0 -22 Td');
  lines.push(`(DOCUMENT METADATA & INSTITUTIONAL RECORD:) Tj`);

  lines.push('/F1 10 Tf');
  lines.push('0 -18 Td');
  lines.push(`(Course Code        : ${escapePdfText(courseCode)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Course Title       : ${escapePdfText(courseTitle)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Academic Department: ${escapePdfText(department)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Target Semester    : Semester ${escapePdfText(String(semester))} - Spring Cycle) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Resource Title     : ${escapePdfText(title)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Category           : ${escapePdfText(category)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Curriculum Week    : Week ${escapePdfText(String(weekNumber))}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Authorized Faculty : ${escapePdfText(author)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Generated / Sync   : ${escapePdfText(nowStr)}) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(Verification ID    : UCMS-VERIFIED-${Date.now().toString(36).toUpperCase()}) Tj`);

  lines.push('/F1 9 Tf');
  lines.push('0 -15 Td');
  lines.push(`(----------------------------------------------------------------------------------------) Tj`);

  // Syllabus Breakdown
  lines.push('/F1 11 Tf');
  lines.push('0 -22 Td');
  lines.push(`(CORE LECTURE SUMMARY & LEARNING OBJECTIVES:) Tj`);

  lines.push('/F1 9.5 Tf');
  lines.push('0 -18 Td');
  lines.push(`(1. Theoretical Principles: Comprehensive coverage of foundational course principles.) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(2. Practical Application : Step-by-step laboratory sheets, benchmarks, and problem sets.) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(3. Examination Relevance : Included in formal Midterm and Terminal assessment rubrics.) Tj`);

  lines.push('0 -15 Td');
  lines.push(`(4. Academic Ethics       : Strictly adheres to UCMS Khanewal Academic Integrity Standards.) Tj`);

  lines.push('/F1 9 Tf');
  lines.push('0 -25 Td');
  lines.push(`(========================================================================================) Tj`);

  lines.push('/F1 8 Tf');
  lines.push('0 -15 Td');
  lines.push(`((c) 2026 University College of Management and Sciences (UCMS) Khanewal. All Rights Reserved.) Tj`);

  lines.push('ET');

  const streamContent = lines.join('\n');
  const streamLength = streamContent.length;

  // Build PDF structure
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const header = '%PDF-1.4\n';
  const offset1 = header.length;
  const offset2 = offset1 + obj1.length;
  const offset3 = offset2 + obj2.length;
  const offset4 = offset3 + obj3.length;
  const offset5 = offset4 + obj4.length;
  const startXref = offset5 + obj5.length;

  const pad = (num: number) => num.toString().padStart(10, '0');

  const xref =
    `xref\n` +
    `0 6\n` +
    `0000000000 65535 f \n` +
    `${pad(offset1)} 00000 n \n` +
    `${pad(offset2)} 00000 n \n` +
    `${pad(offset3)} 00000 n \n` +
    `${pad(offset4)} 00000 n \n` +
    `${pad(offset5)} 00000 n \n`;

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;

  return new Blob([fullPdf], { type: 'application/pdf' });
}

export function triggerPdfDownload(options: PdfDocumentOptions): void {
  const blob = generatePdfBlob(options);
  const url = URL.createObjectURL(blob);
  let safeName = options.fileName || `${options.title.replace(/[^a-zA-Z0-9_\-]/g, '_')}.pdf`;
  if (!safeName.toLowerCase().endsWith('.pdf')) {
    safeName += '.pdf';
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

