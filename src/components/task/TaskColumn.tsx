import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  bgColor: string;
  count: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
}

export function TaskColumn({ 
  title, 
  status, 
  tasks, 
  color, 
  bgColor,
  count,
  onEdit, 
  onDelete,
  onToggleSubTask
}: TaskColumnProps) {
  const statusColors = {
    'pending': '#3B82F6',
    'in-progress': '#8B5CF6',
    'completed': '#10B981'
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] rounded-xl bg-white/40 dark:bg-black/20 border border-white/20 backdrop-blur-sm shadow-sm">
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold heading-font text-lg tracking-tight">{title}</h3>
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5 min-w-[1.25rem] justify-center">
            {count}
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 pt-2">
        <div className="pb-4">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onToggleSubTask={onToggleSubTask}
              statusColors={statusColors}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm opacity-60">
              Sin tareas
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
