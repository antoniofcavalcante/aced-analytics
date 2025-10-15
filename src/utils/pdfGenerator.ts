import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentData } from '@/types/student';

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
    a.totalFaltas.toString(),
    `${a.percentualPresenca.toFixed(1)}%`,
    a.situacaoPresenca,
  ]);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Disciplina', 'Faltas 1º', 'Faltas 2º', 'Faltas 3º', 'Total Faltas', 'Presença', 'Situação']],
    body: attendanceData,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 9 },
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, pageHeight - 10, { align: 'center' });
  
  // Save PDF
  doc.save(`relatorio_${studentData.nome.replace(/\s+/g, '_')}.pdf`);
};
