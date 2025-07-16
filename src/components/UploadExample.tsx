import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';
import { Upload, FileText, Download, Trash2, Image, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  originalName: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const UploadExample: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { uploading, progress, uploadFile, deleteFile, listUserFiles } = useFirebaseStorage();

  // Carregar arquivos do usuário ao inicializar
  useEffect(() => {
    loadUserFiles();
  }, []);

  const loadUserFiles = async () => {
    try {
      const userFiles = await listUserFiles('uploads');
      setFiles(userFiles.map(file => ({
        name: file.name,
        originalName: file.name,
        url: file.url,
        path: file.path,
        size: 0,
        type: '',
        uploadedAt: new Date().toISOString()
      })));
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    }
  };

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const result = await uploadFile(file, 'uploads');
      
      if (result) {
        setFiles(prev => [...prev, result]);
        toast.success(`${file.name} enviado com sucesso!`);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  };

  const handleDeleteFile = async (filePath: string, index: number) => {
    const success = await deleteFile(filePath);
    if (success) {
      setFiles(prev => prev.filter((_, i) => i !== index));
      toast.success('Arquivo deletado com sucesso!');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <FileIcon className="h-4 w-4" />;
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
            Upload de Arquivos - Firebase Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">Enviando arquivo...</div>
                <Progress value={progress} className="w-full" />
                <div className="text-xs text-gray-500">{progress}% completo</div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Arraste e solte arquivos aqui</p>
                  <p className="text-sm text-gray-500">ou clique para selecionar</p>
                </div>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="max-w-xs mx-auto"
                />
                <div className="text-xs text-gray-500">
                  Tipos suportados: JPG, PNG, GIF, PDF, TXT (máx. 10MB)
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Enviados ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium text-sm">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Arrastar e Soltar</h4>
            <p className="text-sm text-gray-600">
              Arraste arquivos diretamente para a área de upload acima.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Seleção Manual</h4>
            <p className="text-sm text-gray-600">
              Clique no campo de input para abrir o seletor de arquivos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Tipos Suportados</h4>
            <p className="text-sm text-gray-600">
              Imagens (JPG, PNG, GIF), PDFs e arquivos de texto (TXT) até 10MB.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. Segurança</h4>
            <p className="text-sm text-gray-600">
              Todos os arquivos são organizados por usuário e protegidos pelo Firebase Security Rules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadExample;