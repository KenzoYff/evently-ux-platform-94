
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Event {
  id: string;
  name: string;
  createdAt: Date;
  eventDate: Date;
  status: string;
  budget: number;
  budgetUsed: number;
  description: string;
  notes: string;
  createdBy: string;
  teamMembers: string[];
  documents?: any[];
  tasks?: any[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      
      // Buscar eventos onde o usuário é criador OU está na lista de membros
      const q = query(
        eventsRef, 
        or(
          where('createdBy', '==', user.uid),
          where('teamMembers', 'array-contains', user.uid)
        )
      );
      
      const querySnapshot = await getDocs(q);
      
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt.toDate(),
          eventDate: data.eventDate.toDate(),
          status: data.status,
          budget: data.budget || 0,
          budgetUsed: data.budgetUsed || 0,
          description: data.description,
          notes: data.notes || '',
          createdBy: data.createdBy,
          teamMembers: data.teamMembers || []
        });
      });
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) return;
    
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date(),
        createdBy: user.uid,
        notes: eventData.notes || '',
        budget: eventData.budget || 0,
        budgetUsed: eventData.budgetUsed || 0,
        teamMembers: eventData.teamMembers || []
      });
      
      const newEvent: Event = {
        ...eventData,
        id: docRef.id,
        createdAt: new Date(),
        createdBy: user.uid,
        notes: eventData.notes || '',
        budget: eventData.budget || 0,
        budgetUsed: eventData.budgetUsed || 0,
        teamMembers: eventData.teamMembers || []
      };
      
      setEvents(prev => [...prev, newEvent]);
      toast.success('Evento criado com sucesso!');
      return newEvent;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento');
      throw error;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, eventData);
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, ...eventData } : event
      ));
      
      toast.success('Evento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento');
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Evento excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
      throw error;
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
