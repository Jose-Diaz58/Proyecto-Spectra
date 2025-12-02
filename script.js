// --- IMPLEMENTACIÓN DE ESTRUCTURAS DE DATOS ---
//Probando implementacion de ramas :chepe
//no pulpo no

class Nodo {
    constructor(data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // O(1)
    append(data) {
        const nuevo = new Nodo(data);
        if (!this.tail) {
            this.head = this.tail = nuevo;
        } else {
            this.tail.next = nuevo;
            nuevo.prev = this.tail;
            this.tail = nuevo;
        }
        this.size++;
    }

    // O(1)
    prepend(data) {
        const nuevo = new Nodo(data);
        if (!this.head) {
            this.head = this.tail = nuevo;
        } else {
            nuevo.next = this.head;
            this.head.prev = nuevo;
            this.head = nuevo;
        }
        this.size++;
    }

    // O(1)
    removeHead() {
        if (!this.head) return null;
        const valor = this.head.data;
        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        this.size--;
        return valor;
    }

    // O(1)
    removeLast() {
        if (!this.tail) return null;
        const valor = this.tail.data;
        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        this.size--;
        return valor;
    }
    
    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        return result;
    }
}

class Stack {
    constructor() { 
        this.items = []; 
    }
    push(item) { 
        this.items.push(item); 
    }
    pop() { 
        return this.items.pop(); 
    }
}

class Queue {
    constructor() { 
        this.items = []; 
    }
    enqueue(item) { 
        this.items.push(item); 
    }
    dequeue() { 
        return this.items.shift(); 
    }
}

// --- APLICACIÓN PRINCIPAL ---

