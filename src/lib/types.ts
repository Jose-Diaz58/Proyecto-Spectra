export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  subtasks: SubTask[]; // Recursive structure for Tree
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  subtasks: SubTask[];
  createdAt: number;
}
