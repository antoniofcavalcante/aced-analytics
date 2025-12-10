import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentData, StudentGrade, StudentAttendance, ClassStats } from '@/types/student';

// Professional color palette
const COLORS = {
  primary: [30, 64, 175] as [number, number, number],
  secondary: [59, 130, 246] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  light: [243, 244, 246] as [number, number, number],
};

const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Header background
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 18, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 105, 28, { align: 'center' });
  }
};

const addSectionTitle = (doc: jsPDF, title: string, y: number): number => {
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.rect(15, y - 5, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, y + 2);
  return y + 12;
};

const addFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer line
    doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 15, 195, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 15, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, 195, pageHeight - 8, { align: 'right' });
  }
};

export const generateStudentPDF = (studentData: StudentData) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Relatório Individual do Aluno', studentData.nome);
  
  // Student info card
  let currentY = 45;
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, currentY, 180, 20, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Aluno:', 20, currentY + 8);
  doc.text('Turma:', 20, currentY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(studentData.nome, 45, currentY + 8);
  doc.text(studentData.turma, 45, currentY + 15);
  
  currentY = 75;
  
  // Grades section
  currentY = addSectionTitle(doc, '📊 Notas e Desempenho Acadêmico', currentY);
  
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
    startY: currentY,
    head: [['Disciplina', '1º Bim', '2º Bim', '3º Bim', '4º Bim', 'Média', 'Situação']],
    body: gradesData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 45 },
      6: { 
        fontStyle: 'bold',
        cellPadding: { left: 2, right: 2, top: 2, bottom: 2 }
      }
    },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === 'body') {
        const value = data.cell.raw as string;
        if (value === 'Aprovado') {
          data.cell.styles.textColor = COLORS.success;
        } else if (value === 'Reprovado') {
          data.cell.styles.textColor = COLORS.danger;
        }
      }
    }
  });
  
  // Attendance section
  currentY = (doc as any).lastAutoTable.finalY + 15;
  currentY = addSectionTitle(doc, '📅 Frequência e Presença', currentY);
  
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
    startY: currentY,
    head: [['Disciplina', 'F. 1º', 'F. 2º', 'F. 3º', 'F. 4º', 'Total', 'Presença', 'Situação']],
    body: attendanceData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.secondary,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 7,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 40 },
      7: { fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const value = data.cell.raw as string;
        if (value === 'Aprovado') {
          data.cell.styles.textColor = COLORS.success;
        } else if (value === 'Reprovado') {
          data.cell.styles.textColor = COLORS.danger;
        }
      }
    }
  });
  
  addFooter(doc);
  doc.save(`relatorio_${studentData.nome.replace(/\s+/g, '_')}.pdf`);
};

export interface ClassReportData {
  turma: string;
  disciplina: string;
  stats: ClassStats;
  grades: StudentGrade[];
  attendance: StudentAttendance[];
}

export interface ChartImages {
  gradeDistribution: string;
  pieChart: string;
  evolutionChart: string;
}

