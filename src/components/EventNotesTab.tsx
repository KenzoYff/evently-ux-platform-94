
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

interface EventNotesTabProps {
  eventId: string;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const EventNotesTab: React.FC<EventNotesTabProps> = ({
  eventId,
  notes,
  onUpdateNotes
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await onUpdateNotes(localNotes);
      toast.success('Anotações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast.error('Erro ao salvar anotações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Anotações do Projeto
        </label>
        <Textarea
          id="notes"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="Adicione suas anotações sobre o projeto..."
          className="min-h-[200px]"
        />
      </div>
      
      <Button 
        onClick={handleSaveNotes} 
        disabled={saving || localNotes === notes}
        className="flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>{saving ? 'Salvando...' : 'Salvar Anotações'}</span>
      </Button>
    </div>
  );
};

export default EventNotesTab;
