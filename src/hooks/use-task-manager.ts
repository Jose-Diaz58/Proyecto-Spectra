import { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, SubTask } from '../lib/types';
import { DoublyLinkedList, Stack, Queue, printSubtaskTree } from '../lib/structures';
import { toast } from 'sonner';

const STORAGE_KEY = 'kanban-tasks-v1';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Data Structures Instances (Refs to persist across renders without triggering re-renders themselves)
  const dllRef = useRef(new DoublyLinkedList());
  const stackRef = useRef(new Stack());
  const queueRef = useRef(new Queue());

  // Sync Data Structures with State
  useEffect(() => {
    // Rebuild DLL when tasks change
    const dll = new DoublyLinkedList();
    tasks.forEach(t => dll.append(t));
    dllRef.current = dll;
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    
    // Debug print
    // console.log("--- Structures Synced ---");
    // dll.printList();
  }, [tasks]);

  const createTask = (title: string, description: string, status: TaskStatus = 'pending') => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status,
      subtasks: [],
      createdAt: Date.now(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // Also add to Stack and Queue for demo purposes
    stackRef.current.push(newTask);
    queueRef.current.enqueue(newTask);
    
    toast.success('Tarea creada exitosamente');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    toast.success('Tarea actualizada');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast.success('Tarea eliminada');
  };

  // Recursive helper to add subtask
  const addSubTaskRecursive = (subtasks: SubTask[], targetId: string | null, newSubTask: SubTask): SubTask[] => {
    // If targetId is null, we are adding to the root (handled in wrapper)
    
    return subtasks.map(st => {
      if (st.id === targetId) {
        return { ...st, subtasks: [...st.subtasks, newSubTask] };
      }
      if (st.subtasks.length > 0) {
        return { ...st, subtasks: addSubTaskRecursive(st.subtasks, targetId, newSubTask) };
      }
      return st;
    });
  };

  const addSubTask = (taskId: string, text: string, parentSubTaskId: string | null = null) => {
    const newSubTask: SubTask = {
      id: generateId(),
      text,
      completed: false,
      subtasks: []
    };
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        if (parentSubTaskId === null) {
          // Add to root subtasks
          return { ...task, subtasks: [...task.subtasks, newSubTask] };
        } else {
          // Add to nested subtask
          return { ...task, subtasks: addSubTaskRecursive(task.subtasks, parentSubTaskId, newSubTask) };
        }
      }
      return task;
    }));
  };

  // Recursive helper to toggle
  const toggleSubTaskRecursive = (subtasks: SubTask[], targetId: string): SubTask[] => {
    return subtasks.map(st => {
      if (st.id === targetId) {
        return { ...st, completed: !st.completed };
      }
      if (st.subtasks.length > 0) {
        return { ...st, subtasks: toggleSubTaskRecursive(st.subtasks, targetId) };
      }
      return st;
    });
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, subtasks: toggleSubTaskRecursive(task.subtasks, subTaskId) };
      }
      return task;
    }));
  };

  // Recursive helper to remove
  const removeSubTaskRecursive = (subtasks: SubTask[], targetId: string): SubTask[] => {
    return subtasks
      .filter(st => st.id !== targetId)
      .map(st => ({
        ...st,
        subtasks: removeSubTaskRecursive(st.subtasks, targetId)
      }));
  };

  const removeSubTask = (taskId: string, subTaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, subtasks: removeSubTaskRecursive(task.subtasks, subTaskId) };
      }
      return task;
    }));
  };

  // Advanced Structure Operations
  const debugStructures = () => {
    console.clear();
    console.log("%c Estructuras de Datos ", "background: #222; color: #bada55; font-size: 16px");
    
    console.log("%c Lista Doblemente Enlazada (Actual): ", "color: #3B82F6");
    dllRef.current.printList();
    
    console.log("%c Stack (LIFO - Historial de creación): ", "color: #8B5CF6");
    stackRef.current.printStack();
    
    console.log("%c Queue (FIFO - Historial de creación): ", "color: #10B981");
    queueRef.current.printQueue();
    
    console.log("%c Árboles de Subtareas: ", "color: #F59E0B");
    tasks.forEach(t => {
      if (t.subtasks.length > 0) {
        console.log(`Tarea: ${t.title}`);
        printSubtaskTree(t.subtasks);
      }
    });
    
    toast.info("Estructuras impresas en consola (F12)");
  };

  const popFromStack = () => {
    const item = stackRef.current.pop();
    if (item) {
      toast.info(`Stack Pop: ${item.title}`);
      // Optional: remove from tasks if you want strict sync, but usually stack is just for operations
    } else {
      toast.warning("Stack vacío");
    }
  };

  const dequeueFromQueue = () => {
    const item = queueRef.current.dequeue();
    if (item) {
      toast.info(`Queue Dequeue: ${item.title}`);
    } else {
      toast.warning("Queue vacía");
    }
  };

  return {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    addSubTask,
    toggleSubTask,
    removeSubTask,
    debugStructures,
    popFromStack,
    dequeueFromQueue
  };
}
