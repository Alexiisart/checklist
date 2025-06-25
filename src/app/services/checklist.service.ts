import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Task,
  Subtask,
  TaskError,
  ChecklistData,
} from '../models/task.interface';
import { StorageService } from './storage.service';
import { UuidService } from './uuid.service';

// Servicio para gestionar las listas de verificación (checklists).
// Maneja la creación, actualización y eliminación de tareas y subtareas
@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  // Subject que mantiene la lista actual
  private currentListSubject = new BehaviorSubject<ChecklistData | null>(null);
  // Observable público de la lista actual
  public currentList$ = this.currentListSubject.asObservable();

  // Subject que indica si hay cambios sin guardar
  private hasUnsavedChangesSubject = new BehaviorSubject<boolean>(false);
  // Observable público de cambios sin guardar
  public hasUnsavedChanges$ = this.hasUnsavedChangesSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private uuidService: UuidService
  ) {
    this.loadCurrentProgress();
  }

  // Genera un ID numérico único usando UUIDs como base
  private generateUniqueId(): number {
    return this.uuidService.generateNumericId();
  }

  // Verifica y corrige IDs duplicados en una lista
  public ensureUniqueIds(listData: ChecklistData): void {
    const usedIds = new Set<number>();
    let hasChanges = false;

    // Verificar y corregir IDs de tareas
    for (const task of listData.tasks) {
      if (!task.id || usedIds.has(task.id)) {
        task.id = this.generateUniqueId();
        hasChanges = true;
      }
      usedIds.add(task.id);

      // Verificar y corregir IDs de subtareas
      const subtaskIds = new Set<number>();
      for (const subtask of task.subtasks) {
        if (
          !subtask.id ||
          subtaskIds.has(subtask.id) ||
          usedIds.has(subtask.id)
        ) {
          subtask.id = this.generateUniqueId();
          hasChanges = true;
        }
        subtaskIds.add(subtask.id);
        usedIds.add(subtask.id);
      }

      // Verificar y corregir IDs de errores
      const errorIds = new Set<number>();
      for (const error of task.errors) {
        if (!error.id || errorIds.has(error.id) || usedIds.has(error.id)) {
          error.id = this.generateUniqueId();
          hasChanges = true;
        }
        errorIds.add(error.id);
        usedIds.add(error.id);
      }
    }

    // Si hubo cambios, actualizar la fecha de modificación
    if (hasChanges) {
      listData.modifiedDate = new Date().toISOString();
    }
  }

  // Crea una nueva lista de verificación
  createNewList(taskNames: string[]): ChecklistData {
    const tasks: Task[] = [];

    // Crear tareas con IDs únicos garantizados
    for (const name of taskNames) {
      tasks.push({
        id: this.generateUniqueId(),
        name: name.trim(),
        completed: false,
        subtasks: [],
        errors: [],
      });
    }

    const newList: ChecklistData = {
      id: this.storageService.generateListId(),
      name: '',
      tasks,
      observations: '',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    };

    this.currentListSubject.next(newList);
    this.setUnsavedChanges(true);
    return newList;
  }

  // Carga una lista existente
  loadList(listId: string): ChecklistData | null {
    const listData = this.storageService.loadList(listId);
    if (listData) {
      // Verificar y corregir IDs duplicados antes de cargar
      this.ensureUniqueIds(listData);
      this.currentListSubject.next(listData);
      this.setUnsavedChanges(false);
    }
    return listData;
  }

  // Marca o desmarca una tarea como completada
  toggleTask(taskId: number, completed: boolean): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = completed;

      // Si se marca como completada, completar todas las subtareas automáticamente
      if (completed) {
        task.subtasks.forEach((subtask) => {
          subtask.completed = true;
        });
      }

      this.updateList(currentList);
    }
  }

  // Marca o desmarca una subtarea como completada
  toggleSubtask(taskId: number, subtaskId: number, completed: boolean): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find((s) => s.id === subtaskId);
      if (subtask) {
        subtask.completed = completed;

        // Auto-completar la tarea principal si todas las subtareas están completadas
        if (
          task.subtasks.length > 0 &&
          task.subtasks.every((s) => s.completed)
        ) {
          task.completed = true;
        } else if (!completed) {
          // Si se desmarca cualquier subtarea, desmarcar la tarea principal
          task.completed = false;
        }

        this.updateList(currentList);
      }
    }
  }

  // Agrega una nueva subtarea a una tarea
  addSubtask(taskId: number, name: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      // Separar subtareas por el símbolo "+"
      const subtasks = name
        .split('+')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      subtasks.forEach((subtaskName) => {
        const newSubtask: Subtask = {
          id: this.generateUniqueId(),
          name: subtaskName,
          completed: false,
        };
        task.subtasks.push(newSubtask);
      });

      this.updateList(currentList);
    }
  }

  // Elimina una subtarea
  removeSubtask(taskId: number, subtaskId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      this.updateList(currentList);
    }
  }

  // Actualiza el nombre de una subtarea
  updateSubtask(taskId: number, subtaskId: number, newName: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find((s) => s.id === subtaskId);
      if (subtask) {
        subtask.name = newName.trim();
        this.updateList(currentList);
      }
    }
  }

  // Agrega un error a una tarea
  addError(taskId: number, description: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      const newError: TaskError = {
        id: this.generateUniqueId(),
        name: description.trim(),
      };
      task.errors.push(newError);
      this.updateList(currentList);
    }
  }

  // Elimina un error de una tarea
  removeError(taskId: number, errorId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.errors = task.errors.filter((e) => e.id !== errorId);
      this.updateList(currentList);
    }
  }

  // Actualiza la descripción de un error
  updateError(taskId: number, errorId: number, newDescription: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      const error = task.errors.find((e) => e.id === errorId);
      if (error) {
        error.name = newDescription.trim();
        this.updateList(currentList);
      }
    }
  }

  // Actualiza el nombre de una tarea
  updateTask(taskId: number, newName: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.name = newName.trim();
      this.updateList(currentList);
    }
  }

  // Elimina una tarea
  deleteTask(taskId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    currentList.tasks = currentList.tasks.filter((t) => t.id !== taskId);
    this.updateList(currentList);
  }

  // Actualiza la lista completa de tareas
  updateTasks(newTasksString: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const newTaskNames = newTasksString
      .split(/[,\n]/) // Separar por comas O saltos de línea
      .map((task) => task.trim())
      .filter((task) => task);

    // Crear una copia de las tareas actuales para buscar coincidencias
    const availableTasks = [...currentList.tasks];
    const updatedTasks: Task[] = [];

    newTaskNames.forEach((name) => {
      // Buscar una tarea existente que no haya sido usada aún
      const existingTaskIndex = availableTasks.findIndex(
        (t) => t.name === name
      );

      if (existingTaskIndex !== -1) {
        // Usar la tarea existente y removerla de disponibles
        const existingTask = availableTasks.splice(existingTaskIndex, 1)[0];
        updatedTasks.push(existingTask);
      } else {
        // Crear nueva tarea
        updatedTasks.push({
          id: this.generateUniqueId(),
          name,
          completed: false,
          subtasks: [],
          errors: [],
        });
      }
    });

    currentList.tasks = updatedTasks;
    this.updateList(currentList);
  }

  // Actualiza las observaciones de la lista
  updateObservations(observations: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    currentList.observations = observations;
    this.updateList(currentList);
  }

  // Guarda la lista actual con un nombre (igual que saveListWithName del original)
  saveList(name: string): boolean {
    // Validación de nombre vacío (igual que el original)
    if (!name.trim()) {
      // El toast se debe mostrar desde el componente que llama
      return false;
    }

    const currentList = this.getCurrentList();
    if (!currentList) return false;

    currentList.name = name.trim();
    currentList.modifiedDate = new Date().toISOString();

    try {
      this.storageService.saveList(currentList);
      this.setUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Error saving list:', error);
      return false;
    }
  }

  // Limpia la lista actual
  clearAll(): void {
    this.currentListSubject.next(null);
    this.storageService.clearCurrentProgress();
    this.setUnsavedChanges(false);
  }

  // Obtiene la lista actual
  private getCurrentList(): ChecklistData | null {
    return this.currentListSubject.value;
  }

  // Actualiza la lista y marca cambios sin guardar
  private updateList(list: ChecklistData): void {
    list.modifiedDate = new Date().toISOString();
    this.currentListSubject.next({ ...list });
    this.setUnsavedChanges(true);

    // Auto-guardar en localStorage para persistencia
    this.storageService.saveCurrentProgress(list);
  }

  // Carga el progreso guardado
  private loadCurrentProgress(): void {
    const savedData = this.storageService.loadCurrentProgress();
    if (savedData) {
      // Verificar y corregir IDs duplicados antes de cargar
      this.ensureUniqueIds(savedData);
      this.currentListSubject.next(savedData);
      this.setUnsavedChanges(false);
    }
  }

  // Actualiza el estado de cambios sin guardar
  private setUnsavedChanges(hasChanges: boolean): void {
    this.hasUnsavedChangesSubject.next(hasChanges);
  }

  // Método público para marcar cambios sin guardar (usado por componentes)
  markAsUnsaved(): void {
    this.setUnsavedChanges(true);
  }

  // Obtiene el progreso actual de la lista
  getProgress(): { completed: number; total: number; percentage: number } {
    const currentList = this.getCurrentList();
    if (!currentList) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = currentList.tasks.length;
    const completed = currentList.tasks.filter((task) => task.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }
}