const STORAGE_KEY = 'kanban-vanilla-v1';

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        this.dll = new DoublyLinkedList();
        this.stack = new Stack(); 
        this.queue = new Queue(); 
        this.undoStack = new Stack(); 
        this.redoStack = new Stack(); 
        
        this.tasks.forEach(t => {
            this.dll.append(t);
            this.stack.push(t); 
            this.queue.enqueue(t);
        });

        this.initUI();
        this.renderBoard();
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
        this.dll = new DoublyLinkedList();
        this.tasks.forEach(t => this.dll.append(t));
    }

    handleNewAction(action) {
        this.undoStack.push(action);
        this.redoStack.items = []; // Limpiar RedoStack al realizar cualquier acción
    }

    createTask(title, description, status) {
        const newTask = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            description,
            status,
            subtasks: [], 
            createdAt: Date.now()
        };
        
        this.tasks.push(newTask);
        this.stack.push(newTask);
        this.queue.enqueue(newTask);
        
        this.handleNewAction({
            type: 'ADD',
            data: JSON.parse(JSON.stringify(newTask)), 
        });
        
        this.save();
        this.renderBoard();
        this.showToast(`Tarea "${title}" creada`, 'success');
    }

    updateTask(id, updates) {
        const originalTask = this.tasks.find(t => t.id === id);
        
        if (originalTask) {
            // Guardar el estado ORIGINAL (S1) antes de la actualización
            this.handleNewAction({
                type: 'UPDATE',
                data: JSON.parse(JSON.stringify(originalTask)), 
            });
        }
        
        this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        this.save();
        this.renderBoard();
        this.showToast('Tarea actualizada', 'info');
    }

    deleteTask(id) {
        const taskToDelete = this.tasks.find(t => t.id === id);
        
        if (taskToDelete) {
            this.handleNewAction({
                type: 'DELETE',
                data: JSON.parse(JSON.stringify(taskToDelete)), 
                index: this.tasks.indexOf(taskToDelete) 
            });
        }
        
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.renderBoard();
        this.showToast('Tarea eliminada', 'error');
    }
    
    // MÉTODO: Deshacer (Stack LIFO)
    undoLastAction() {
        const lastAction = this.undoStack.pop();
        
        if (!lastAction) {
            this.showToast('No hay acciones para deshacer.', 'info');
            return;
        }

        // 1. Guardar el estado actual (S2) antes de deshacer
        if (lastAction.type === 'UPDATE') {
            const taskToRestore = lastAction.data; // S1
            const currentTaskState = this.tasks.find(t => t.id === taskToRestore.id); // S2

            // 2. CORRECCIÓN: Sobreescribir la data del lastAction con S2 y moverlo a redoStack
            lastAction.data = JSON.parse(JSON.stringify(currentTaskState));
            this.redoStack.push(lastAction);
            
            // 3. Aplicar el Undo (restaurar S1)
            this.tasks = this.tasks.map(t => 
                t.id === taskToRestore.id ? taskToRestore : t
            );
            this.showToast(`Deshecho: Tarea "${taskToRestore.title}" revertida.`, 'info');
            
        } else {
            // Para ADD/DELETE: Mover la acción y ejecutar la reversión
            this.redoStack.push(lastAction);
            
            if (lastAction.type === 'DELETE') {
                const taskToRestore = lastAction.data;
                this.tasks.splice(lastAction.index, 0, taskToRestore);
                this.showToast(`Deshecho: Tarea "${taskToRestore.title}" restaurada.`, 'info');
                
            } else if (lastAction.type === 'ADD') {
                const idToRemove = lastAction.data.id;
                this.tasks = this.tasks.filter(t => t.id !== idToRemove);
                this.showToast('Deshecho: Tarea creada eliminada.', 'info');
            }
        } 
        
        this.save();
        this.renderBoard();
    }
    
    // MÉTODO: Rehacer (Stack LIFO - Inverso)
    redoLastAction() {
        const lastRedoAction = this.redoStack.pop();
        
        if (!lastRedoAction) {
            this.showToast('No hay acciones para rehacer.', 'info');
            return;
        }
        
        // 1. Guardar el estado actual antes de rehacer (para el UndoStack)
        if (lastRedoAction.type === 'UPDATE') {
            const taskToApply = lastRedoAction.data; // Estado S2
            const currentState = this.tasks.find(t => t.id === taskToApply.id); // Estado S1
            
            // 2. Sobreescribir la data del lastRedoAction con S1 y moverlo a undoStack
            lastRedoAction.data = JSON.parse(JSON.stringify(currentState));
            this.undoStack.push(lastRedoAction);

            // 3. Aplicar el Redo (restaurar S2)
            this.tasks = this.tasks.map(t => 
                t.id === taskToApply.id ? taskToApply : t
            );
            this.showToast(`Rehecho: Tarea "${taskToApply.title}" actualizada.`, 'info');
            
        } else {
            // Para ADD/DELETE: Mover la acción y ejecutar la acción original
            this.undoStack.push(lastRedoAction);

            if (lastRedoAction.type === 'DELETE') {
                const idToDelete = lastRedoAction.data.id;
                this.tasks = this.tasks.filter(t => t.id !== idToDelete);
                this.showToast('Rehecho: Tarea eliminada nuevamente.', 'info');

            } else if (lastRedoAction.type === 'ADD') {
                const taskToRestore = lastRedoAction.data;
                this.tasks.push(taskToRestore); 
                this.showToast(`Rehecho: Tarea "${taskToRestore.title}" restaurada.`, 'info');
            }
        }
        
        this.save();
        this.renderBoard();
    }
    
    // --- Lógica de Subtareas (Árboles/Recursión) ---

    addSubTask(taskId, text, parentSubTaskId = null) {
        const newSub = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            completed: false,
            subtasks: []
        };

        const addRecursive = (list) => {
            return list.map(item => {
                if (item.id === parentSubTaskId) {
                    return { ...item, subtasks: [...item.subtasks, newSub] };
                }
                if (item.subtasks.length > 0) {
                    return { ...item, subtasks: addRecursive(item.subtasks) };
                }
                return item;
            });
        };

        this.tasks = this.tasks.map(task => {
            if (task.id !== taskId) return task;
            
            if (!parentSubTaskId) {
                return { ...task, subtasks: [...task.subtasks, newSub] };
            } else {
                return { ...task, subtasks: addRecursive(task.subtasks) };
            }
        });
        
        this.redoStack.items = []; // Limpiar RedoStack
        this.save();
        this.renderBoard();
    }

    toggleSubTask(taskId, subTaskId) {
        const toggleRecursive = (list) => {
            return list.map(item => {
                if (item.id === subTaskId) return { ...item, completed: !item.completed };
                if (item.subtasks.length > 0) return { ...item, subtasks: toggleRecursive(item.subtasks) };
                return item;
            });
        };

        this.tasks = this.tasks.map(t => 
            t.id === taskId ? { ...t, subtasks: toggleRecursive(t.subtasks) } : t
        );
        this.redoStack.items = []; // Limpiar RedoStack
        this.save();
        this.renderBoard();
    }
    
    removeSubTask(taskId, subTaskId) {
        const removeRecursive = (list) => {
            return list.filter(item => {
                if (item.id === subTaskId) {
                    return false; 
                }
                
                if (item.subtasks.length > 0) {
                    item.subtasks = removeRecursive(item.subtasks);
                }
                
                return true;
            });
        };

        this.tasks = this.tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, subtasks: removeRecursive(t.subtasks) };
            }
            return t;
        });
        
        this.redoStack.items = []; // Limpiar RedoStack
        this.save();
        this.renderBoard();
        this.showToast('Subtarea eliminada', 'error');
    }

    // --- UI & Rendering ---

    initUI() {
        document.getElementById('btn-create').addEventListener('click', () => this.openModal());
        document.getElementById('btn-undo').addEventListener('click', () => this.undoLastAction());
        document.getElementById('btn-redo').addEventListener('click', () => this.redoLastAction()); 

        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        document.getElementById('btn-add-subtask-edit').addEventListener('click', () => {
            const input = document.getElementById('input-new-subtask');
            if(input.value.trim()) {
                this.tempSubtasks.push(input.value.trim());
                input.value = '';
                this.renderTempSubtasks();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('input-title').value;
            const desc = document.getElementById('input-desc').value;
            const status = document.getElementById('input-status').value;

            if (this.editingId) {
                this.updateTask(this.editingId, { title, description: desc, status });
                this.tempSubtasks.forEach(txt => this.addSubTask(this.editingId, txt));
            } else {
                this.createTask(title, desc, status);
            }
            modal.classList.remove('active');
        });

        document.getElementById('btn-cancel-delete').addEventListener('click', () => {
            document.getElementById('confirm-modal').classList.remove('active');
        });
        document.getElementById('btn-confirm-delete').addEventListener('click', () => {
            if(this.deletingId) this.deleteTask(this.deletingId);
            document.getElementById('confirm-modal').classList.remove('active');
        });
    }

    renderBoard() {
        const columns = {
            'pending': document.getElementById('col-pending'),
            'in-progress': document.getElementById('col-progress'),
            'completed': document.getElementById('col-completed')
        };

        Object.values(columns).forEach(col => col.querySelector('.task-list').innerHTML = '');
        
        const counts = { 'pending': 0, 'in-progress': 0, 'completed': 0 };

        this.tasks.forEach(task => {
            counts[task.status]++;
            const card = this.createTaskCard(task);
            columns[task.status].querySelector('.task-list').appendChild(card);
        });

        document.getElementById('count-pending').textContent = counts['pending'];
        document.getElementById('count-progress').textContent = counts['in-progress'];
        document.getElementById('count-completed').textContent = counts['completed'];
        
        lucide.createIcons();
    }

    createTaskCard(task) {
        const el = document.createElement('div');
        el.className = 'task-card';
        el.style.borderLeftColor = `var(--border-${task.status})`;
        
        const countProgress = (list) => {
            let total = 0, completed = 0;
            list.forEach(i => {
                total++;
                if(i.completed) completed++;
                if(i.subtasks.length) {
                    const nested = countProgress(i.subtasks);
                    total += nested.total;
                    completed += nested.completed;
                }
            });
            return { total, completed };
        };
        const { total, completed } = countProgress(task.subtasks);
        const pct = total === 0 ? 0 : (completed / total) * 100;

        el.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="btn-icon edit" title="Editar"><i data-lucide="edit-2" width="14"></i></button>
                    <button class="btn-icon delete" title="Eliminar"><i data-lucide="trash-2" width="14"></i></button>
                </div>
            </div>
            <div class="task-date">${new Date(task.createdAt).toLocaleDateString()}</div>
            <div class="task-desc">${task.description || ''}</div>
            
            ${total > 0 ? `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%; background-color: var(--border-${task.status})"></div>
            </div>
            <div style="font-size: 0.75rem; display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-muted);">
                <span>Progreso</span>
                <span>${completed}/${total}</span>
            </div>
            ` : ''}
            
            <div class="subtasks-container"></div>
        `;

        const subtasksContainer = el.querySelector('.subtasks-container');
        
        const renderSubTree = (list, level = 0) => {
            const wrapper = document.createElement('div');
            list.forEach(sub => {
                const row = document.createElement('div');
                row.className = 'subtask-item';
                row.style.paddingLeft = `${level * 12}px`;
                
                const check = document.createElement('input');
                check.type = 'checkbox';
                check.checked = sub.completed;
                check.onclick = (e) => { e.stopPropagation(); app.toggleSubTask(task.id, sub.id); }; 
                
                const span = document.createElement('span');
                span.className = `subtask-text ${sub.completed ? 'completed' : ''}`;
                span.textContent = sub.text;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-icon delete-subtask';
                deleteBtn.title = 'Eliminar Subtarea';
                deleteBtn.innerHTML = '<i data-lucide="x" width="12"></i>';
                deleteBtn.onclick = (e) => { 
                    e.stopPropagation(); 
                    app.removeSubTask(task.id, sub.id); 
                };
                
                row.appendChild(check);
                row.appendChild(span);
                row.appendChild(deleteBtn); 
                wrapper.appendChild(row);

                if (sub.subtasks && sub.subtasks.length > 0) {
                    wrapper.appendChild(renderSubTree(sub.subtasks, level + 1));
                }
            });
            return wrapper;
        };

        if (task.subtasks.length > 0) {
            subtasksContainer.appendChild(renderSubTree(task.subtasks));
        }

        el.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(task);
        });
        el.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deletingId = task.id;
            document.getElementById('confirm-modal').classList.add('active');
        });

        return el;
    }

    openModal(task = null) {
        const modal = document.getElementById('task-modal');
        const titleInput = document.getElementById('input-title');
        const descInput = document.getElementById('input-desc');
        const statusInput = document.getElementById('input-status');
        const modalTitle = document.getElementById('modal-title');

        this.tempSubtasks = [];
        this.renderTempSubtasks();

        if (task) {
            this.editingId = task.id;
            modalTitle.textContent = 'Editar Tarea';
            titleInput.value = task.title;
            descInput.value = task.description || '';
            statusInput.value = task.status;
        } else {
            this.editingId = null;
            modalTitle.textContent = 'Nueva Tarea';
            titleInput.value = '';
            descInput.value = '';
            statusInput.value = 'pending';
        }
        
        modal.classList.add('active');
    }

    renderTempSubtasks() {
        const container = document.getElementById('temp-subtask-list');
        container.innerHTML = '';
        this.tempSubtasks.forEach((txt, idx) => {
            const div = document.createElement('div');
            div.className = 'subtask-item-edit';
            div.innerHTML = `<span>${txt}</span> <button type="button" onclick="app.tempSubtasks.splice(${idx},1); app.renderTempSubtasks()">&times;</button>`;
            container.appendChild(div);
        });
    }

    showToast(msg, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Iniciar
const app = new TaskManager();
window.app = app;