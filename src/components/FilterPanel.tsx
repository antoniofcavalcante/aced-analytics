import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, FileDown } from 'lucide-react';

interface FilterPanelProps {
  classes: string[];
  subjects: string[];
  selectedClass: string;
  selectedSubject: string;
  onClassChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onDownloadClassReport?: () => void;
}

export const FilterPanel = ({
  classes,
  subjects,
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  onDownloadClassReport,
}: FilterPanelProps) => {
  const canDownloadReport = selectedClass !== 'all' && selectedSubject !== 'all';

  return (
    <Card className="p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Filtros</h3>
        </div>
        {canDownloadReport && onDownloadClassReport && (
          <Button 
            onClick={onDownloadClassReport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Baixar Relatório da Turma
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Turma</label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as turmas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Disciplina</label>
          <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as disciplinas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as disciplinas</SelectItem>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!canDownloadReport && (
        <p className="text-xs text-muted-foreground mt-3">
          Selecione uma turma e disciplina específica para baixar o relatório em PDF
        </p>
      )}
    </Card>
  );
};
