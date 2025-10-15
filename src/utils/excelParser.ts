import * as XLSX from 'xlsx';
import { StudentGrade, StudentAttendance } from '@/types/student';

export const parseExcelFile = async (file: File): Promise<{
  grades: StudentGrade[];
  attendance: StudentAttendance[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Parse grades (first sheet)
        const gradesSheet = workbook.Sheets[workbook.SheetNames[0]];
        const gradesData = XLSX.utils.sheet_to_json(gradesSheet);
        
        const grades: StudentGrade[] = gradesData.map((row: any) => ({
          estudante: row['ESTUDANTE'] || '',
          turma: row['TURMA'] || '',
          disciplina: row['DISCIPLINA'] || '',
          nota1Bim: parseValue(row['NOTA 1º BIMESTRE']),
          nota2Bim: parseValue(row['NOTA 2º BIMESTRE']),
          nota3Bim: parseValue(row['NOTA 3º BIMESTRE']),
          nota4Bim: parseValue(row['NOTA 4º BIMESTRE']),
          evolucao1x2: parseValue(row['EVOLUÇÃO 1º BIM X 2ºBIM']),
          evolucao2x3: parseValue(row['EVOLUÇÃO 2º BIM X 3º BIM']),
          evolucao3x4: parseValue(row['EVOLUÇÃO 3º BIM X 4º BIM']),
          mediaFinal: parseValue(row['MÉDIA FINAL']),
          situacaoNota: row['SITUAÇÃO NOTA'] || 'REPROVADO',
        }));
        
        // Parse attendance (second sheet)
        let attendance: StudentAttendance[] = [];
        if (workbook.SheetNames.length > 1) {
          const attendanceSheet = workbook.Sheets[workbook.SheetNames[1]];
          const attendanceData = XLSX.utils.sheet_to_json(attendanceSheet);
          
          attendance = attendanceData.map((row: any) => ({
            estudante: row['ESTUDANTE'] || '',
            turma: row['TURMA'] || '',
            disciplina: row['DISCIPLINA'] || '',
            faltas1Bim: parseValue(row['FALTAS 1º BIMESTRE']),
            faltas2Bim: parseValue(row['FALTAS 2º BIMESTRE']),
            faltas3Bim: parseValue(row['FALTAS 3º BIMESTRE']),
            totalAulas: parseValue(row['TOTAL DE AULAS']) || 0,
            totalFaltas: parseValue(row['TOTAL DE FALTAS']) || 0,
            percentualPresenca: parseValue(row['PERCENTUAL DE PRESENÇA']) || 0,
            situacaoPresenca: row['SITUAÇÃO PRESENÇA'] || 'REPROVADO',
          }));
        }
        
        resolve({ grades, attendance });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const parseValue = (value: any): number | null => {
  if (value === undefined || value === null || value === '' || value === '-') {
    return null;
  }
  const parsed = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  return isNaN(parsed) ? null : parsed;
};

export const saveDataToLocalStorage = (grades: StudentGrade[], attendance: StudentAttendance[]) => {
  localStorage.setItem('studentGrades', JSON.stringify(grades));
  localStorage.setItem('studentAttendance', JSON.stringify(attendance));
};

export const loadDataFromLocalStorage = (): {
  grades: StudentGrade[];
  attendance: StudentAttendance[];
} | null => {
  const gradesStr = localStorage.getItem('studentGrades');
  const attendanceStr = localStorage.getItem('studentAttendance');
  
  if (gradesStr && attendanceStr) {
    return {
      grades: JSON.parse(gradesStr),
      attendance: JSON.parse(attendanceStr),
    };
  }
  
  return null;
};
