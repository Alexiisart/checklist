import { Injectable } from '@angular/core';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase.config';
import { StorageService } from '../storage.service';
import { ChecklistData, Task } from '../../models/task.interface';
import { ToastService } from '../toast.service';
import { FirestoreChecklistData, UserPreferences } from './firebase.interfaces';

@Injectable({
  providedIn: 'root',
})
export class FirebaseMigrationService {
  constructor(
    private localStorageService: StorageService,
    private toastService: ToastService
  ) {}

  /**
   * Migra todos los datos de localStorage a Firebase
   */
  async migrateAllDataToFirebase(uid: string): Promise<void> {
    try {
      this.toastService.showAlert('🔄 Migrando datos a la nube...', 'info');

      // 1. Migrar progreso actual
      await this.migrateCurrentProgress(uid);

      // 2. Migrar todas las listas guardadas
      await this.migrateAllLists(uid);

      // 3. Migrar preferencias
      await this.migratePreferences(uid);

      // 4. Marcar migración completada
      await this.markMigrationCompleted(uid);

      this.toastService.showAlert(
        '✅ Todas tus listas están ahora en la nube',
        'success'
      );
    } catch (error) {
      console.error('Error en migración:', error);
      this.toastService.showAlert('❌ Error migrando datos', 'danger');
      throw error;
    }
  }

  /**
   * Migra el progreso actual a Firebase
   */
  private async migrateCurrentProgress(uid: string): Promise<void> {
    const currentData = this.localStorageService.loadCurrentProgress();
    if (currentData) {
      const firestoreData = {
        ...currentData,
        lastSyncAt: Timestamp.now(),
        deviceId: this.generateDeviceId(),
        isAutoSaved: true,
        syncVersion: Date.now(),
        hasUnsavedChanges: false,
      };

      await setDoc(doc(db, `users/${uid}/data/currentProgress`), firestoreData);
      console.log('✅ Progreso actual migrado');
    }
  }

  /**
   * Migra todas las listas guardadas a Firebase
   */
  private async migrateAllLists(uid: string): Promise<void> {
    const savedLists = this.localStorageService.getSavedLists();

    for (const listRef of savedLists) {
      const listData = await this.localStorageService.loadList(listRef.id);
      if (listData) {
        const firestoreList = this.convertToFirestoreFormat(listData);
        await setDoc(
          doc(db, `users/${uid}/lists/${listData.id}`),
          firestoreList
        );
        console.log(`✅ Lista "${listData.name}" migrada`);
      }
    }

    console.log(`✅ ${savedLists.length} listas migradas exitosamente`);
  }

  /**
   * Migra las preferencias de usuario a Firebase
   */
  private async migratePreferences(uid: string): Promise<void> {
    // Intentar cargar preferencias existentes del localStorage
    const localPrefs = this.loadLocalPreferences();

    const firestorePrefs: UserPreferences = {
      theme: localPrefs.theme || 'auto',
      language: localPrefs.language || 'es',
      autoSave: localPrefs.autoSave !== false,
      autoSync: true,
      notifications: localPrefs.notifications !== false,
      showCongratulations: localPrefs.showCongratulations !== false,
      defaultListName: localPrefs.defaultListName || 'Nueva Lista',
      taskCompletionSound: localPrefs.taskCompletionSound !== false,
      showStorageIndicator: localPrefs.showStorageIndicator !== false,
      showDatePickers: localPrefs.showDatePickers !== false,
      defaultExportFormat: localPrefs.defaultExportFormat || 'pdf',
      includeCompletedTasks: localPrefs.includeCompletedTasks !== false,
      includeDates: localPrefs.includeDates !== false,
      updatedAt: Timestamp.now(),
      version: '3.1.0',
      migratedFrom: 'localStorage',
    };

    await setDoc(doc(db, `users/${uid}/data/preferences`), firestorePrefs);
    console.log('✅ Preferencias migradas');
  }

  /**
   * Convierte datos de ChecklistData a formato Firestore
   */
  private convertToFirestoreFormat(
    listData: ChecklistData
  ): FirestoreChecklistData {
    const stats = this.calculateStats(listData.tasks);

    return {
      // Campos originales de ChecklistData
      ...listData,

      // Campos adicionales para Firestore
      lastSyncAt: Timestamp.now(),
      syncVersion: Date.now(),
      deviceId: this.generateDeviceId(),
      isArchived: false,
      stats,
      searchableFields: this.generateSearchFields(listData),
      tags: this.extractTags(listData),
      hasDateTasks: listData.tasks.some((t) => t.dueDate),
      isPublicShared: false,
    };
  }

  /**
   * Calcula estadísticas de una lista de tareas
   */
  private calculateStats(tasks: Task[]) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalSubtasks = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
    const completedSubtasks = tasks.reduce(
      (sum, t) => sum + t.subtasks.filter((st) => st.completed).length,
      0
    );
    const totalErrors = tasks.reduce((sum, t) => sum + t.errors.length, 0);

    return {
      totalTasks,
      completedTasks,
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      hasOverdueTasks: tasks.some(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
      ),
      lastActivityAt: new Date().toISOString(),
      totalSubtasks,
      completedSubtasks,
      totalErrors,
    };
  }

  /**
   * Genera campos de búsqueda para indexación
   */
  private generateSearchFields(list: ChecklistData): string[] {
    const fields: string[] = [];
    if (list.name) fields.push(list.name.toLowerCase());
    if (list.observations) fields.push(list.observations.toLowerCase());
    list.tasks?.forEach((task) => {
      if (task.name) fields.push(task.name.toLowerCase());
    });
    return [...new Set(fields)]; // Eliminar duplicados
  }

  /**
   * Extrae hashtags del contenido de la lista
   */
  private extractTags(list: ChecklistData): string[] {
    const content = `${list.name || ''} ${list.observations || ''} ${list.tasks
      ?.map((t) => t.name || '')
      .join(' ')}`;
    const tags = content.match(/#\w+/g) || [];
    return tags.map((tag) => tag.toLowerCase());
  }

  /**
   * Genera o recupera un ID único del dispositivo
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Marca la migración como completada
   */
  private async markMigrationCompleted(uid: string): Promise<void> {
    await setDoc(
      doc(db, `users/${uid}/data/profile`),
      {
        migrationCompleted: true,
        migrationCompletedAt: Timestamp.now(),
      },
      { merge: true }
    );
    console.log('✅ Migración marcada como completada');
  }

  /**
   * Carga preferencias locales del localStorage o devuelve valores por defecto
   */
  private loadLocalPreferences(): any {
    try {
      // Intentar cargar desde el método del StorageService si existe
      if (typeof this.localStorageService.loadUserPreferences === 'function') {
        return this.localStorageService.loadUserPreferences() || {};
      }

      // Fallback: cargar directamente desde localStorage
      const stored = localStorage.getItem('userPreferences');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error cargando preferencias locales:', error);
      return {};
    }
  }
}
