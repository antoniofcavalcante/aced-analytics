import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentData, StudentGrade, StudentAttendance, ClassStats } from '@/types/student';

export const generateStudentPDF = (studentData: StudentData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text('Relatório Individual do Aluno', 105, 20, { align: 'center' });
  
  // Student info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Aluno: ${studentData.nome}`, 20, 35);
  doc.text(`Turma: ${studentData.turma}`, 20, 42);
  
  // Grades section
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Notas e Desempenho', 20, 55);
  
  const gradesData = studentData.grades.map(g => [
    g.disciplina,
    g.nota1Bim?.toString() || '-',
    g.nota2Bim?.toString() || '-',
    g.nota3Bim?.toString() || '-',
    g.nota4Bim?.toString() || '-',
    g.mediaFinal?.toFixed(1) || '-',
    g.situacaoNota,
  ]);
  
  autoTable(doc, {
    startY: 60,
    head: [['Disciplina', '1º Bim', '2º Bim', '3º Bim', '4º Bim', 'Média', 'Situação']],
    body: gradesData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 9 },
  });
  
  // Attendance section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Frequência', 20, finalY);
  
  const attendanceData = studentData.attendance.map(a => [
    a.disciplina,
    a.faltas1Bim?.toString() || '-',
    a.faltas2Bim?.toString() || '-',
    a.faltas3Bim?.toString() || '-',
    a.faltas4Bim?.toString() || '-',
    a.totalFaltas.toString(),
    `${a.percentualPresenca.toFixed(1)}%`,
    a.situacaoPresenca,
  ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Disciplina', 'Faltas 1º', 'Faltas 2º', 'Faltas 3º', 'Faltas 4º', 'Total', 'Presença', 'Situação']],
    body: attendanceData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 8 },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, pageHeight - 10, { align: 'center' });
  
  // Save PDF
  doc.save(`relatorio_${studentData.nome.replace(/\s+/g, '_')}.pdf`);
};

export interface ClassReportData {
  turma: string;
  disciplina: string;
  stats: ClassStats;
  grades: StudentGrade[];
  attendance: StudentAttendance[];
}

export const generateClassReportPDF = (data: ClassReportData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('Relatório da Turma', 105, 20, { align: 'center' });
  
  // Class info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Turma: ${data.turma}`, 20, 35);
  doc.text(`Disciplina: ${data.disciplina}`, 20, 42);
  doc.text(`Total de Alunos: ${data.stats.totalAlunos}`, 20, 49);
  
  // Stats section
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Estatísticas da Turma', 20, 62);
  
  const statsData = [
    ['Média da Turma', data.stats.mediaTurma.toFixed(1)],
    ['Aprovados por Nota', `${data.stats.alunosAprovadosNota} (${data.stats.percentualAprovacaoNotas.toFixed(1)}%)`],
    ['Aprovados por Presença', `${data.stats.alunosAprovadosPresenca} (${data.stats.percentualAprovacaoPresenca.toFixed(1)}%)`],
  ];
  
  autoTable(doc, {
    startY: 67,
    head: [['Indicador', 'Valor']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 10 },
  });
  
  // Students grades section
  let currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Notas dos Alunos', 20, currentY);
  
  // Group grades by student
  const studentMap = new Map<string, StudentGrade>();
  data.grades.forEach(g => {
    if (!studentMap.has(g.estudante)) {
      studentMap.set(g.estudante, g);
    }
  });
  
  const gradesTableData = Array.from(studentMap.values()).map(g => [
    g.estudante,
    g.nota1Bim?.toString() || '-',
    g.nota2Bim?.toString() || '-',
    g.nota3Bim?.toString() || '-',
    g.nota4Bim?.toString() || '-',
    g.mediaFinal?.toFixed(1) || '-',
    g.situacaoNota,
  ]);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Aluno', '1º Bim', '2º Bim', '3º Bim', '4º Bim', 'Média', 'Situação']],
    body: gradesTableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 55 },
    },
  });
  
  // Check if we need a new page for attendance
  currentY = (doc as any).lastAutoTable.finalY + 10;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }
  
  // Students attendance section
  doc.setFontSize(14);
  doc.setTextColor(30, 64, 175);
  doc.text('Frequência dos Alunos', 20, currentY);
  
  // Group attendance by student
  const attendanceMap = new Map<string, StudentAttendance>();
  data.attendance.forEach(a => {
    if (!attendanceMap.has(a.estudante)) {
      attendanceMap.set(a.estudante, a);
    }
  });
  
  const attendanceTableData = Array.from(attendanceMap.values()).map(a => [
    a.estudante,
    a.faltas1Bim?.toString() || '-',
    a.faltas2Bim?.toString() || '-',
    a.faltas3Bim?.toString() || '-',
    a.faltas4Bim?.toString() || '-',
    a.totalFaltas.toString(),
    `${a.percentualPresenca.toFixed(1)}%`,
    a.situacaoPresenca,
  ]);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Aluno', 'F. 1º', 'F. 2º', 'F. 3º', 'F. 4º', 'Total', 'Presença', 'Situação']],
    body: attendanceTableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 50 },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
  }
  
  // Save PDF
  const filename = `relatorio_${data.turma.replace(/\s+/g, '_')}_${data.disciplina.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
