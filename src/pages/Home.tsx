
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, DollarSign, Clock, FileText, Edit, Trash2 } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import EventCreateDialog from '@/components/EventCreateDialog';
import EventEditDialog from '@/components/EventEditDialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Home: React.FC = () => {
  const { events, loading, updateEvent, deleteEvent } = useEvents();
  const { users } = useUsers();
  const { userProfile } = useAuth();
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Carregando eventos...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const activeEvents = events.filter(event => event.status !== 'Concluído').length;
  const totalBudget = events.reduce((sum, event) => sum + (event.budget || 0), 0);
  const totalCollaborators = users.length;
  const upcomingEvents = events.filter(event => new Date(event.eventDate) > new Date()).length;

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      await updateEvent(editingEvent.id, eventData);
      toast.success('Evento atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success('Evento excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir evento');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#26387b] to-[#1d76b2] rounded-lg p-6 mb-8 text-white animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse-scale">
              <span className="text-xl font-bold">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold animate-slide-up">
                Bem-vindo, {userProfile?.displayName || 'Usuário'}!
              </h1>
              <p className="opacity-90 animate-fade-in">
                {userProfile?.department || 'Tecnolog'} - {userProfile?.position || 'Colaborador'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Design moderno e responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="p-4 lg:p-6 card-interactive animate-bounce-in group">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center animate-float group-hover:animate-pulse-glow shadow-lg">
                <Calendar className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl lg:text-2xl font-bold text-foreground animate-scale-up">{activeEvents}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Eventos Ativos</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 card-interactive animate-bounce-in group" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center animate-shimmer group-hover:hover-rotate shadow-lg shadow-green-500/25">
                <DollarSign className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl lg:text-2xl font-bold text-foreground animate-scale-up">R$ {totalBudget.toLocaleString()}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Orçamento Total</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 card-interactive animate-bounce-in group" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow group-hover:animate-float shadow-lg">
                <Users className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl lg:text-2xl font-bold text-foreground animate-scale-up">{totalCollaborators}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Colaboradores</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 lg:p-6 card-interactive animate-bounce-in group" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center animate-float group-hover:hover-scale shadow-lg">
                <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xl lg:text-2xl font-bold text-foreground animate-scale-up">{upcomingEvents}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Próximos Eventos</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground animate-slide-up">Meus Projetos</h2>
          <p className="text-muted-foreground animate-fade-in">Gerencie todos os seus projetos em um só lugar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Novo Projeto Card - Design moderno */}
          <Card className="text-center py-8 lg:py-12 border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 transition-all-smooth hover-lift animate-scale-up group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="pt-6 relative z-10">
              <EventCreateDialog>
                <div className="cursor-pointer space-y-4">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-[#26387b] to-[#1d76b2] flex items-center justify-center mx-auto animate-gradient shadow-2xl group-hover:shadow-primary/30 transition-all-smooth">
                    <Plus className="w-8 h-8 lg:w-10 lg:h-10 text-white group-hover:scale-110 transition-transform-smooth" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl lg:text-2xl font-semibold group-hover:text-primary transition-colors">Novo Projeto</h3>
                    <p className="text-muted-foreground text-sm lg:text-base max-w-xs mx-auto">
                      Clique para criar um novo evento e começar seu projeto
                    </p>
                  </div>
                </div>
              </EventCreateDialog>
            </CardContent>
          </Card>

          {/* Events Cards - Design redesenhado */}
          {events.map((event, index) => {
            const budgetUsed = event.budgetUsed || 0;
            const totalBudget = event.budget || 0;
            const budgetPercentage = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;
            
            return (
              <Card key={event.id} className="card-project animate-scale-up group" style={{animationDelay: `${(index + 1) * 0.1}s`}}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-lg lg:text-xl line-clamp-2 group-hover:text-primary transition-colors">{event.name}</CardTitle>
                    <div className="flex gap-1 lg:gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 button-ghost-modern"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 button-ghost-modern">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="animate-scale-up">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o evento "{event.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="button-modern">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="bg-red-500 hover:bg-red-600 button-modern"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`w-fit badge-animated ${
                      event.status === 'Planejamento' ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900' :
                      event.status === 'Em Andamento' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                      'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                    }`}
                  >
                    {event.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm lg:text-base line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Criado</div>
                        <div className="text-xs">{formatDate(event.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium">Evento</div>
                        <div className="text-xs">{formatDate(event.eventDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Orçamento</div>
                        <div className="text-xs">R$ {budgetUsed.toLocaleString()} / R$ {totalBudget.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress - Design melhorado */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Progresso do Orçamento</span>
                      <span className="text-sm text-muted-foreground font-mono">{budgetPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                          budgetPercentage > 90 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                          budgetPercentage > 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                          'bg-gradient-to-r from-[#26387b] to-[#1d76b2]'
                        }`}
                        style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  <Link to={`/event/${event.id}`} className="block">
                    <Button className="w-full bg-gradient-to-r from-[#26387b] to-[#1d76b2] text-white hover:from-[#1d2b63] hover:to-[#155a8f] button-modern shadow-lg">
                      <span className="flex items-center justify-center gap-2">
                        Ver Detalhes
                        <FileText className="w-4 h-4" />
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Event Dialog */}
        {editingEvent && (
          <EventEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            event={editingEvent}
            onSave={handleSaveEvent}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
