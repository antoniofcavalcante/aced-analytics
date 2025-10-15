import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudentsAtRiskCardProps {
  studentsAtRisk: Array<{ nome: string; turma: string; motivo: string }>;
  onStudentClick: (studentName: string) => void;
}

export const StudentsAtRiskCard = ({ studentsAtRisk, onStudentClick }: StudentsAtRiskCardProps) => {
  if (studentsAtRisk.length === 0) {
    return (
      <Card className="p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold">Alunos em Atenção</h3>
        </div>
        <p className="text-muted-foreground">Nenhum aluno em situação de atenção no momento.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold">Alunos em Atenção</h3>
        <span className="ml-auto bg-warning/20 text-warning px-2 py-1 rounded-full text-sm font-medium">
          {studentsAtRisk.length}
        </span>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {studentsAtRisk.map((student, index) => (
            <div 
              key={index} 
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{student.nome}</p>
                  <p className="text-sm text-muted-foreground">Turma: {student.turma}</p>
                  <p className="text-sm text-warning mt-1">{student.motivo}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStudentClick(student.nome)}
                >
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
