import { useQuery } from '@tanstack/react-query';
import { 
  listProjectFiles, 
  renameDriveFile, 
  deleteDriveFile, 
  uploadFileToProject,
  moveDriveFile,
  batchRenameDriveFiles,
  batchDeleteDriveFiles
} from '@/lib/google-drive.functions';
import { 
  File, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  FolderOpen, 
  Upload, 
  Trash2, 
  Edit2, 
  MoreVertical,
  CheckSquare,
  Square,
  Move,
  FolderTree,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectFilesProps {
  folderId?: string | null;
  projectId: string;
}

export function ProjectFiles({ folderId, projectId }: ProjectFilesProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [renamingFile, setRenamingFile] = useState<{ id: string, name: string } | null>(null);
  const [deletingFile, setDeletingFile] = useState<{ id: string, name: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [movingFile, setMovingFile] = useState<{ id: string, name: string, oldParentId: string } | null>(null);
  const [batchRenaming, setBatchRenaming] = useState<boolean>(false);
  const [batchDeleting, setBatchDeleting] = useState<boolean>(false);
  const [batchRenameValues, setBatchRenameValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['drive-files', folderId],
    queryFn: () => listProjectFiles({ data: { folderId: folderId! } }),
    enabled: !!folderId,
    refetchInterval: 60000,
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
  });

  const renameMutation = useMutation({
    mutationFn: renameDriveFile,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Ficheiro renomeado!');
        queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
        setRenamingFile(null);
      } else {
        toast.error(`Erro ao renomear: ${res.error}`);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriveFile,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Ficheiro eliminado!');
        queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
        setDeletingFile(null);
      } else {
        toast.error(`Erro ao eliminar: ${res.error}`);
      }
    },
  });

  const moveMutation = useMutation({
    mutationFn: moveDriveFile,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Ficheiro movido!');
        queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
        setMovingFile(null);
      } else {
        toast.error(`Erro ao mover: ${res.error}`);
      }
    },
  });

  const batchRenameMutation = useMutation({
    mutationFn: batchRenameDriveFiles,
    onSuccess: () => {
      toast.success('Ficheiros renomeados!');
      queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
      setSelectedFiles(new Set());
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteDriveFiles,
    onSuccess: () => {
      toast.success('Ficheiros eliminados!');
      queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
      setSelectedFiles(new Set());
    },
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

  const files = result?.files || [];

  const toggleSelection = (fileId: string) => {
    const next = new Set(selectedFiles);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFiles(next);
  };

  const selectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f: any) => f.id)));
    }
  };

  const subfolders = useMemo(() => {
    return files.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
  }, [files]);

  const handleBatchRename = () => {
    const updates = Array.from(selectedFiles).map(id => ({
      fileId: id,
      newName: batchRenameValues[id] || files.find((f: any) => f.id === id)?.name || ''
    }));
    batchRenameMutation.mutate({ data: { projectId, files: updates } });
    setBatchRenaming(false);
  };

  const handleBatchDelete = () => {
    const targets = Array.from(selectedFiles).map(id => ({
      fileId: id,
      fileName: files.find((f: any) => f.id === id)?.name || ''
    }));
    batchDeleteMutation.mutate({ data: { projectId, files: targets } });
    setBatchDeleting(false);
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
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/10">
                  <DropdownMenuItem asChild>
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer text-foreground">
                      <ExternalLink className="h-3 w-3" />
                      Abrir
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRenamingFile({ id: file.id, name: file.name })} className="flex items-center gap-2 cursor-pointer text-foreground">
                    <Edit2 className="h-3 w-3" />
                    Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeletingFile({ id: file.id, name: file.name })} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-lg">
            <File className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum ficheiro nesta pasta.</p>
          </div>
        )}
        {files.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" asChild>
            <a href={`https://drive.google.com/drive/folders/${folderId}`} target="_blank" rel="noopener noreferrer">
              Ver mais {files.length - 5} ficheiros...
            </a>
          </Button>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingFile} onOpenChange={(open) => !open && setRenamingFile(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Renomear Ficheiro</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              defaultValue={renamingFile?.name} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameMutation.mutate({
                    data: {
                      projectId,
                      fileId: renamingFile!.id,
                      newName: e.currentTarget.value
                    }
                  });
                }
              }}
              className="bg-muted/50 border-white/10 text-foreground"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenamingFile(null)}>Cancelar</Button>
            <Button onClick={(e) => {
              const input = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
              if (input) {
                renameMutation.mutate({
                  data: {
                    projectId,
                    fileId: renamingFile!.id,
                    newName: input.value
                  }
                });
              }
            }} disabled={renameMutation.isPending}>
              {renameMutation.isPending ? "A processar..." : "Renomear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingFile} onOpenChange={(open) => !open && setDeletingFile(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Tem a certeza que deseja mover <span className="text-foreground font-medium">{deletingFile?.name}</span> para a reciclagem?
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingFile(null)}>Cancelar</Button>
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => {
              deleteMutation.mutate({
                data: {
                  projectId,
                  fileId: deletingFile!.id,
                  fileName: deletingFile!.name
                }
              });
            }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "A eliminar..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}