import { Task as ITask, SubTask as ISubTask, TaskStatus } from './types';

// Clase SubTaskNode para el árbol de subtareas
export class SubTaskNode implements ISubTask {
  id: string;
  text: string;
  completed: boolean;
  subtasks: SubTaskNode[];

  constructor(id: string, text: string, completed: boolean = false) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.subtasks = [];
  }

  addSubTask(subtask: SubTaskNode) {
    this.subtasks.push(subtask);
  }
}

// Clase TaskNode para estructuras lineales (DLL, Stack, Queue)
export class TaskNode {
  data: ITask;
  prev: TaskNode | null = null;
  next: TaskNode | null = null;

  constructor(data: ITask) {
    this.data = data;
  }
}

// Lista Doblemente Enlazada
export class DoublyLinkedList {
  head: TaskNode | null = null;
  tail: TaskNode | null = null;
  size: number = 0;

  append(data: ITask) {
    const newNode = new TaskNode(data);
    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
  }

  prepend(data: ITask) {
    const newNode = new TaskNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  removeHead(): ITask | null {
    if (!this.head) return null;
    const data = this.head.data;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    }
    this.size--;
    return data;
  }

  removeLast(): ITask | null {
    if (!this.tail) return null;
    const data = this.tail.data;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) this.tail.next = null;
    }
    this.size--;
    return data;
  }

  toArray(): ITask[] {
    const result: ITask[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  printList() {
    const items = this.toArray().map(t => `[${t.title}]`);
    console.log("Doubly Linked List:", items.join(" <-> "));
  }
}

// Stack (LIFO)
export class Stack {
  items: ITask[] = [];

  push(item: ITask) {
    this.items.push(item);
  }

  pop(): ITask | undefined {
    return this.items.pop();
  }

  peek(): ITask | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  printStack() {
    console.log("Stack (Top to Bottom):", this.items.map(t => t.title).reverse());
  }
}

// Queue (FIFO)
export class Queue {
  items: ITask[] = [];

  enqueue(item: ITask) {
    this.items.push(item);
  }

  dequeue(): ITask | undefined {
    return this.items.shift();
  }

  front(): ITask | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  printQueue() {
    console.log("Queue (Front to Back):", this.items.map(t => t.title));
  }
}

// Función recursiva para imprimir árbol de subtareas
export function printSubtaskTree(subtasks: ISubTask[], level: number = 0) {
  const prefix = '  '.repeat(level);
  subtasks.forEach(st => {
    console.log(`${prefix}* ${st.text} (${st.completed ? '✓' : ' '})`);
    if (st.subtasks && st.subtasks.length > 0) {
      printSubtaskTree(st.subtasks, level + 1);
    }
  });
}
