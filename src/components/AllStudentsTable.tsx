import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, User } from 'lucide-react';

interface AllStudentsTableProps {
  students: Array<{ nome: string; turma: string; mediaGeral: number; presencaGeral: number }>;
  onStudentClick: (studentName: string) => void;
}

export const AllStudentsTable = ({ students, onStudentClick }: AllStudentsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Todos os Alunos
        </CardTitle>
        <CardDescription>
          Lista completa de alunos conforme filtros aplicados ({students.length} alunos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead className="text-right">Média Geral</TableHead>
                <TableHead className="text-right">Presença</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum aluno encontrado
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 cursor-pointer" onClick={() => onStudentClick(student.nome)}>
                    <TableCell className="font-medium">{student.nome}</TableCell>
                    <TableCell>{student.turma}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${student.mediaGeral >= 7 ? 'text-success' : student.mediaGeral >= 5 ? 'text-warning' : 'text-destructive'}`}>
                        {student.mediaGeral.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold ${student.presencaGeral >= 75 ? 'text-success' : 'text-destructive'}`}>
                        {student.presencaGeral.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStudentClick(student.nome);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
