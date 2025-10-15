import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GradeDistributionChartProps {
  distribution: Record<string, number>;
}

export const GradeDistributionChart = ({ distribution }: GradeDistributionChartProps) => {
  const data = Object.entries(distribution).map(([range, count]) => ({
    faixa: range,
    alunos: count,
  }));

  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Distribuição de Notas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="faixa" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <YAxis 
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
          <Bar 
            dataKey="alunos" 
            fill="hsl(var(--primary))" 
            name="Número de Alunos"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
