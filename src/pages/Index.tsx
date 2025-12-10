import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FilterPanel } from '@/components/FilterPanel';
import { ClassStatsCards } from '@/components/ClassStatsCards';
import { GradeDistributionChart } from '@/components/GradeDistributionChart';
import { StudentRankingTable } from '@/components/StudentRankingTable';
import { StudentDetailModal } from '@/components/StudentDetailModal';
import { StudentsAtRiskCard } from '@/components/StudentsAtRiskCard';
import { AllStudentsTable } from '@/components/AllStudentsTable';
import { PDFChartsRenderer, PDFChartsRef } from '@/components/PDFChartsRenderer';
import { StudentGrade, StudentAttendance, StudentData } from '@/types/student';
import { loadDataFromLocalStorage } from '@/utils/excelParser';
import { generateClassReportPDF } from '@/utils/pdfGenerator';
import {
  getUniqueClasses,
  getUniqueSubjects,
  getClassStats,
  getTopStudents,
  getGradeDistribution,
  getStudentsAtRisk,
  getStudentData,
  getAllStudents,
} from '@/utils/dataAnalytics';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const chartsRef = useRef<PDFChartsRef>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = loadDataFromLocalStorage();
    if (data) {
      setGrades(data.grades);
      setAttendance(data.attendance);
    }
  };

  const filteredGrades = grades.filter((g) => {
    if (selectedClass !== 'all' && g.turma !== selectedClass) return false;
    if (selectedSubject !== 'all' && g.disciplina !== selectedSubject) return false;
    return true;
  });

  const filteredAttendance = attendance.filter((a) => {
    if (selectedClass !== 'all' && a.turma !== selectedClass) return false;
    if (selectedSubject !== 'all' && a.disciplina !== selectedSubject) return false;
    return true;
  });

  const classes = getUniqueClasses(grades);
  const subjects = getUniqueSubjects(grades);
  const classStats = getClassStats(grades, attendance, 
    selectedClass !== 'all' ? selectedClass : undefined,
    selectedSubject !== 'all' ? selectedSubject : undefined
  );
  const topByMedia = getTopStudents(filteredGrades, filteredAttendance, 'media', 5);
  const topByEvolution = getTopStudents(filteredGrades, filteredAttendance, 'evolucao', 5);
  const topByPresence = getTopStudents(filteredGrades, filteredAttendance, 'presenca', 5);
  const gradeDistribution = getGradeDistribution(filteredGrades);
  const studentsAtRisk = getStudentsAtRisk(filteredGrades, filteredAttendance);
  const allStudents = getAllStudents(filteredGrades, filteredAttendance);

  // Calculate evolution data for charts
  const evolutionData = (() => {
    const bimestres = ['1º Bim', '2º Bim', '3º Bim', '4º Bim'];
    return bimestres.map((name, index) => {
      const notas = filteredGrades
        .map(g => {
          switch(index) {
            case 0: return g.nota1Bim;
            case 1: return g.nota2Bim;
            case 2: return g.nota3Bim;
            case 3: return g.nota4Bim;
            default: return null;
          }
        })
        .filter((n): n is number => n !== null && n !== undefined);
      
      const media = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
      return { name, media: parseFloat(media.toFixed(2)) };
    });
  })();

  const handleStudentClick = (studentName: string) => {
    const studentData = getStudentData(studentName, grades, attendance);
    setSelectedStudent(studentData);
    setIsModalOpen(true);
  };

  const handleDownloadClassReport = async () => {
    if (selectedClass === 'all' || selectedSubject === 'all') {
      toast.error('Selecione uma turma e disciplina específica');
      return;
    }
    
    setIsGeneratingPDF(true);
    toast.info('Gerando relatório com gráficos...');
    
    try {
      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture chart images
      let chartImages;
      if (chartsRef.current) {
        chartImages = await chartsRef.current.captureCharts();
      }
      
      const statsForReport = classStats[0] || {
        turma: selectedClass,
        disciplina: selectedSubject,
        mediaTurma: 0,
        percentualAprovacaoNotas: 0,
        percentualAprovacaoPresenca: 0,
        totalAlunos: filteredGrades.length,
        alunosAprovadosNota: 0,
        alunosAprovadosPresenca: 0,
      };
      
      generateClassReportPDF({
        turma: selectedClass,
        disciplina: selectedSubject,
        stats: statsForReport,
        grades: filteredGrades,
        attendance: filteredAttendance,
      }, chartImages);
      
      toast.success('Relatório profissional gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (grades.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-6 rounded-2xl">
                <GraduationCap className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard Escolar
            </h1>
            <p className="text-xl text-muted-foreground">
              Análise completa de desempenho acadêmico
            </p>
          </div>
          
          <div className="space-y-4">
            <FileUpload onDataLoaded={loadData} />
            
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">Recursos do Dashboard:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Análise de notas e frequência por aluno e turma</li>
                <li>✓ Gráficos interativos de desempenho</li>
                <li>✓ Rankings de melhores alunos</li>
                <li>✓ Identificação de alunos em situação de atenção</li>
                <li>✓ Geração de relatórios em PDF com gráficos</li>
                <li>✓ Filtros por turma e disciplina</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStats = classStats[0] || {
    turma: selectedClass,
    disciplina: selectedSubject,
    mediaTurma: 0,
    percentualAprovacaoNotas: 0,
    percentualAprovacaoPresenca: 0,
    totalAlunos: 0,
    alunosAprovadosNota: 0,
    alunosAprovadosPresenca: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Escolar</h1>
                <p className="text-sm text-muted-foreground">
                  {grades.length} registros carregados
                </p>
              </div>
            </div>
            <FileUpload onDataLoaded={loadData} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <FilterPanel
          classes={classes}
          subjects={subjects}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          onClassChange={setSelectedClass}
          onSubjectChange={setSelectedSubject}
          onDownloadClassReport={handleDownloadClassReport}
          isGeneratingPDF={isGeneratingPDF}
        />

        <ClassStatsCards stats={classStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GradeDistributionChart distribution={gradeDistribution} />
          <StudentsAtRiskCard 
            studentsAtRisk={studentsAtRisk}
            onStudentClick={handleStudentClick}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StudentRankingTable
            rankings={topByMedia}
            type="media"
            onStudentClick={handleStudentClick}
          />
          <StudentRankingTable
            rankings={topByEvolution}
            type="evolucao"
            onStudentClick={handleStudentClick}
          />
          <StudentRankingTable
            rankings={topByPresence}
            type="presenca"
            onStudentClick={handleStudentClick}
          />
        </div>

        <AllStudentsTable
          students={allStudents}
          onStudentClick={handleStudentClick}
        />
      </main>

      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Hidden charts for PDF capture */}
      {selectedClass !== 'all' && selectedSubject !== 'all' && (
        <PDFChartsRenderer
          ref={chartsRef}
          gradeDistribution={gradeDistribution}
          classStats={currentStats}
          evolutionData={evolutionData}
        />
      )}
    </div>
  );
};

export default Index;
