import { Injectable } from '@angular/core';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.config';
import { ChecklistData, SavedList } from '../../models/task.interface';
import { FirebaseAuthService } from './firebase-auth.service';
import { ToastService } from '../toast.service';
import { FirestoreChecklistData } from './firebase.interfaces';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  constructor(
    private auth: FirebaseAuthService,
    private toastService: ToastService
  ) {}

  /**
   * Guarda una lista en Firebase únicamente
   */
  async saveList(listData: ChecklistData): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user?.isLinked) {
      throw new Error('Usuario no autenticado con Firebase');
    }

    try {
      const firestoreData = this.convertToFirestoreFormat(listData);
      await setDoc(
        doc(db, `users/${user.uid}/lists/${listData.id}`),
        firestoreData
      );
      console.log('✅ Lista guardada en Firebase');
    } catch (error) {
      console.error('Error guardando en Firebase:', error);
      throw error;
    }
  }

  /**
   * Carga una lista específica por ID desde Firebase únicamente
   */
  async loadList(listId: string): Promise<ChecklistData | null> {
    const user = this.auth.getCurrentUser();

    if (!user?.isLinked) {
      throw new Error('Usuario no autenticado con Firebase');
    }

    try {
      const docRef = doc(db, `users/${user.uid}/lists/${listId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreChecklistData;
        return this.convertFromFirestoreFormat(data);
      }

      return null;
    } catch (error) {
      console.error('Error cargando desde Firebase:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de todas las listas guardadas desde Firebase únicamente
   */
  async getSavedLists(): Promise<SavedList[]> {
    const user = this.auth.getCurrentUser();

    if (!user?.isLinked) {
      throw new Error('Usuario no autenticado con Firebase');
    }

    try {
      // Consulta simplificada sin índices compuestos
      const q = query(
        collection(db, `users/${user.uid}/lists`),
        orderBy('modifiedDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const firebaseLists = snapshot.docs
        .filter((doc) => {
          const data = doc.data() as FirestoreChecklistData;
          // Filtrar en el cliente las listas archivadas
          return !data.isArchived;
        })
        .map((doc) => {
          const data = doc.data() as FirestoreChecklistData;
          return this.convertToSavedListFormat(data);
        });

      return firebaseLists;
    } catch (error) {
      console.error('Error cargando desde Firebase:', error);
      throw error;
    }
  }

  /**
   * Elimina una lista de Firebase únicamente
   */
  async deleteList(listId: string): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user?.isLinked) {
      throw new Error('Usuario no autenticado con Firebase');
    }

    try {
      await deleteDoc(doc(db, `users/${user.uid}/lists/${listId}`));
      console.log('✅ Lista eliminada de Firebase');
    } catch (error) {
      console.error('Error eliminando de Firebase:', error);
      throw error;
    }
  }

  /**
   * Guarda los datos de la lista actual en Firebase
   */
  async saveCurrentProgress(listData: ChecklistData): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const firestoreData = this.convertToFirestoreFormat(listData);
      await setDoc(
        doc(db, `users/${user.uid}/data/currentProgress`),
        firestoreData
      );
      console.log('✅ Progreso actual guardado en Firebase');
    } catch (error) {
      console.error('Error guardando progreso actual:', error);
      throw error;
    }
  }

  /**
   * Carga los datos de la lista actual desde Firebase
   */
  async loadCurrentProgress(): Promise<ChecklistData | null> {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      const docRef = doc(db, `users/${user.uid}/data/currentProgress`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreChecklistData;
        return this.convertFromFirestoreFormat(data);
      }

      return null;
    } catch (error) {
      console.error('Error cargando progreso actual:', error);
      return null;
    }
  }

  /**
   * Elimina el progreso actual de Firebase
   */
  async clearCurrentProgress(): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await deleteDoc(doc(db, `users/${user.uid}/data/currentProgress`));
      console.log('✅ Progreso actual eliminado de Firebase');
    } catch (error) {
      console.error('Error eliminando progreso actual:', error);
      throw error;
    }
  }

  /**
   * Convierte datos de ChecklistData a formato Firestore
   */
  private convertToFirestoreFormat(
    listData: ChecklistData
  ): FirestoreChecklistData {
    return {
      ...listData,
      lastSyncAt: Timestamp.now(),
      syncVersion: Date.now(),
      deviceId: this.generateDeviceId(),
      isArchived: false,
      stats: this.calculateStats(listData),
      searchableFields: this.generateSearchFields(listData),
      tags: this.extractTags(listData),
      hasDateTasks: listData.tasks.some((t) => t.dueDate),
      isPublicShared: false,
    };
  }

  /**
   * Convierte datos de Firestore de vuelta al formato ChecklistData original
   */
  private convertFromFirestoreFormat(
    firestoreData: FirestoreChecklistData
  ): ChecklistData {
    // Extraer solo los campos que pertenecen a ChecklistData
    const {
      lastSyncAt,
      syncVersion,
      deviceId,
      isArchived,
      stats,
      searchableFields,
      tags,
      hasDateTasks,
      isPublicShared,
      ...checklistData
    } = firestoreData;

    return checklistData as ChecklistData;
  }

  /**
   * Convierte datos de Firestore al formato SavedList
   */
  private convertToSavedListFormat(
    firestoreData: FirestoreChecklistData
  ): SavedList {
    const completedCount =
      firestoreData.stats?.completedTasks ||
      firestoreData.tasks.filter((t) => t.completed).length;

    return {
      id: firestoreData.id,
      name: firestoreData.name,
      tasksCount: firestoreData.tasks.length,
      completedCount,
      date: firestoreData.modifiedDate,
      preview: this.generatePreview(firestoreData),
      priority: firestoreData.priority,
    };
  }

  /**
   * Genera una vista previa del contenido de la lista
   */
  private generatePreview(listData: FirestoreChecklistData): string {
    const firstTasks = listData.tasks
      .slice(0, 3)
      .map((t) => t.name)
      .join(', ');
    return firstTasks.length > 100
      ? firstTasks.substring(0, 100) + '...'
      : firstTasks;
  }

  /**
   * Calcula estadísticas de la lista
   */
  private calculateStats(listData: ChecklistData) {
    const totalTasks = listData.tasks.length;
    const completedTasks = listData.tasks.filter((t) => t.completed).length;
    const totalSubtasks = listData.tasks.reduce(
      (sum, t) => sum + t.subtasks.length,
      0
    );
    const completedSubtasks = listData.tasks.reduce(
      (sum, t) => sum + t.subtasks.filter((st) => st.completed).length,
      0
    );
    const totalErrors = listData.tasks.reduce(
      (sum, t) => sum + t.errors.length,
      0
    );

    return {
      totalTasks,
      completedTasks,
      completionPercentage:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      hasOverdueTasks: listData.tasks.some(
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
  private generateSearchFields(listData: ChecklistData): string[] {
    const fields: string[] = [];
    if (listData.name) fields.push(listData.name.toLowerCase());
    if (listData.observations) fields.push(listData.observations.toLowerCase());
    listData.tasks?.forEach((task) => {
      if (task.name) fields.push(task.name.toLowerCase());
    });
    return [...new Set(fields)];
  }

  /**
   * Extrae hashtags del contenido
   */
  private extractTags(listData: ChecklistData): string[] {
    const content = `${listData.name || ''} ${
      listData.observations || ''
    } ${listData.tasks?.map((t) => t.name || '').join(' ')}`;
    const tags = content.match(/#\w+/g) || [];
    return tags.map((tag) => tag.toLowerCase());
  }

  /**
   * Genera o recupera un ID único del dispositivo
   */
  private generateDeviceId(): string {
    // Generar siempre un nuevo ID para Firebase
    return crypto.randomUUID();
  }
}
