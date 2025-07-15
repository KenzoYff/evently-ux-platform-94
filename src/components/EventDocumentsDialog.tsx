
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Trash2, File } from 'lucide-react';
import { toast } from 'sonner';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';

interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

interface EventDocumentsDialogProps {
  eventId: string;
  documents: Document[];
  onUpdateDocuments: (documents: Document[]) => void;
}

const EventDocumentsDialog: React.FC<EventDocumentsDialogProps> = ({
  eventId,
  documents,
  onUpdateDocuments
}) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `events/${eventId}/documents/${fileName}`);
      
      console.log('Uploading file to:', `events/${eventId}/documents/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully, URL:', downloadURL);
      
      const newDocument: Document = {
        id: timestamp.toString(),
        name: file.name,
        url: downloadURL,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: 'current-user'
      };

      const updatedDocuments = [...documents, newDocument];
      
      // Atualizar no Firestore
      await updateDoc(doc(db, 'events', eventId), {
        documents: updatedDocuments
      });
      
      onUpdateDocuments(updatedDocuments);
      toast.success('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      // Deletar do Firebase Storage
      const storageRef = ref(storage, `events/${eventId}/documents/${document.id}_${document.name}`);
      await deleteObject(storageRef);
      
      // Remover da lista
      const updatedDocuments = documents.filter(doc => doc.id !== document.id);
      
      // Atualizar no Firestore
      await updateDoc(doc(db, 'events', eventId), {
        documents: updatedDocuments
      });
      
      onUpdateDocuments(updatedDocuments);
      toast.success('Documento excluído!');
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
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
      {/* Upload de arquivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="document-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
        />
        <label htmlFor="document-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Enviando...' : 'Clique para enviar um documento'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, XLS, PPT, TXT, JPG, PNG (máx. 10MB)
          </p>
        </label>
      </div>

      {/* Lista de documentos */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum documento enviado</p>
        ) : (
          documents.map(document => (
            <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{document.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(document.size)} • {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(document.url, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument(document)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventDocumentsDialog;
