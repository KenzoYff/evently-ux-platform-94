
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import TaskEditDialog from './TaskEditDialog';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  eventId: string;
}

interface EventKanbanTabProps {
  eventId: string;
}

const EventKanbanTab: React.FC<EventKanbanTabProps> = ({ eventId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const { user } = useAuth();

  const columns = [
    { id: 'todo', title: 'A Fazer', status: 'todo' as const },
    { id: 'in-progress', title: 'Em Progresso', status: 'in-progress' as const },
    { id: 'done', title: 'Concluído', status: 'done' as const }
  ];

  const loadTasks = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(q);
      
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          assignee: data.assignee,
          priority: data.priority,
          createdAt: data.createdAt.toDate(),
          eventId: data.eventId
        });
      });
      
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const members: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        members.push(data.displayName || data.name || data.email);
      });
      
      setTeamMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadTeamMembers();
  }, [eventId]);

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      if (editingTask) {
        // Editando tarefa existente
        const taskRef = doc(db, 'tasks', editingTask.id);
        await updateDoc(taskRef, taskData);
        
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id 
            ? { ...task, ...taskData }
            : task
        ));
      } else {
        // Criando nova tarefa
        const newTaskData = {
          ...taskData,
          status: 'todo' as const,
          createdAt: new Date(),
          eventId
        };
        
        const docRef = await addDoc(collection(db, 'tasks'), newTaskData);
        
        const newTask: Task = {
          id: docRef.id,
          ...newTaskData
        };
        
        setTasks(prev => [...prev, newTask]);
      }
      
      setIsDialogOpen(false);
      setEditingTask(null);
      toast.success(editingTask ? 'Tarefa atualizada!' : 'Tarefa criada!');
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao salvar tarefa');
    }
  };

  const moveTask = async (taskId: string, newStatus: Task['status']) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { status: newStatus });
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      toast.error('Erro ao mover tarefa');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando tarefas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tarefas do Projeto</h3>
        <Button 
          onClick={handleCreateTask} 
          className="flex items-center space-x-2 bg-gradient-to-r from-[#26387b] to-[#1d76b2] hover:from-[#1d2b63] hover:to-[#155a8f]"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <Card key={column.id} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {column.title} ({getTasksByStatus(column.status).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTasksByStatus(column.status).map(task => (
                <Card key={task.id} className={`p-3 border-l-4 ${getPriorityColor(task.priority)}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {task.description}
                      </p>
                    )}
                    {task.assignee && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Responsável: {task.assignee}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Prioridade: {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </p>
                    
                    {/* Botões para mover tarefa */}
                    <div className="flex space-x-1 mt-2">
                      {column.status !== 'todo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveTask(task.id, column.status === 'done' ? 'in-progress' : 'todo')}
                          className="text-xs"
                        >
                          ← {column.status === 'done' ? 'Em Progresso' : 'A Fazer'}
                        </Button>
                      )}
                      {column.status !== 'done' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveTask(task.id, column.status === 'todo' ? 'in-progress' : 'done')}
                          className="text-xs"
                        >
                          {column.status === 'todo' ? 'Em Progresso' : 'Concluído'} →
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {getTasksByStatus(column.status).length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">
                  Nenhuma tarefa
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <TaskEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default EventKanbanTab;
