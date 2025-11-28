import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, TaskStatus } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50, 'Máximo 50 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional(),
  status: z.enum(['pending', 'in-progress', 'completed'] as const),
});

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>, subtasks: string[]) => void;
  task?: Task | null;
}

export function TaskDialog({ open, onOpenChange, onSubmit, task }: TaskDialogProps) {
  const [subtasks, setSubtasks] = useState<{id: string, text: string}[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description,
          status: task.status,
        });
        setSubtasks(task.subtasks.map(st => ({ id: st.id, text: st.text })));
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'pending',
        });
        setSubtasks([]);
      }
      setNewSubtask('');
    }
  }, [open, task, form]);

  const handleAddSubtask = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Math.random().toString(), text: newSubtask.trim() }]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values, subtasks.map(st => st.text));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-none">
        <DialogHeader>
          <DialogTitle className="heading-font text-xl">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Diseñar interfaz..." {...field} className="bg-white/50 dark:bg-black/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalles de la tarea..." className="resize-none bg-white/50 dark:bg-black/20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/50 dark:bg-black/20">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in-progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Subtareas</Label>
              <div className="flex gap-2">
                <Input 
                  value={newSubtask} 
                  onChange={(e) => setNewSubtask(e.target.value)} 
                  placeholder="Agregar paso..."
                  className="bg-white/50 dark:bg-black/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSubtask.trim()) {
                        setSubtasks([...subtasks, { id: Math.random().toString(), text: newSubtask.trim() }]);
                        setNewSubtask('');
                      }
                    }
                  }}
                />
                <Button type="button" size="icon" onClick={handleAddSubtask} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between bg-white/30 dark:bg-black/10 p-2 rounded-md text-sm">
                    <span>{st.text}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveSubtask(st.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{task ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
