import React from 'react';
import { Task, TaskStatus, SubTask } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit2, CheckSquare, Square, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
  statusColors: Record<TaskStatus, string>;
}

// Recursive Subtask Component
const SubTaskList = ({ 
  subtasks, 
  taskId, 
  onToggle, 
  level = 0 
}: { 
  subtasks: SubTask[], 
  taskId: string, 
  onToggle: (taskId: string, subTaskId: string) => void,
  level?: number
}) => {
  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="space-y-1 mt-1">
      {subtasks.map(sub => (
        <div key={sub.id}>
          <div 
            className="flex items-center gap-2 group/sub py-0.5"
            style={{ paddingLeft: `${level * 12}px` }}
          >
            {level > 0 && (
              <div className="w-2 h-px bg-muted-foreground/30 mr-1" />
            )}
            <Checkbox 
              checked={sub.completed}
              onCheckedChange={() => onToggle(taskId, sub.id)}
              className="h-3.5 w-3.5"
            />
            <span className={`text-xs ${sub.completed ? 'line-through text-muted-foreground' : ''}`}>
              {sub.text}
            </span>
          </div>
          {/* Recursive Call */}
          {sub.subtasks && sub.subtasks.length > 0 && (
            <SubTaskList 
              subtasks={sub.subtasks} 
              taskId={taskId} 
              onToggle={onToggle} 
              level={level + 1} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Helper to count total/completed recursively
const countSubtasks = (subtasks: SubTask[]): { total: number, completed: number } => {
  let total = 0;
  let completed = 0;
  
  subtasks.forEach(st => {
    total++;
    if (st.completed) completed++;
    
    if (st.subtasks && st.subtasks.length > 0) {
      const nested = countSubtasks(st.subtasks);
      total += nested.total;
      completed += nested.completed;
    }
  });
  
  return { total, completed };
};

export function TaskCard({ task, onEdit, onDelete, onToggleSubTask, statusColors }: TaskCardProps) {
  const { total: totalSubtasks, completed: completedSubtasks } = countSubtasks(task.subtasks);
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="mb-4"
    >
      <Card className="glass-card border-l-4 overflow-hidden group" style={{ borderLeftColor: statusColors[task.status] }}>
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold heading-font leading-tight">
              {task.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {format(task.createdAt, "d 'de' MMM", { locale: es })}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 px-4">
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.subtasks.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso</span>
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out rounded-full" 
                  style={{ 
                    width: `${progress}%`, 
                    backgroundColor: statusColors[task.status] 
                  }} 
                />
              </div>
              
              <div className="mt-2">
                <SubTaskList 
                  subtasks={task.subtasks} 
                  taskId={task.id} 
                  onToggle={onToggleSubTask} 
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
