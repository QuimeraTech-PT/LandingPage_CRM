import { useQuery } from '@tanstack/react-query';
import { 
  listProjectFiles, 
  renameDriveFile, 
  deleteDriveFile, 
  uploadFileToProject,
  moveDriveFile,
  batchRenameDriveFiles,
  batchDeleteDriveFiles,
  batchMoveDriveFiles
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
  ChevronRight,
  Download,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useMemo, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
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
  const [batchMoving, setBatchMoving] = useState<boolean>(false);
  const [batchMoveProgress, setBatchMoveProgress] = useState<{ current: number, total: number, results: any[] } | null>(null);
  const [previewingFile, setPreviewingFile] = useState<any | null>(null);

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

  const batchMoveMutation = useMutation({
    mutationFn: batchMoveDriveFiles,
    onSuccess: (res: any) => {
      if (res.success) {
        setBatchMoveProgress({ 
          current: selectedFiles.size, 
          total: selectedFiles.size, 
          results: res.results 
        });
        queryClient.invalidateQueries({ queryKey: ['drive-files', folderId] });
        setSelectedFiles(new Set());
      } else {
        toast.error(`Erro ao mover ficheiros: ${res.error}`);
        setBatchMoving(false);
      }
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

  const handleBatchRename = (currentFiles: any[]) => {
    const updates = Array.from(selectedFiles).map(id => ({
      fileId: id,
      newName: batchRenameValues[id] || currentFiles.find((f: any) => f.id === id)?.name || ''
    }));
    batchRenameMutation.mutate({ data: { projectId, files: updates } });
    setBatchRenaming(false);
  };

  const handleBatchDelete = (currentFiles: any[]) => {
    const targets = Array.from(selectedFiles).map(id => ({
      fileId: id,
      fileName: currentFiles.find((f: any) => f.id === id)?.name || ''
    }));
    batchDeleteMutation.mutate({ data: { projectId, files: targets } });
    setBatchDeleting(false);
  };

  const handleBatchMove = (newParentId: string, currentFiles: any[]) => {
    const targets = Array.from(selectedFiles).map(id => ({
      fileId: id,
      fileName: currentFiles.find((f: any) => f.id === id)?.name || '',
      oldParentId: folderId!
    }));
    setBatchMoveProgress({ current: 0, total: targets.length, results: [] });
    batchMoveMutation.mutate({ 
      data: { 
        projectId, 
        newParentId, 
        files: targets 
      } 
    });
  };

  const selectAll = (allFiles: any[]) => {
    if (selectedFiles.size === allFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(allFiles.map((f: any) => f.id)));
    }
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
  const subfolders = files.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');

  const toggleSelection = (fileId: string) => {
    const next = new Set(selectedFiles);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    setSelectedFiles(next);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon className="h-8 w-8 text-blue-400 p-1" />;
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-400 p-1" />;
    if (mimeType.includes('folder')) return <FolderOpen className="h-8 w-8 text-yellow-400 p-1" />;
    return <File className="h-8 w-8 text-muted-foreground p-1" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '--';
    const num = parseInt(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Batch Selection Bar */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center justify-between p-2 rounded-md bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedFiles.size === files.length} 
              onCheckedChange={() => selectAll(files)}
            />
            <span className="text-xs font-medium text-primary">
              {selectedFiles.size} selecionado{selectedFiles.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setBatchRenaming(true)}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setBatchMoving(true)}>
              <Move className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setBatchDeleting(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setSelectedFiles(new Set())}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <Checkbox 
              checked={selectedFiles.size === files.length && files.length > 0} 
              onCheckedChange={() => selectAll(files)}
            />
          )}
          <span>FICHEIROS NO DRIVE</span>
        </div>
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
        {files.map((file: any) => (
          <div 
            key={file.id} 
            className={`flex items-center justify-between p-3 rounded-md bg-muted/30 border border-white/5 hover:bg-muted/50 transition-all group ${selectedFiles.has(file.id) ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Checkbox 
                checked={selectedFiles.has(file.id)} 
                onCheckedChange={() => toggleSelection(file.id)}
                className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
              />
              <div className="h-10 w-10 flex items-center justify-center bg-background/50 rounded border border-white/5 overflow-hidden flex-shrink-0">
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink} alt="" className="h-full w-full object-cover" />
                ) : (
                  getFileIcon(file.mimeType)
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm truncate font-medium group-hover:text-primary transition-colors">
                  {file.name}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="uppercase">{file.mimeType.split('/').pop()?.split('.').pop()}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {!file.mimeType.includes('folder') && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPreviewingFile(file)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/10">
                  <DropdownMenuItem asChild>
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer text-foreground">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Abrir no Drive
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRenamingFile({ id: file.id, name: file.name })} className="flex items-center gap-2 cursor-pointer text-foreground">
                    <Edit2 className="h-3.5 w-3.5" />
                    Renomear
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMovingFile({ id: file.id, name: file.name, oldParentId: folderId })} className="flex items-center gap-2 cursor-pointer text-foreground">
                    <Move className="h-3.5 w-3.5" />
                    Mover
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeletingFile({ id: file.id, name: file.name })} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
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
      {/* Move Dialog */}
      <Dialog open={!!movingFile} onOpenChange={(open) => !open && setMovingFile(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Mover Ficheiro</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Selecione a pasta de destino para <span className="text-foreground font-medium">{movingFile?.name}</span>:
            </p>
            <ScrollArea className="h-[200px] rounded-md border border-white/10 p-2">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 h-9 text-sm" 
                  disabled={movingFile?.oldParentId === folderId}
                  onClick={() => {
                    moveMutation.mutate({
                      data: {
                        projectId,
                        fileId: movingFile!.id,
                        fileName: movingFile!.name,
                        oldParentId: movingFile!.oldParentId,
                        newParentId: folderId!
                      }
                    });
                  }}
                >
                  <FolderTree className="h-4 w-4 text-primary" />
                  Pasta Principal (Projeto)
                </Button>
                {subfolders.map((folder: any) => (
                  <Button 
                    key={folder.id}
                    variant="ghost" 
                    className="w-full justify-start gap-2 h-9 text-sm pl-6" 
                    disabled={movingFile?.oldParentId === folder.id}
                    onClick={() => {
                      moveMutation.mutate({
                        data: {
                          projectId,
                          fileId: movingFile!.id,
                          fileName: movingFile!.name,
                          oldParentId: movingFile!.oldParentId,
                          newParentId: folder.id
                        }
                      });
                    }}
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <FolderOpen className="h-4 w-4 text-yellow-400" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMovingFile(null)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Rename Dialog */}
      <Dialog open={batchRenaming} onOpenChange={setBatchRenaming}>
        <DialogContent className="bg-card border-white/10 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear em Lote ({selectedFiles.size})</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-4 py-4">
              {Array.from(selectedFiles).map(id => {
                const file = files.find((f: any) => f.id === id);
                return (
                  <div key={id} className="space-y-1.5">
                    <label className="text-xs text-muted-foreground block truncate">{file?.name}</label>
                    <Input 
                      placeholder="Novo nome..." 
                      defaultValue={file?.name}
                      onChange={(e) => setBatchRenameValues(prev => ({ ...prev, [id]: e.target.value }))}
                      className="bg-muted/50 border-white/10"
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBatchRenaming(false)}>Cancelar</Button>
            <Button onClick={() => handleBatchRename(files)} disabled={batchRenameMutation.isPending}>
              {batchRenameMutation.isPending ? "A processar..." : "Renomear Todos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Dialog */}
      <Dialog open={batchDeleting} onOpenChange={setBatchDeleting}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação em Lote</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Tem a certeza que deseja mover <span className="text-foreground font-medium">{selectedFiles.size} ficheiros</span> para a reciclagem?
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBatchDeleting(false)}>Cancelar</Button>
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleBatchDelete(files)} disabled={batchDeleteMutation.isPending}>
              {batchDeleteMutation.isPending ? "A eliminar..." : "Eliminar Todos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Batch Move Dialog */}
      <Dialog open={batchMoving} onOpenChange={setBatchMoving}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Mover em Lote ({selectedFiles.size})</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Selecione a pasta de destino para os <span className="text-foreground font-medium">{selectedFiles.size} ficheiros</span>:
            </p>
            <ScrollArea className="h-[200px] rounded-md border border-white/10 p-2">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 h-9 text-sm" 
                  onClick={() => handleBatchMove(folderId!, files)}
                >
                  <FolderTree className="h-4 w-4 text-primary" />
                  Pasta Principal (Projeto)
                </Button>
                {subfolders.map((folder: any) => (
                  <Button 
                    key={folder.id}
                    variant="ghost" 
                    className="w-full justify-start gap-2 h-9 text-sm pl-6" 
                    onClick={() => handleBatchMove(folder.id, files)}
                  >
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <FolderOpen className="h-4 w-4 text-yellow-400" />
                    {folder.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBatchMoving(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Move Progress/Results */}
      <Dialog open={!!batchMoveProgress} onOpenChange={(open) => !open && setBatchMoveProgress(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle>Estado da Movimentação</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{batchMoveProgress?.current === batchMoveProgress?.total ? 'Concluído' : 'A processar...'}</span>
                <span>{batchMoveProgress?.current} de {batchMoveProgress?.total}</span>
              </div>
              <Progress value={((batchMoveProgress?.current || 0) / (batchMoveProgress?.total || 1)) * 100} className="h-2" />
            </div>
            
            {batchMoveProgress?.current === batchMoveProgress?.total && (
              <ScrollArea className="h-[200px] border border-white/5 rounded-md p-2">
                <div className="space-y-2">
                  {batchMoveProgress.results.map((res: any, idx: number) => {
                    const file = files.find((f: any) => f.id === res.fileId);
                    return (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/20">
                        <span className="truncate max-w-[200px]">{file?.name || 'Ficheiro'}</span>
                        {res.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setBatchMoveProgress(null);
                setBatchMoving(false);
              }}
              disabled={batchMoveProgress?.current !== batchMoveProgress?.total}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline Preview Dialog */}
      <Dialog open={!!previewingFile} onOpenChange={(open) => !open && setPreviewingFile(null)}>
        <DialogContent className="bg-card border-white/10 text-foreground max-w-4xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="truncate">{previewingFile?.name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={previewingFile?.webViewLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Drive
                  </a>
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-black/20 relative">
            {previewingFile?.mimeType.includes('image') ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img 
                  src={previewingFile.webViewLink.replace('/view', '/thumbnail').replace(/\?usp=drivesdk$/, '') + '&sz=w2000'} 
                  alt={previewingFile.name}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex-col items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-10 w-10" />
                  <p>Não foi possível pré-visualizar esta imagem.</p>
                </div>
              </div>
            ) : previewingFile?.mimeType.includes('pdf') ? (
              <iframe 
                src={`${previewingFile.webViewLink.replace('/view', '/preview')}`}
                className="w-full h-full border-none"
                title={previewingFile.name}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <FileText className="h-16 w-16 opacity-20" />
                <p>Pré-visualização não disponível para este tipo de ficheiro.</p>
                <Button variant="outline" asChild>
                  <a href={previewingFile?.webViewLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Abrir no Google Drive
                  </a>
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                Tipo: {previewingFile?.mimeType} • Tamanho: {formatFileSize(previewingFile?.size)}
              </div>
              <Button variant="ghost" onClick={() => setPreviewingFile(null)}>Fechar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}