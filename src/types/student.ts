export interface StudentGrade {
  estudante: string;
  turma: string;
  disciplina: string;
  nota1Bim: number | null;
  nota2Bim: number | null;
  nota3Bim: number | null;
  nota4Bim: number | null;
  evolucao1x2: number | null;
  evolucao2x3: number | null;
  evolucao3x4: number | null;
  mediaFinal: number | null;
  situacaoNota: 'APROVADO' | 'REPROVADO';
}

export interface StudentAttendance {
  estudante: string;
  turma: string;
  disciplina: string;
  faltas1Bim: number | null;
  faltas2Bim: number | null;
  faltas3Bim: number | null;
  faltas4Bim: number | null;
  totalAulas: number;
  totalFaltas: number;
  percentualPresenca: number;
  situacaoPresenca: 'APROVADO' | 'REPROVADO';
}

export interface StudentData {
  nome: string;
  turma: string;
  grades: StudentGrade[];
  attendance: StudentAttendance[];
}

export interface ClassStats {
  turma: string;
  disciplina: string;
  mediaTurma: number;
  percentualAprovacaoNotas: number;
  percentualAprovacaoPresenca: number;
  totalAlunos: number;
  alunosAprovadosNota: number;
  alunosAprovadosPresenca: number;
}

export interface StudentRanking {
  nome: string;
  turma: string;
  valor: number;
  tipo: 'media' | 'evolucao' | 'presenca';
}

export interface GradeDistribution {
  faixa: string;
  quantidade: number;
}
