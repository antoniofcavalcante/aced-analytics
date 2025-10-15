import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { ClassStats } from '@/types/student';

interface ClassStatsCardsProps {
  stats: ClassStats[];
}

export const ClassStatsCards = ({ stats }: ClassStatsCardsProps) => {
  const totalStudents = stats.reduce((sum, s) => sum + s.totalAlunos, 0);
  const avgGrade = stats.length > 0 
    ? stats.reduce((sum, s) => sum + s.mediaTurma, 0) / stats.length 
    : 0;
  const avgApprovalGrade = stats.length > 0
    ? stats.reduce((sum, s) => sum + s.percentualAprovacaoNotas, 0) / stats.length
    : 0;
  const avgApprovalAttendance = stats.length > 0
    ? stats.reduce((sum, s) => sum + s.percentualAprovacaoPresenca, 0) / stats.length
    : 0;

  const cards = [
    {
      title: 'Total de Alunos',
      value: totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Média Geral',
      value: avgGrade.toFixed(1),
      icon: TrendingUp,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Aprovação (Nota)',
      value: `${avgApprovalGrade.toFixed(1)}%`,
      icon: Award,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Aprovação (Presença)',
      value: `${avgApprovalAttendance.toFixed(1)}%`,
      icon: Calendar,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
