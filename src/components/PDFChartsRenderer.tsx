import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ClassStats, GradeDistribution } from '@/types/student';
import html2canvas from 'html2canvas';

interface PDFChartsRendererProps {
  gradeDistribution: GradeDistribution[];
  classStats: ClassStats;
  evolutionData: { name: string; media: number }[];
}

export interface PDFChartsRef {
  captureCharts: () => Promise<{
    gradeDistribution: string;
    pieChart: string;
    evolutionChart: string;
  }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export const PDFChartsRenderer = forwardRef<PDFChartsRef, PDFChartsRendererProps>(
  ({ gradeDistribution, classStats, evolutionData }, ref) => {
    const gradeChartRef = useRef<HTMLDivElement>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);
    const evolutionChartRef = useRef<HTMLDivElement>(null);

    const pieData = [
      { name: 'Aprovados', value: classStats.alunosAprovadosNota, color: '#22c55e' },
      { name: 'Reprovados', value: classStats.totalAlunos - classStats.alunosAprovadosNota, color: '#ef4444' },
    ];

    useImperativeHandle(ref, () => ({
      captureCharts: async () => {
        const options = { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false };

        const [gradeCanvas, pieCanvas, evolutionCanvas] = await Promise.all([
          gradeChartRef.current ? html2canvas(gradeChartRef.current, options) : null,
          pieChartRef.current ? html2canvas(pieChartRef.current, options) : null,
          evolutionChartRef.current ? html2canvas(evolutionChartRef.current, options) : null,
        ]);

        return {
          gradeDistribution: gradeCanvas?.toDataURL('image/png') || '',
          pieChart: pieCanvas?.toDataURL('image/png') || '',
          evolutionChart: evolutionCanvas?.toDataURL('image/png') || '',
        };
      },
    }));

    return (
      <div className="fixed -left-[9999px] -top-[9999px] bg-white">
        <div ref={gradeChartRef} className="w-[600px] h-[300px] p-4 bg-white">
          <h3 className="text-center font-bold text-gray-800 mb-2">Distribuição de Notas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faixa" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="quantidade" name="Alunos">
                {gradeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div ref={pieChartRef} className="w-[600px] h-[300px] p-4 bg-white">
          <h3 className="text-center font-bold text-gray-800 mb-2">Situação de Aprovação</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div ref={evolutionChartRef} className="w-[600px] h-[300px] p-4 bg-white">
          <h3 className="text-center font-bold text-gray-800 mb-2">Evolução da Média por Bimestre</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="media" stroke="#2b6cb0" strokeWidth={3} dot={{ fill: '#2b6cb0', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

PDFChartsRenderer.displayName = 'PDFChartsRenderer';
