
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Edit, FileText, Users, Kanban, StickyNote, Info, TrendingUp, DollarSign, Clock, MapPin } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { formatDate } from '@/lib/utils';
import EventMembersDialog from '@/components/EventMembersDialog';
import EventDocumentsDialog from '@/components/EventDocumentsDialog';
import EventKanbanTab from '@/components/EventKanbanTab';
import EventNotesTab from '@/components/EventNotesTab';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { events, updateEvent } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  const handleUpdateMembers = async (members: string[]) => {
    if (event) {
      await updateEvent(event.id, { teamMembers: members });
      setEvent(prev => ({ ...prev, teamMembers: members }));
    }
  };

  const handleUpdateDocuments = async (newDocuments: any[]) => {
    setDocuments(newDocuments);
    if (event) {
      await updateEvent(event.id, { documents: newDocuments });
      setEvent(prev => ({ ...prev, documents: newDocuments }));
    }
  };

  const handleUpdateNotes = async (notes: string) => {
    if (event) {
      await updateEvent(event.id, { notes });
      setEvent(prev => ({ ...prev, notes }));
    }
  };

  useEffect(() => {
    if (id && events) {
      const foundEvent = events.find((event) => event.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
        setDocuments(foundEvent.documents || []);
      }
    }
  }, [id, events]);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-48">
          <span className="text-muted-foreground">Carregando detalhes do evento...</span>
        </div>
      </div>
    );
  }

  const budgetPercentage = event.budget > 0 ? (event.budgetUsed / event.budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header moderno */}
        <div className="mb-8 animate-slide-up">
          <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl lg:text-4xl font-bold">{event.name}</h1>
                  <p className="text-white/90 text-lg">
                    Criado em {formatDate(event.createdAt)}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {formatDate(event.eventDate)}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Users className="w-4 h-4 mr-1" />
                      {event.teamMembers?.length || 0} membros
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <Link to="/">
                      <MapPin className="w-4 h-4 mr-2" />
                      Voltar para a lista
                    </Link>
                  </Button>
                  <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Evento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-interactive animate-bounce-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orçamento Total</p>
                  <p className="text-2xl font-bold text-foreground">R$ {event.budget?.toLocaleString() || '0'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Orçamento Usado</p>
                  <p className="text-2xl font-bold text-foreground">R$ {event.budgetUsed?.toLocaleString() || '0'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={budgetPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetPercentage.toFixed(1)}% utilizado
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="mt-2">
                    {event.status}
                  </Badge>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="text-xl">Detalhes do Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="details" className="flex items-center space-x-2">
                      <Info className="w-4 h-4" />
                      <span className="hidden sm:inline">Detalhes</span>
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="flex items-center space-x-2">
                      <Kanban className="w-4 h-4" />
                      <span className="hidden sm:inline">Kanban</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Documentos</span>
                    </TabsTrigger>
                    <TabsTrigger value="members" className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Membros</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center space-x-2">
                      <StickyNote className="w-4 h-4" />
                      <span className="hidden sm:inline">Anotações</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Descrição
                        </h3>
                        <p className="text-muted-foreground">
                          {event.description || 'Nenhuma descrição disponível.'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Data do Evento</h4>
                          <p className="text-muted-foreground">{formatDate(event.eventDate)}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Status</h4>
                          <Badge variant="secondary">{event.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="kanban">
                    <EventKanbanTab eventId={event.id} />
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Documentos</h3>
                          <p className="text-sm text-muted-foreground">Gerencie os documentos do projeto</p>
                        </div>
                      </div>
                      <EventDocumentsDialog
                        eventId={event.id}
                        documents={documents}
                        onUpdateDocuments={handleUpdateDocuments}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="members">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Membros da Equipe</h3>
                          <p className="text-sm text-muted-foreground">Gerencie os membros do projeto</p>
                        </div>
                      </div>
                      <EventMembersDialog
                        eventId={event.id}
                        teamMembers={event.teamMembers || []}
                        onUpdateMembers={handleUpdateMembers}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="notes">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Anotações</h3>
                          <p className="text-sm text-muted-foreground">Adicione anotações sobre o projeto</p>
                        </div>
                      </div>
                      <EventNotesTab
                        eventId={event.id}
                        notes={event.notes || ''}
                        onUpdateNotes={handleUpdateNotes}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.4s'}}>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Data do Evento</span>
                  <span className="text-sm text-foreground">{formatDate(event.eventDate)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge variant="secondary">{event.status}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Orçamento</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-icon-budget" />
                    <span className="text-sm text-foreground">R$ {event.budget?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Orçamento Utilizado</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-icon-budget" />
                    <span className="text-sm text-foreground">R$ {event.budgetUsed?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Membros</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-icon-primary" />
                    <span className="text-sm text-foreground">{event.teamMembers?.length || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Documentos</span>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-icon-primary" />
                    <span className="text-sm text-foreground">{documents.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.5s'}}>
              <CardHeader>
                <CardTitle className="text-lg">Progresso do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={budgetPercentage} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilizado</span>
                    <span className="text-foreground font-medium">{budgetPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restante</span>
                    <span className="text-foreground font-medium">
                      R$ {((event.budget || 0) - (event.budgetUsed || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
