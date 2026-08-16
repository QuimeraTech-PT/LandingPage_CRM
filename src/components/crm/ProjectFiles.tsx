import { useQuery } from '@tanstack/react-query';
import { listProjectFiles } from '@/lib/google-drive.functions';
import { File, FileText, Image as ImageIcon, ExternalLink, Loader2, AlertCircle, FolderOpen, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { uploadFileToProject } from '@/lib/google-drive.functions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';

interface ProjectFilesProps {
  folderId?: string | null;
  projectId: string;
}

export function ProjectFiles({ folderId, projectId }: ProjectFilesProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['drive-files', folderId],
    queryFn: () => listProjectFiles({ data: { folderId: folderId! } }),
    enabled: !!folderId,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFileToProject,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Ficheiro enviado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
      } else {
        toast.error(`Erro no upload: ${res.error}`);
      }
      setIsUploading(false);
    },
    onError: (err: any) => {
      toast.error('Falha ao enviar ficheiro.');
      setIsUploading(false);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !folderId) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        data: {
          projectId,
          folderId,
          fileName: file.name,
          fileType: file.type,
          fileContent: base64
        }
      });
    };
    reader.readAsDataURL(file);
  };

  if (!folderId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-lg text-center bg-muted/20">
        <FolderOpen className="h-10 w-10 text-muted-foreground opacity-30 mb-2" />
        <p className="text-sm text-muted-foreground">Sem pasta do Drive associada.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">A aceder ao Google Drive...</span>
      </div>
    );
  }

  const result = data as any;

  if (result?.status === "pending_config") {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-yellow-500/20 rounded-lg text-center bg-yellow-500/5">
        <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
        <p className="text-sm font-medium text-yellow-500">Google Drive não configurado</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
          Falta configurar o Service Account nos segredos do backend.
        </p>
      </div>
    );
  }

  const files = result?.files || [];

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-lg">
        <File className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
        <p className="text-sm text-muted-foreground">Nenhum ficheiro nesta pasta.</p>
        <Button variant="link" className="mt-2 text-xs" asChild>
          <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noopener noreferrer">
            Abrir no Drive
          </a>
        </Button>
      </div>
    );
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon className="h-4 w-4 text-blue-400" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-400" />;
    if (mimeType.includes('folder')) return <FolderOpen className="h-4 w-4 text-yellow-400" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
        <span>FICHEIROS NO DRIVE</span>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          </Button>
          <Badge variant="outline" className="text-[10px] py-0">{files.length}</Badge>
        </div>
      </div>
      <div className="grid gap-2">
        {files.slice(0, 5).map((file: any) => (
          <div 
            key={file.id} 
            className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-white/5 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {getFileIcon(file.mimeType)}
              <span className="text-sm truncate font-medium group-hover:text-primary transition-colors">
                {file.name}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
              <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        ))}
        {files.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" asChild>
            <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noopener noreferrer">
              Ver mais {files.length - 5} ficheiros...
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
