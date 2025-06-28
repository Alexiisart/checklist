import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import {
  UserAccount,
  UserProfile,
  UserPreferences,
} from './firebase.interfaces';
import { ToastService } from '../toast.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private userSubject = new BehaviorSubject<UserAccount | null>(null);
  public user$: Observable<UserAccount | null> =
    this.userSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.initializeAuth();
  }

  /**
   * Inicializa el listener de autenticación
   */
  private initializeAuth(): void {
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userAccount = await this.getUserProfile(user.uid);
          this.userSubject.next(userAccount);
        } catch (error) {
          console.error('Error obteniendo perfil de usuario:', error);
          // No crear usuarios temporales, solo mantener null hasta que el perfil esté listo
          this.userSubject.next(null);
        }
      } else {
        this.userSubject.next(null);
      }
    });
  }

  /**
   * Crea una nueva cuenta de usuario
   */
  async createAccount(
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Crear perfil de usuario en Firestore
      const userProfile: UserProfile = {
        username,
        displayName,
        email,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        isLinked: true,
        deviceCount: 1,
        migrationCompleted: false,
        plan: 'free',
        storageUsed: 0,
        listCount: 0,
        maxLists: 100,
      };

      await setDoc(doc(db, `users/${user.uid}/data/profile`), userProfile);

      // Crear preferencias por defecto
      const defaultPreferences: UserPreferences = {
        theme: 'auto',
        language: 'es',
        autoSave: true,
        autoSync: true,
        notifications: true,
        showCongratulations: true,
        defaultListName: 'Mi Lista',
        taskCompletionSound: true,
        showStorageIndicator: true,
        showDatePickers: true,
        defaultExportFormat: 'pdf',
        includeCompletedTasks: true,
        includeDates: true,
        updatedAt: Timestamp.now(),
        version: '3.1.0',
        migratedFrom: 'new',
      };

      await setDoc(
        doc(db, `users/${user.uid}/data/preferences`),
        defaultPreferences
      );

      // Establecer directamente el usuario después de crear el perfil
      const userAccount: UserAccount = {
        uid: user.uid,
        username,
        displayName,
        email,
        isLinked: true,
      };

      this.userSubject.next(userAccount);
    } catch (error: any) {
      console.error('Error creando cuenta:', error);
      throw new Error(
        `Error al crear la cuenta: ${error.message || 'Error desconocido'}`
      );
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string): Promise<UserAccount> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Actualizar último login
      await setDoc(
        doc(db, `users/${user.uid}/data/profile`),
        { lastLogin: Timestamp.now() },
        { merge: true }
      );

      const userAccount = await this.getUserProfile(user.uid);
      this.userSubject.next(userAccount);

      this.toastService.showAlert('✅ Sesión iniciada', 'success');
      return userAccount;
    } catch (error: any) {
      console.error('Error iniciando sesión:', error);
      this.toastService.showAlert(
        `❌ Error: ${this.getErrorMessage(error)}`,
        'danger'
      );
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.userSubject.next(null);
      this.toastService.showAlert('👋 Sesión cerrada', 'info');
    } catch (error: any) {
      console.error('Error cerrando sesión:', error);
      this.toastService.showAlert(
        `❌ Error: ${this.getErrorMessage(error)}`,
        'danger'
      );
    }
  }

  /**
   * Obtiene el perfil de usuario desde Firestore
   */
  private async getUserProfile(uid: string): Promise<UserAccount> {
    const profileDoc = await getDoc(doc(db, `users/${uid}/data/profile`));

    if (!profileDoc.exists()) {
      throw new Error('Perfil de usuario no encontrado');
    }

    const profile = profileDoc.data() as UserProfile;

    return {
      uid,
      username: profile.username || '',
      displayName: profile.displayName || '',
      email: profile.email || '',
      isLinked: true,
    };
  }

  /**
   * Crea preferencias por defecto para un nuevo usuario
   */
  private async createDefaultPreferences(uid: string): Promise<void> {
    const preferences: UserPreferences = {
      theme: 'auto',
      language: 'es',
      autoSave: true,
      autoSync: true,
      notifications: true,
      showCongratulations: true,
      defaultListName: 'Nueva Lista',
      taskCompletionSound: true,
      showStorageIndicator: true,
      showDatePickers: true,
      defaultExportFormat: 'pdf',
      includeCompletedTasks: true,
      includeDates: true,
      updatedAt: Timestamp.now(),
      version: '3.1.0',
      migratedFrom: 'new',
    };

    await setDoc(doc(db, `users/${uid}/data/preferences`), preferences);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): UserAccount | null {
    return this.userSubject.value;
  }

  /**
   * Verifica si el usuario está vinculado a Firebase
   */
  isLinked(): boolean {
    return !!this.getCurrentUser()?.isLinked;
  }

  /**
   * Convierte errores de Firebase a mensajes legibles
   */
  private getErrorMessage(error: any): string {
    const errorCode = error.code;

    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      default:
        return error.message || 'Error desconocido';
    }
  }
}
