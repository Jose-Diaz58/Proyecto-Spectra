import React, { useState } from 'react';
import { useTaskManager } from '@/hooks/use-task-manager';
import { TaskColumn } from '@/components/task/TaskColumn';
import { TaskDialog } from '@/components/task/TaskDialog';
import { ConfirmDialog } from '@/components/task/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { Plus, LayoutDashboard, Terminal, Layers, ArrowRight, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TaskManager() {
  const { 
    tasks, createTask, updateTask, deleteTask, addSubTask, toggleSubTask, 
    debugStructures, popFromStack, dequeueFromQueue 
  } = useTaskManager();
  
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const handleCreate = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
      setIsDeleteDialogOpen(false);
      setDeletingTask(null);
    }
  };

  const handleTaskSubmit = (data: any, subtasks: string[]) => {
    if (editingTask) {
      updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        status: data.status,
      });
      
      subtasks.forEach(text => {
        const exists = editingTask.subtasks.some(st => st.text === text);
        if (!exists) {
          addSubTask(editingTask.id, text);
        }
      });
    } else {
      createTask(data.title, data.description, data.status);
    }
  };

  // Filter tasks by status
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const progressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen w-full bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold heading-font bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Gestor de Tareas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <Button variant="ghost" size="sm" onClick={debugStructures} title="Imprimir estructuras en consola">
                <Terminal className="h-4 w-4 mr-1" /> Debug
              </Button>
              <Button variant="ghost" size="sm" onClick={popFromStack} title="Pop del Stack (LIFO)">
                <Layers className="h-4 w-4 mr-1" /> Stack Pop
              </Button>
              <Button variant="ghost" size="sm" onClick={dequeueFromQueue} title="Dequeue de Queue (FIFO)">
                <ArrowRight className="h-4 w-4 mr-1" /> Queue Next
              </Button>
            </div>
            <Button 
              onClick={handleCreate} 
              className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
            </Button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <TaskColumn 
              title="Pendiente" 
              status="pending" 
              tasks={pendingTasks} 
              color="#3B82F6" 
              bgColor="#EFF6FF"
              count={pendingTasks.length}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleSubTask={toggleSubTask}
            />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <TaskColumn 
              title="En Progreso" 
              status="in-progress" 
              tasks={progressTasks} 
              color="#8B5CF6" 
              bgColor="#F5F3FF"
              count={progressTasks.length}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleSubTask={toggleSubTask}
            />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TaskColumn 
              title="Completada" 
              status="completed" 
              tasks={completedTasks} 
              color="#10B981" 
              bgColor="#ECFDF5"
              count={completedTasks.length}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleSubTask={toggleSubTask}
            />
          </motion.div>
        </div>
      </main>

      {/* Dialogs */}
      <TaskDialog 
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />

      <ConfirmDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar tarea?"
        description="Esta acción no se puede deshacer. La tarea se eliminará permanentemente."
      />
    </div>
  );
}