export const generateClassReportPDF = (data: ClassReportData, chartImages?: ChartImages) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Relatório de Turma', `${data.turma} - ${data.disciplina}`);
  
  let currentY = 45;
  
  // Stats summary cards
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, currentY, 55, 30, 3, 3, 'F');
  doc.roundedRect(77, currentY, 55, 30, 3, 3, 'F');
  doc.roundedRect(139, currentY, 55, 30, 3, 3, 'F');
  
  // Card 1 - Total students
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text('Total de Alunos', 42.5, currentY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.stats.totalAlunos.toString(), 42.5, currentY + 23, { align: 'center' });
  
  // Card 2 - Class average
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Média da Turma', 104.5, currentY + 10, { align: 'center' });
  doc.setFontSize(20);
  const avgColor = data.stats.mediaTurma >= 5 ? COLORS.success : COLORS.danger;
  doc.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.stats.mediaTurma.toFixed(1), 104.5, currentY + 23, { align: 'center' });
  
  // Card 3 - Approval rate
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Taxa Aprovação', 166.5, currentY + 10, { align: 'center' });
  doc.setFontSize(20);
  const approvalColor = data.stats.percentualAprovacaoNotas >= 60 ? COLORS.success : COLORS.warning;
  doc.setTextColor(approvalColor[0], approvalColor[1], approvalColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.stats.percentualAprovacaoNotas.toFixed(0)}%`, 166.5, currentY + 23, { align: 'center' });
  
  currentY = 85;
  
  // Add charts if available
  if (chartImages) {
    // Grade Distribution Chart
    if (chartImages.gradeDistribution) {
      currentY = addSectionTitle(doc, '📊 Distribuição de Notas', currentY);
      doc.addImage(chartImages.gradeDistribution, 'PNG', 15, currentY, 180, 75);
      currentY += 85;
    }
    
    // Check if we need new page
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }
    
    // Pie Chart
    if (chartImages.pieChart) {
      currentY = addSectionTitle(doc, '🎯 Situação de Aprovação', currentY);
      doc.addImage(chartImages.pieChart, 'PNG', 15, currentY, 180, 75);
      currentY += 85;
    }
    
    // Check if we need new page
    if (currentY > 180) {
      doc.addPage();
      currentY = 20;
    }
    
    // Evolution Chart
    if (chartImages.evolutionChart) {
      currentY = addSectionTitle(doc, '📈 Evolução por Bimestre', currentY);
      doc.addImage(chartImages.evolutionChart, 'PNG', 15, currentY, 180, 75);
      currentY += 85;
    }
  }
  
  // Check if we need new page for tables
  if (currentY > 140) {
    doc.addPage();
    currentY = 20;
  }
  
  // Stats table
  currentY = addSectionTitle(doc, '📋 Indicadores Detalhados', currentY);
  
  const statsData = [
    ['Média Geral da Turma', data.stats.mediaTurma.toFixed(2)],
    ['Alunos Aprovados por Nota', `${data.stats.alunosAprovadosNota} de ${data.stats.totalAlunos} (${data.stats.percentualAprovacaoNotas.toFixed(1)}%)`],
    ['Alunos Aprovados por Presença', `${data.stats.alunosAprovadosPresenca} de ${data.stats.totalAlunos} (${data.stats.percentualAprovacaoPresenca.toFixed(1)}%)`],
    ['Alunos Reprovados por Nota', `${data.stats.totalAlunos - data.stats.alunosAprovadosNota} (${(100 - data.stats.percentualAprovacaoNotas).toFixed(1)}%)`],
    ['Alunos Reprovados por Presença', `${data.stats.totalAlunos - data.stats.alunosAprovadosPresenca} (${(100 - data.stats.percentualAprovacaoPresenca).toFixed(1)}%)`],
  ];
  
  autoTable(doc, {
    startY: currentY,
    head: [['Indicador', 'Valor']],
    body: statsData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 80 }
    },
  });
  
  // New page for student tables
  doc.addPage();
  currentY = 20;
  
  // Students grades section
  currentY = addSectionTitle(doc, '📝 Notas dos Alunos', currentY);
  
  const studentMap = new Map<string, StudentGrade>();
  data.grades.forEach(g => {
    if (!studentMap.has(g.estudante)) {
      studentMap.set(g.estudante, g);
    }
  });
  
  const gradesTableData = Array.from(studentMap.values())
    .sort((a, b) => (b.mediaFinal || 0) - (a.mediaFinal || 0))
    .map((g, index) => [
      (index + 1).toString(),
      g.estudante,
      g.nota1Bim?.toString() || '-',
      g.nota2Bim?.toString() || '-',
      g.nota3Bim?.toString() || '-',
      g.nota4Bim?.toString() || '-',
      g.mediaFinal?.toFixed(1) || '-',
      g.situacaoNota,
    ]);
  
  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Aluno', '1º Bim', '2º Bim', '3º Bim', '4º Bim', 'Média', 'Situação']],
    body: gradesTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.primary,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 7,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { halign: 'left', cellWidth: 50 },
      7: { fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const value = data.cell.raw as string;
        if (value === 'Aprovado') {
          data.cell.styles.textColor = COLORS.success;
        } else if (value === 'Reprovado') {
          data.cell.styles.textColor = COLORS.danger;
        }
      }
    }
  });
  
  // Check if we need new page for attendance
  currentY = (doc as any).lastAutoTable.finalY + 15;
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }
  
  // Students attendance section
  currentY = addSectionTitle(doc, '📅 Frequência dos Alunos', currentY);
  
  const attendanceMap = new Map<string, StudentAttendance>();
  data.attendance.forEach(a => {
    if (!attendanceMap.has(a.estudante)) {
      attendanceMap.set(a.estudante, a);
    }
  });
  
  const attendanceTableData = Array.from(attendanceMap.values())
    .sort((a, b) => b.percentualPresenca - a.percentualPresenca)
    .map((a, index) => [
      (index + 1).toString(),
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
    startY: currentY,
    head: [['#', 'Aluno', 'F. 1º', 'F. 2º', 'F. 3º', 'F. 4º', 'Total', 'Presença', 'Situação']],
    body: attendanceTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: COLORS.secondary,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 7,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { halign: 'left', cellWidth: 45 },
      8: { fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.column.index === 8 && data.section === 'body') {
        const value = data.cell.raw as string;
        if (value === 'Aprovado') {
          data.cell.styles.textColor = COLORS.success;
        } else if (value === 'Reprovado') {
          data.cell.styles.textColor = COLORS.danger;
        }
      }
    }
  });
  
  addFooter(doc);
  
  const filename = `relatorio_${data.turma.replace(/\s+/g, '_')}_${data.disciplina.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
