
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
}

interface EventMembersDialogProps {
  eventId: string;
  teamMembers: string[];
  onUpdateMembers: (members: string[]) => void;
}

const EventMembersDialog: React.FC<EventMembersDialogProps> = ({
  eventId,
  teamMembers,
  onUpdateMembers
}) => {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          name: data.displayName || data.name || 'Usuário',
          email: data.email,
          displayName: data.displayName || data.name
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

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const availableUsers = users.filter(user => !teamMembers.includes(user.id));
  const currentMembers = users.filter(user => teamMembers.includes(user.id));

  const handleAddMember = () => {
    if (!selectedUserId) {
      toast.error('Selecione um usuário');
      return;
    }

    const newMembers = [...teamMembers, selectedUserId];
    onUpdateMembers(newMembers);
    setSelectedUserId('');
    toast.success('Membro adicionado ao projeto!');
  };

  const handleRemoveMember = (userId: string) => {
    const newMembers = teamMembers.filter(id => id !== userId);
    onUpdateMembers(newMembers);
    toast.success('Membro removido do projeto!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 bg-gradient-to-r from-[#26387b] to-[#1d76b2] text-white hover:from-[#1d2b63] hover:to-[#155a8f]"
        >
          <Users className="w-4 h-4" />
          <span>Gerenciar Membros ({teamMembers.length})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros do Projeto</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Adicionar novo membro */}
            <div className="space-y-3">
              <Label>Adicionar Membro</Label>
              <div className="flex space-x-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={availableUsers.length === 0}
                >
                  <option value="">
                    {availableUsers.length === 0 ? 'Nenhum usuário disponível' : 'Selecione um usuário'}
                  </option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={handleAddMember} 
                  size="sm"
                  disabled={!selectedUserId || availableUsers.length === 0}
                  className="bg-gradient-to-r from-[#26387b] to-[#1d76b2] hover:from-[#1d2b63] hover:to-[#155a8f]"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lista de membros atuais */}
            <div className="space-y-3">
              <Label>Membros Atuais</Label>
              {currentMembers.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum membro adicionado</p>
              ) : (
                <div className="space-y-2">
                  {currentMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#26387b] to-[#1d76b2] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventMembersDialog;
