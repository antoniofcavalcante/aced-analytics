import { StudentGrade, StudentAttendance, ClassStats, StudentRanking, StudentData } from '@/types/student';

export const getUniqueClasses = (grades: StudentGrade[]): string[] => {
  return [...new Set(grades.map(g => g.turma))].sort();
};

export const getUniqueSubjects = (grades: StudentGrade[]): string[] => {
  return [...new Set(grades.map(g => g.disciplina))].sort();
};

export const getClassStats = (
  grades: StudentGrade[],
  attendance: StudentAttendance[],
  turma?: string,
  disciplina?: string
): ClassStats[] => {
  let filteredGrades = grades;
  
  if (turma) {
    filteredGrades = filteredGrades.filter(g => g.turma === turma);
  }
  if (disciplina) {
    filteredGrades = filteredGrades.filter(g => g.disciplina === disciplina);
  }
  
  const groupedByClass = filteredGrades.reduce((acc, grade) => {
    const key = `${grade.turma}-${grade.disciplina}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(grade);
    return acc;
  }, {} as Record<string, StudentGrade[]>);
  
  return Object.entries(groupedByClass).map(([key, classGrades]) => {
    const [turmaName, disciplinaName] = key.split('-');
    const validGrades = classGrades.filter(g => g.mediaFinal !== null);
    const mediaTurma = validGrades.reduce((sum, g) => sum + (g.mediaFinal || 0), 0) / validGrades.length;
    
    const alunosAprovadosNota = classGrades.filter(g => g.situacaoNota === 'APROVADO').length;
    const percentualAprovacaoNotas = (alunosAprovadosNota / classGrades.length) * 100;
    
    const classAttendance = attendance.filter(a => 
      a.turma === turmaName && a.disciplina === disciplinaName
    );
    const alunosAprovadosPresenca = classAttendance.filter(a => a.situacaoPresenca === 'APROVADO').length;
    const percentualAprovacaoPresenca = classAttendance.length > 0 
      ? (alunosAprovadosPresenca / classAttendance.length) * 100 
      : 0;
    
    return {
      turma: turmaName,
      disciplina: disciplinaName,
      mediaTurma: Math.round(mediaTurma * 10) / 10,
      percentualAprovacaoNotas: Math.round(percentualAprovacaoNotas * 10) / 10,
      percentualAprovacaoPresenca: Math.round(percentualAprovacaoPresenca * 10) / 10,
      totalAlunos: classGrades.length,
      alunosAprovadosNota,
      alunosAprovadosPresenca,
    };
  });
};

export const getTopStudents = (
  grades: StudentGrade[],
  attendance: StudentAttendance[],
  type: 'media' | 'evolucao' | 'presenca',
  limit: number = 5
): StudentRanking[] => {
  let rankings: StudentRanking[] = [];
  
  if (type === 'media') {
    const studentAverages = grades.reduce((acc, grade) => {
      if (!acc[grade.estudante]) {
        acc[grade.estudante] = { total: 0, count: 0, turma: grade.turma };
      }
      if (grade.mediaFinal !== null) {
        acc[grade.estudante].total += grade.mediaFinal;
        acc[grade.estudante].count += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number; turma: string }>);
    
    rankings = Object.entries(studentAverages)
      .map(([nome, data]) => ({
        nome,
        turma: data.turma,
        valor: data.total / data.count,
        tipo: 'media' as const,
      }))
      .sort((a, b) => b.valor - a.valor);
  } else if (type === 'evolucao') {
    const studentEvolution = grades.reduce((acc, grade) => {
      if (!acc[grade.estudante]) {
        acc[grade.estudante] = { total: 0, count: 0, turma: grade.turma };
      }
      if (grade.evolucao1x2 !== null) {
        acc[grade.estudante].total += grade.evolucao1x2;
        acc[grade.estudante].count += 1;
      }
      if (grade.evolucao2x3 !== null) {
        acc[grade.estudante].total += grade.evolucao2x3;
        acc[grade.estudante].count += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number; turma: string }>);
    
    rankings = Object.entries(studentEvolution)
      .filter(([_, data]) => data.count > 0)
      .map(([nome, data]) => ({
        nome,
        turma: data.turma,
        valor: data.total / data.count,
        tipo: 'evolucao' as const,
      }))
      .sort((a, b) => b.valor - a.valor);
  } else if (type === 'presenca') {
    const studentPresence = attendance.reduce((acc, att) => {
      if (!acc[att.estudante]) {
        acc[att.estudante] = { total: 0, count: 0, turma: att.turma };
      }
      acc[att.estudante].total += att.percentualPresenca;
      acc[att.estudante].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; turma: string }>);
    
    rankings = Object.entries(studentPresence)
      .map(([nome, data]) => ({
        nome,
        turma: data.turma,
        valor: data.total / data.count,
        tipo: 'presenca' as const,
      }))
      .sort((a, b) => b.valor - a.valor);
  }
  
  return rankings.slice(0, limit);
};

export const getStudentData = (
  studentName: string,
  grades: StudentGrade[],
  attendance: StudentAttendance[]
): StudentData | null => {
  const studentGrades = grades.filter(g => g.estudante === studentName);
  const studentAttendance = attendance.filter(a => a.estudante === studentName);
  
  if (studentGrades.length === 0) return null;
  
  return {
    nome: studentName,
    turma: studentGrades[0].turma,
    grades: studentGrades,
    attendance: studentAttendance,
  };
};

export const getGradeDistribution = (grades: StudentGrade[]): Record<string, number> => {
  const distribution = {
    '< 5.0': 0,
    '5.0 - 6.0': 0,
    '6.0 - 7.0': 0,
    '7.0 - 8.0': 0,
    '8.0 - 9.0': 0,
    '9.0 - 10.0': 0,
  };
  
  grades.forEach(grade => {
    if (grade.mediaFinal === null) return;
    
    const avg = grade.mediaFinal;
    if (avg < 5) distribution['< 5.0']++;
    else if (avg < 6) distribution['5.0 - 6.0']++;
    else if (avg < 7) distribution['6.0 - 7.0']++;
    else if (avg < 8) distribution['7.0 - 8.0']++;
    else if (avg < 9) distribution['8.0 - 9.0']++;
    else distribution['9.0 - 10.0']++;
  });
  
  return distribution;
};

export const getStudentsAtRisk = (
  grades: StudentGrade[],
  attendance: StudentAttendance[]
): Array<{ nome: string; turma: string; motivo: string }> => {
  const atRisk: Array<{ nome: string; turma: string; motivo: string }> = [];
  
  // Students with grades between 5.0-6.0
  const gradeRisk = grades.filter(g => 
    g.mediaFinal !== null && g.mediaFinal >= 5.0 && g.mediaFinal <= 6.0
  );
  
  gradeRisk.forEach(g => {
    atRisk.push({
      nome: g.estudante,
      turma: g.turma,
      motivo: `Média próxima do limite: ${g.mediaFinal} em ${g.disciplina}`,
    });
  });
  
  // Students with attendance between 70-75%
  const attendanceRisk = attendance.filter(a => 
    a.percentualPresenca >= 70 && a.percentualPresenca <= 75
  );
  
  attendanceRisk.forEach(a => {
    atRisk.push({
      nome: a.estudante,
      turma: a.turma,
      motivo: `Presença próxima do limite: ${a.percentualPresenca}% em ${a.disciplina}`,
    });
  });
  
  return atRisk;
};
