import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { StudentRanking } from '@/types/student';

interface StudentRankingTableProps {
  rankings: StudentRanking[];
  type: 'media' | 'evolucao' | 'presenca';
  onStudentClick: (studentName: string) => void;
}

export const StudentRankingTable = ({ rankings, type, onStudentClick }: StudentRankingTableProps) => {
  const titles = {
    media: 'Maiores Médias',
    evolucao: 'Maior Evolução',
    presenca: 'Maior Presença',
  };

  const icons = {
    media: Trophy,
    evolucao: TrendingUp,
    presenca: Calendar,
  };

  const Icon = icons[type];

  return (
    <Card className="p-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{titles[type]}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Turma</TableHead>
              <TableHead className="text-right">
                {type === 'media' ? 'Média' : type === 'evolucao' ? 'Evolução' : 'Presença'}
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((rank, index) => (
              <TableRow key={`${rank.nome}-${index}`}>
                <TableCell className="font-bold">
                  {index + 1}º
                </TableCell>
                <TableCell className="font-medium">{rank.nome}</TableCell>
                <TableCell>{rank.turma}</TableCell>
                <TableCell className="text-right font-semibold">
                  {type === 'presenca' 
                    ? `${rank.valor.toFixed(1)}%` 
                    : rank.valor.toFixed(1)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStudentClick(rank.nome)}
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
