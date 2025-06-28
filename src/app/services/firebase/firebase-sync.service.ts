import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseStorageService } from './firebase-storage.service';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseSyncService {
  private syncSubscription?: Subscription;
  private lastSyncTimestamp = 0;
  private isInitialized = false;

  constructor(
    private authService: FirebaseAuthService,
    private firebaseStorage: FirebaseStorageService,
    private localStorage: StorageService
  ) {}

  /**
   * Inicializa la sincronización automática
   * Se debe llamar desde app.component o app.config
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // Escuchar cambios en el estado de autenticación
    this.authService.user$.subscribe((user) => {
      if (user?.isLinked) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    });
  }

  /**
   * Inicia la sincronización automática cada 5 segundos
   */
  private startAutoSync(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }

    // Sincronizar inmediatamente
    this.performSync();

    // Luego sincronizar cada 5 segundos
    this.syncSubscription = interval(5000).subscribe(() => {
      this.performSync();
    });

    console.log('🔄 Sincronización automática iniciada');
  }

  /**
   * Detiene la sincronización automática
   */
  private stopAutoSync(): void {
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
      this.syncSubscription = undefined;
    }
    console.log('⏹️ Sincronización automática detenida');
  }

  /**
   * Realiza una sincronización completa si detecta cambios
   */
  private async performSync(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.isLinked) return;

    try {
      // 1. Sincronizar progreso actual si hay cambios
      await this.syncCurrentProgress();

      // 2. Sincronizar listas guardadas si hay cambios
      await this.syncSavedLists();
    } catch (error) {
      console.warn('⚠️ Error en sincronización automática:', error);
    }
  }

  /**
   * Sincroniza el progreso actual si ha cambiado
   */
  private async syncCurrentProgress(): Promise<void> {
    const currentProgress = this.localStorage.loadCurrentProgress();
    if (!currentProgress) return;

    // Verificar si ha cambiado desde la última sincronización
    const currentTimestamp = new Date(currentProgress.modifiedDate).getTime();
    if (currentTimestamp <= this.lastSyncTimestamp) return;

    try {
      await this.firebaseStorage.saveCurrentProgress(currentProgress);
      console.log('✅ Progreso sincronizado automáticamente');
    } catch (error) {
      console.warn('⚠️ Error sincronizando progreso:', error);
    }
  }

  /**
   * Sincroniza todas las listas guardadas que han cambiado
   */
  private async syncSavedLists(): Promise<void> {
    const savedLists = this.localStorage.getSavedLists();

    for (const listRef of savedLists) {
      const listData = await this.localStorage.loadList(listRef.id);
      if (!listData) continue;

      // Verificar si ha cambiado desde la última sincronización
      const listTimestamp = new Date(listData.modifiedDate).getTime();
      if (listTimestamp <= this.lastSyncTimestamp) continue;

      try {
        await this.firebaseStorage.saveList(listData);
        console.log(`✅ Lista "${listData.name}" sincronizada automáticamente`);
      } catch (error) {
        console.warn(`⚠️ Error sincronizando lista "${listData.name}":`, error);
      }
    }

    // Actualizar timestamp de última sincronización
    this.lastSyncTimestamp = Date.now();
  }

  /**
   * Fuerza una sincronización completa inmediata
   */
  async forceSyncAll(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.isLinked) {
      console.warn('Usuario no está vinculado a Firebase');
      return;
    }

    try {
      console.log('🔄 Iniciando sincronización forzada...');

      // Sincronizar progreso actual
      const currentProgress = this.localStorage.loadCurrentProgress();
      if (currentProgress) {
        await this.firebaseStorage.saveCurrentProgress(currentProgress);
      }

      // Sincronizar todas las listas
      const savedLists = this.localStorage.getSavedLists();
      for (const listRef of savedLists) {
        const listData = await this.localStorage.loadList(listRef.id);
        if (listData) {
          await this.firebaseStorage.saveList(listData);
        }
      }

      this.lastSyncTimestamp = Date.now();
      console.log('✅ Sincronización forzada completada');
    } catch (error) {
      console.error('❌ Error en sincronización forzada:', error);
      throw error;
    }
  }

  /**
   * Sincroniza desde Firebase hacia localStorage (útil para multi-dispositivo)
   */
  async syncFromFirebase(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.isLinked) return;

    try {
      console.log('📥 Sincronizando desde Firebase...');

      // Sincronizar progreso actual desde Firebase
      const firebaseProgress = await this.firebaseStorage.loadCurrentProgress();
      if (firebaseProgress) {
        const localProgress = this.localStorage.loadCurrentProgress();

        // Usar el más reciente
        if (
          !localProgress ||
          new Date(firebaseProgress.modifiedDate) >
            new Date(localProgress.modifiedDate)
        ) {
          this.localStorage.saveCurrentProgress(firebaseProgress);
          console.log('✅ Progreso actualizado desde Firebase');
        }
      }

      // Sincronizar listas desde Firebase
      const firebaseLists = await this.firebaseStorage.getSavedLists();
      for (const listRef of firebaseLists) {
        const firebaseList = await this.firebaseStorage.loadList(listRef.id);
        if (!firebaseList) continue;

        const localList = await this.localStorage.loadList(listRef.id);

        // Usar el más reciente
        if (
          !localList ||
          new Date(firebaseList.modifiedDate) > new Date(localList.modifiedDate)
        ) {
          this.localStorage.saveList(firebaseList);
          console.log(
            `✅ Lista "${firebaseList.name}" actualizada desde Firebase`
          );
        }
      }

      console.log('✅ Sincronización desde Firebase completada');
    } catch (error) {
      console.error('❌ Error sincronizando desde Firebase:', error);
    }
  }

  /**
   * Limpia los recursos de sincronización
   */
  destroy(): void {
    this.stopAutoSync();
    this.isInitialized = false;
  }
}
