import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Task,
  Subtask,
  TaskError,
  ChecklistData,
} from '../models/task.interface';
import { StorageService } from './storage.service';

/**
 * Servicio para gestionar las listas de verificación (checklists)
 * Maneja la creación, actualización y eliminación de tareas y subtareas
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  /** Subject que mantiene la lista actual */
  private currentListSubject = new BehaviorSubject<ChecklistData | null>(null);
  /** Observable público de la lista actual */
  public currentList$ = this.currentListSubject.asObservable();

  /** Subject que indica si hay cambios sin guardar */
  private hasUnsavedChangesSubject = new BehaviorSubject<boolean>(false);
  /** Observable público de cambios sin guardar */
  public hasUnsavedChanges$ = this.hasUnsavedChangesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadCurrentProgress();
  }

  /**
   * Crea una nueva lista de verificación
   * @param taskNames Array de nombres de tareas
   * @returns Nueva lista de verificación
   */
  createNewList(taskNames: string[]): ChecklistData {
    const tasks: Task[] = taskNames.map((name, index) => ({
      id: Date.now() + index,
      name: name.trim(),
      completed: false,
      subtasks: [],
      errors: [],
    }));

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

  /**
   * Carga una lista existente
   * @param listId ID de la lista a cargar
   * @returns Lista cargada o null si no existe
   */
  loadList(listId: string): ChecklistData | null {
    const listData = this.storageService.loadList(listId);
    if (listData) {
      this.currentListSubject.next(listData);
      this.setUnsavedChanges(false);
    }
    return listData;
  }

  /**
   * Marca o desmarca una tarea como completada
   * @param taskId ID de la tarea
   * @param completed Estado de completado
   */
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

  /**
   * Marca o desmarca una subtarea como completada
   * @param taskId ID de la tarea principal
   * @param subtaskId ID de la subtarea
   * @param completed Estado de completado
   */
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

  /**
   * Agrega una nueva subtarea a una tarea
   * @param taskId ID de la tarea principal
   * @param name Nombre de la subtarea (puede incluir múltiples separadas por +)
   */
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

      subtasks.forEach((subtaskName, index) => {
        const newSubtask: Subtask = {
          id: Date.now() + index,
          name: subtaskName,
          completed: false,
        };
        task.subtasks.push(newSubtask);
      });

      this.updateList(currentList);
    }
  }

  /**
   * Elimina una subtarea
   * @param taskId ID de la tarea principal
   * @param subtaskId ID de la subtarea a eliminar
   */
  removeSubtask(taskId: number, subtaskId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
      this.updateList(currentList);
    }
  }

  /**
   * Actualiza el nombre de una subtarea
   * @param taskId ID de la tarea principal
   * @param subtaskId ID de la subtarea
   * @param newName Nuevo nombre
   */
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

  /**
   * Agrega un error a una tarea
   * @param taskId ID de la tarea
   * @param description Descripción del error
   */
  addError(taskId: number, description: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      const newError: TaskError = {
        id: Date.now(),
        name: description.trim(),
      };
      task.errors.push(newError);
      this.updateList(currentList);
    }
  }

  /**
   * Elimina un error de una tarea
   * @param taskId ID de la tarea
   * @param errorId ID del error a eliminar
   */
  removeError(taskId: number, errorId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.errors = task.errors.filter((e) => e.id !== errorId);
      this.updateList(currentList);
    }
  }

  /**
   * Actualiza la descripción de un error
   * @param taskId ID de la tarea
   * @param errorId ID del error
   * @param newDescription Nueva descripción
   */
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

  /**
   * Actualiza el nombre de una tarea
   * @param taskId ID de la tarea
   * @param newName Nuevo nombre
   */
  updateTask(taskId: number, newName: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const task = currentList.tasks.find((t) => t.id === taskId);
    if (task) {
      task.name = newName.trim();
      this.updateList(currentList);
    }
  }

  /**
   * Elimina una tarea
   * @param taskId ID de la tarea a eliminar
   */
  deleteTask(taskId: number): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    currentList.tasks = currentList.tasks.filter((t) => t.id !== taskId);
    this.updateList(currentList);
  }

  /**
   * Actualiza la lista completa de tareas
   * @param newTasksString String con las tareas separadas por comas
   */
  updateTasks(newTasksString: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const newTaskNames = newTasksString
      .split(',')
      .map((task) => task.trim())
      .filter((task) => task);

    // Mantener datos existentes para tareas que no cambiaron
    const updatedTasks: Task[] = [];

    newTaskNames.forEach((name, index) => {
      const existingTask = currentList.tasks.find((t) => t.name === name);
      if (existingTask) {
        updatedTasks.push(existingTask);
      } else {
        updatedTasks.push({
          id: Date.now() + index,
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

  /**
   * Actualiza las observaciones de la lista
   * @param observations Nuevas observaciones
   */
  updateObservations(observations: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    currentList.observations = observations;
    this.updateList(currentList);
  }

  /**
   * Guarda la lista actual con un nombre (igual que saveListWithName del original)
   * @param name Nombre de la lista
   * @returns boolean indicando si se guardó exitosamente
   */
  saveList(name: string): boolean {
    // Validación de nombre vacío (igual que el original)
    if (!name.trim()) {
      // El toast se debe mostrar desde el componente que llama
      return false;
    }

    const currentList = this.getCurrentList();
    if (!currentList) return false;

    // Verificar límites antes de guardar (igual que el original)
    const canSave = this.storageService.checkStorageLimits();
    if (!canSave) {
      return false;
    }

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

  /**
   * Limpia la lista actual
   */
  clearAll(): void {
    this.currentListSubject.next(null);
    this.storageService.clearCurrentProgress();
    this.setUnsavedChanges(false);
  }

  /**
   * Obtiene la lista actual
   * @returns Lista actual o null si no hay ninguna
   */
  private getCurrentList(): ChecklistData | null {
    return this.currentListSubject.value;
  }

  /**
   * Actualiza la lista y marca cambios sin guardar
   * @param list Lista actualizada
   */
  private updateList(list: ChecklistData): void {
    list.modifiedDate = new Date().toISOString();
    this.currentListSubject.next({ ...list });
    this.setUnsavedChanges(true);

    // Auto-guardar en localStorage para persistencia
    this.storageService.saveCurrentProgress(list);
  }

  /**
   * Carga el progreso guardado
   */
  private loadCurrentProgress(): void {
    const savedData = this.storageService.loadCurrentProgress();
    if (savedData) {
      this.currentListSubject.next(savedData);
      this.setUnsavedChanges(false);
    }
  }

  /**
   * Actualiza el estado de cambios sin guardar
   * @param hasChanges true si hay cambios pendientes
   */
  private setUnsavedChanges(hasChanges: boolean): void {
    this.hasUnsavedChangesSubject.next(hasChanges);
  }

  /**
   * Obtiene el progreso actual de la lista
   * @returns Objeto con el total de tareas, completadas y porcentaje
   */
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
