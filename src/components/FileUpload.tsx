import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseExcelFile, saveDataToLocalStorage } from '@/utils/excelParser';
import { toast } from 'sonner';

interface FileUploadProps {
  onDataLoaded: () => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const { grades, attendance } = await parseExcelFile(file);
      saveDataToLocalStorage(grades, attendance);
      
      toast.success('Dados carregados com sucesso!', {
        description: `${grades.length} registros de notas e ${attendance.length} registros de presença`,
      });
      
      onDataLoaded();
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Erro ao processar arquivo', {
        description: 'Verifique se o formato do arquivo está correto',
      });
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-2 border-dashed hover:border-primary hover:bg-secondary transition-all cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-5 w-5 animate-bounce" />
              Processando...
            </>
          ) : fileName ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5 text-accent" />
              {fileName}
            </>
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              Importar Planilha Excel
            </>
          )}
        </Button>
      </label>
    </div>
  );
};
