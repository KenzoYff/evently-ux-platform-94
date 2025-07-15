import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFirebaseStorage = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, folder: string = 'uploads') => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return null;
    }

    // Verificar tipo e tamanho do arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use: JPG, PNG, GIF, PDF ou TXT');
      return null;
    }

    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `${folder}/${user.uid}/${fileName}`;
      
      // Criar referência no Storage
      const storageRef = ref(storage, filePath);
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setProgress(100);
      
      toast.success('Arquivo enviado com sucesso!');
      
      return {
        name: fileName,
        originalName: file.name,
        url: downloadURL,
        path: filePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: FileList, folder: string = 'uploads') => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return [];
    }

    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], folder);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  };

  const deleteFile = async (filePath: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      toast.success('Arquivo deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('Erro ao deletar arquivo');
      return false;
    }
  };

  const listUserFiles = async (folder: string = 'uploads') => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return [];
    }

    try {
      const folderRef = ref(storage, `${folder}/${user.uid}`);
      const result = await listAll(folderRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url: url
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      toast.error('Erro ao listar arquivos');
      return [];
    }
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    listUserFiles
  };
};