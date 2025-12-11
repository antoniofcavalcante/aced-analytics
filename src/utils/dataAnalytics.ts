import { StudentGrade, StudentAttendance, ClassStats, StudentRanking, StudentData, GradeDistribution } from '@/types/student';

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

export const getGradeDistribution = (grades: StudentGrade[]): GradeDistribution[] => {
  const distribution: Record<string, number> = {
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
  
  return Object.entries(distribution).map(([faixa, quantidade]) => ({
    faixa,
    quantidade,
  }));
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

export const getAllStudents = (
  grades: StudentGrade[],
  attendance: StudentAttendance[]
): Array<{ nome: string; turma: string; mediaGeral: number; presencaGeral: number }> => {
  const studentMap = new Map<string, { nome: string; turma: string; totalNota: number; countNota: number; totalPresenca: number; countPresenca: number }>();
  
  grades.forEach(g => {
    if (!studentMap.has(g.estudante)) {
      studentMap.set(g.estudante, {
        nome: g.estudante,
        turma: g.turma,
        totalNota: 0,
        countNota: 0,
        totalPresenca: 0,
        countPresenca: 0,
      });
    }
    const student = studentMap.get(g.estudante)!;
    if (g.mediaFinal !== null) {
      student.totalNota += g.mediaFinal;
      student.countNota += 1;
    }
  });
  
  attendance.forEach(a => {
    if (studentMap.has(a.estudante)) {
      const student = studentMap.get(a.estudante)!;
      student.totalPresenca += a.percentualPresenca;
      student.countPresenca += 1;
    }
  });
  
  return Array.from(studentMap.values())
    .map(s => ({
      nome: s.nome,
      turma: s.turma,
      mediaGeral: s.countNota > 0 ? Math.round((s.totalNota / s.countNota) * 10) / 10 : 0,
      presencaGeral: s.countPresenca > 0 ? Math.round((s.totalPresenca / s.countPresenca) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
};

export interface PedagogicalIntervention {
  estudante: string;
  turma: string;
  prioridade: 'alta' | 'media' | 'baixa';
  tipo: string;
  descricao: string;
  indicador: string;
  sugestaoIntervencao: string;
  bimestre?: string;
}

export const getPedagogicalInterventions = (
  grades: StudentGrade[],
  attendance: StudentAttendance[]
): PedagogicalIntervention[] => {
  const interventions: PedagogicalIntervention[] = [];
  
  // Agrupar por estudante
  const studentGrades = grades.reduce((acc, g) => {
    if (!acc[g.estudante]) acc[g.estudante] = [];
    acc[g.estudante].push(g);
    return acc;
  }, {} as Record<string, StudentGrade[]>);
  
  const studentAttendance = attendance.reduce((acc, a) => {
    if (!acc[a.estudante]) acc[a.estudante] = [];
    acc[a.estudante].push(a);
    return acc;
  }, {} as Record<string, StudentAttendance[]>);
  
  // Analisar cada estudante
  Object.entries(studentGrades).forEach(([estudante, gradesList]) => {
    const turma = gradesList[0]?.turma || '';
    const attList = studentAttendance[estudante] || [];
    
    // Calcular média geral e presença geral
    const validGrades = gradesList.filter(g => g.mediaFinal !== null);
    const mediaGeral = validGrades.length > 0 
      ? validGrades.reduce((sum, g) => sum + (g.mediaFinal || 0), 0) / validGrades.length 
      : 0;
    
    const presencaGeral = attList.length > 0
      ? attList.reduce((sum, a) => sum + a.percentualPresenca, 0) / attList.length
      : 100;
    
    // PRIORIDADE ALTA: Reprovado por nota (< 5.0)
    if (mediaGeral < 5.0 && mediaGeral > 0) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'alta',
        tipo: 'Recuperacao Intensiva',
        descricao: 'Estudante com media abaixo do minimo para aprovacao',
        indicador: `Media: ${mediaGeral.toFixed(1)}`,
        sugestaoIntervencao: 'Plano individualizado de recuperacao com aulas de reforco, atividades complementares e acompanhamento semanal. Contato com familia para alinhamento.'
      });
    }
    
    // PRIORIDADE ALTA: Reprovado por presenca (< 75%)
    if (presencaGeral < 75 && presencaGeral > 0) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'alta',
        tipo: 'Busca Ativa',
        descricao: 'Estudante com frequencia abaixo do minimo',
        indicador: `Presenca: ${presencaGeral.toFixed(1)}%`,
        sugestaoIntervencao: 'Busca ativa imediata, contato com familia, visita domiciliar se necessario. Verificar possiveis causas de inassiduidade e encaminhar para rede de apoio.'
      });
    }
    
    // PRIORIDADE ALTA: Baixa nota E baixa presenca
    if (mediaGeral >= 5.0 && mediaGeral < 6.0 && presencaGeral < 80) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'alta',
        tipo: 'Acompanhamento Integral',
        descricao: 'Estudante com desempenho e frequencia em risco simultaneo',
        indicador: `Media: ${mediaGeral.toFixed(1)} | Presenca: ${presencaGeral.toFixed(1)}%`,
        sugestaoIntervencao: 'Reuniao com familia urgente, plano de acompanhamento integrado com equipe pedagogica e gestao. Monitoramento diario de frequencia e quinzenal de desempenho.'
      });
    }
    
    // PRIORIDADE MEDIA: Nota entre 5.0-6.0 (zona de risco)
    else if (mediaGeral >= 5.0 && mediaGeral < 6.0) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'media',
        tipo: 'Reforco Pedagogico',
        descricao: 'Estudante na zona de risco - media proxima ao limite',
        indicador: `Media: ${mediaGeral.toFixed(1)}`,
        sugestaoIntervencao: 'Incluir em grupos de reforco escolar, atividades de recuperacao paralela. Monitorar evolucao bimestral e ajustar estrategias conforme necessidade.'
      });
    }
    
    // PRIORIDADE MEDIA: Presenca entre 75-80%
    else if (presencaGeral >= 75 && presencaGeral < 80) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'media',
        tipo: 'Monitoramento de Frequencia',
        descricao: 'Estudante com frequencia proxima ao limite',
        indicador: `Presenca: ${presencaGeral.toFixed(1)}%`,
        sugestaoIntervencao: 'Acompanhamento semanal de faltas, contato preventivo com familia. Identificar padroes de ausencia e trabalhar motivacao escolar.'
      });
    }
    
    // PRIORIDADE BAIXA: Nota entre 6.0-7.0 (pode melhorar)
    else if (mediaGeral >= 6.0 && mediaGeral < 7.0) {
      interventions.push({
        estudante,
        turma,
        prioridade: 'baixa',
        tipo: 'Estimulo ao Desenvolvimento',
        descricao: 'Estudante com potencial de melhoria',
        indicador: `Media: ${mediaGeral.toFixed(1)}`,
        sugestaoIntervencao: 'Oferecer atividades desafiadoras, monitoria entre pares, participacao em projetos. Reconhecer progressos para manter motivacao.'
      });
    }
    
    // Analisar evolucao negativa entre bimestres
    gradesList.forEach(g => {
      if (g.evolucao1x2 !== null && g.evolucao1x2 < -1.5) {
        interventions.push({
          estudante,
          turma,
          prioridade: 'media',
          tipo: 'Queda de Desempenho',
          descricao: `Queda significativa do 1o para 2o bimestre em ${g.disciplina}`,
          indicador: `Variacao: ${g.evolucao1x2.toFixed(1)} pontos`,
          sugestaoIntervencao: 'Investigar causas da queda (dificuldade no conteudo, problemas pessoais). Reforco especifico na disciplina e acompanhamento mais proximo.',
          bimestre: '1o - 2o Bim'
        });
      }
      if (g.evolucao2x3 !== null && g.evolucao2x3 < -1.5) {
        interventions.push({
          estudante,
          turma,
          prioridade: 'media',
          tipo: 'Queda de Desempenho',
          descricao: `Queda significativa do 2o para 3o bimestre em ${g.disciplina}`,
          indicador: `Variacao: ${g.evolucao2x3.toFixed(1)} pontos`,
          sugestaoIntervencao: 'Investigar causas da queda (dificuldade no conteudo, problemas pessoais). Reforco especifico na disciplina e acompanhamento mais proximo.',
          bimestre: '2o - 3o Bim'
        });
      }
    });
  });
  
  // Ordenar por prioridade
  const prioridadeOrdem = { alta: 0, media: 1, baixa: 2 };
  return interventions.sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]);
};
