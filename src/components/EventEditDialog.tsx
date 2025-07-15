
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/hooks/useEvents';

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onSave: (eventData: Partial<Event>) => Promise<void>;
}

const EventEditDialog: React.FC<EventEditDialogProps> = ({
  open,
  onOpenChange,
  event,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    eventDate: event.eventDate.toISOString().split('T')[0],
    status: event.status,
    budget: event.budget || 0,
    budgetUsed: event.budgetUsed || 0,
    notes: event.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave({
        name: formData.name,
        description: formData.description,
        eventDate: new Date(formData.eventDate),
        status: formData.status,
        budget: formData.budget,
        budgetUsed: formData.budgetUsed,
        notes: formData.notes
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Evento</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Imagem do Projeto</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Para este exemplo, vamos apenas mostrar o nome do arquivo
                  // Em uma implementação real, você faria upload para um serviço de storage
                  console.log('Arquivo selecionado:', file.name);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Adicione uma imagem para representar o projeto
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eventDate">Data do Evento</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planejamento">Planejamento</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Preparação">Preparação</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">Orçamento Total (R$)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="budgetUsed">Orçamento Usado (R$)</Label>
              <Input
                id="budgetUsed"
                type="number"
                min="0"
                step="0.01"
                value={formData.budgetUsed}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetUsed: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Anotações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Anotações importantes sobre o evento"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditDialog;
