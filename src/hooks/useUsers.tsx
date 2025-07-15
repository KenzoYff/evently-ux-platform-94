
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  createdAt: Date;
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const loadUsers = async () => {
    if (userProfile?.role !== 'admin') return;
    
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const usersData: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          name: data.displayName || data.name || 'Usuário',
          email: data.email,
          role: data.role || 'user',
          department: data.department || '',
          position: data.position || '',
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserData>) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData: any = {};
      
      if (userData.name) updateData.displayName = userData.name;
      if (userData.department !== undefined) updateData.department = userData.department;
      if (userData.position !== undefined) updateData.position = userData.position;
      if (userData.role !== undefined) updateData.role = userData.role;
      
      await updateDoc(userRef, updateData);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadUsers();
    }
  }, [userProfile]);

  return {
    users,
    loading,
    loadUsers,
    updateUser,
    deleteUser
  };
};
