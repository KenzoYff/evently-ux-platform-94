import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { Upload, File, Image, Trash2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const FileUploadManager: React.FC = () => {
  const { uploading, progress, uploadFile, deleteFile, listUserFiles } = useFirebaseStorage();
  const [files, setFiles] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const result = await uploadFile(file);
    
    if (result) {
      setFiles(prev => [...prev, result]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleDeleteFile = async (filePath: string, index: number) => {
    const success = await deleteFile(filePath);
    if (success) {
      setFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                <Progress value={progress} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Arraste arquivos aqui ou clique para selecionar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suporte para: JPG, PNG, GIF, PDF, TXT (máx. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.originalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{file.type.split('/')[0]}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.path, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar o Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">Métodos de Upload:</h4>
            <p className="text-sm text-muted-foreground">
              1. <strong>Arrastar e Soltar:</strong> Arraste arquivos diretamente para a área de upload<br/>
              2. <strong>Seleção Manual:</strong> Clique em "Selecionar Arquivo" para escolher do computador
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Tipos de Arquivo Suportados:</h4>
            <p className="text-sm text-muted-foreground">
              • <strong>Imagens:</strong> JPG, PNG, GIF<br/>
              • <strong>Documentos:</strong> PDF, TXT<br/>
              • <strong>Tamanho máximo:</strong> 10MB por arquivo
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Segurança:</h4>
            <p className="text-sm text-muted-foreground">
              • Todos os arquivos são armazenados de forma segura no Firebase Storage<br/>
              • Apenas você tem acesso aos seus arquivos<br/>
              • Arquivos são verificados antes do upload
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadManager;