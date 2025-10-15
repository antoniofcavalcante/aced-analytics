import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, GraduationCap, Calendar } from 'lucide-react';
import { StudentData } from '@/types/student';
import { generateStudentPDF } from '@/utils/pdfGenerator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StudentDetailModalProps {
  student: StudentData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailModal = ({ student, isOpen, onClose }: StudentDetailModalProps) => {
  if (!student) return null;

  const handleDownloadPDF = () => {
    generateStudentPDF(student);
  };

  // Prepare evolution data for chart
  const evolutionData = student.grades.map(grade => {
    const data: any = { disciplina: grade.disciplina };
    if (grade.nota1Bim !== null) data['1º Bim'] = grade.nota1Bim;
    if (grade.nota2Bim !== null) data['2º Bim'] = grade.nota2Bim;
    if (grade.nota3Bim !== null) data['3º Bim'] = grade.nota3Bim;
    if (grade.nota4Bim !== null) data['4º Bim'] = grade.nota4Bim;
    return data;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              {student.nome}
              <span className="text-muted-foreground ml-2 text-lg">({student.turma})</span>
            </DialogTitle>
            <Button onClick={handleDownloadPDF} variant="default">
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Grades Section */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Notas e Desempenho</h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disciplina</TableHead>
                    <TableHead className="text-center">1º Bim</TableHead>
                    <TableHead className="text-center">2º Bim</TableHead>
                    <TableHead className="text-center">3º Bim</TableHead>
                    <TableHead className="text-center">4º Bim</TableHead>
                    <TableHead className="text-center">Média</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.grades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{grade.disciplina}</TableCell>
                      <TableCell className="text-center">{grade.nota1Bim ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.nota2Bim ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.nota3Bim ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.nota4Bim ?? '-'}</TableCell>
                      <TableCell className="text-center font-bold">
                        {grade.mediaFinal?.toFixed(1) ?? '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={grade.situacaoNota === 'APROVADO' ? 'default' : 'destructive'}>
                          {grade.situacaoNota}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Evolution Chart */}
            <div className="mt-6">
              <h4 className="font-medium mb-4">Evolução das Notas</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="disciplina" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="1º Bim" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="2º Bim" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="3º Bim" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  <Line type="monotone" dataKey="4º Bim" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Attendance Section */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Frequência</h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disciplina</TableHead>
                    <TableHead className="text-center">Faltas 1º</TableHead>
                    <TableHead className="text-center">Faltas 2º</TableHead>
                    <TableHead className="text-center">Faltas 3º</TableHead>
                    <TableHead className="text-center">Total Faltas</TableHead>
                    <TableHead className="text-center">Presença</TableHead>
                    <TableHead className="text-center">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.attendance.map((att, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{att.disciplina}</TableCell>
                      <TableCell className="text-center">{att.faltas1Bim ?? '-'}</TableCell>
                      <TableCell className="text-center">{att.faltas2Bim ?? '-'}</TableCell>
                      <TableCell className="text-center">{att.faltas3Bim ?? '-'}</TableCell>
                      <TableCell className="text-center font-bold">{att.totalFaltas}</TableCell>
                      <TableCell className="text-center font-bold">
                        {att.percentualPresenca.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={att.situacaoPresenca === 'APROVADO' ? 'default' : 'destructive'}>
                          {att.situacaoPresenca}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
