import { Timestamp } from 'firebase/firestore';

/**
 * Interfaz para la cuenta de usuario en la aplicación
 */
export interface UserAccount {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  isLinked: boolean;
}

/**
 * Interfaz para el perfil de usuario en Firestore
 */
export interface UserProfile {
  username: string;
  displayName: string;
  email: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  isLinked: boolean;
  deviceCount: number;
  migrationCompleted: boolean;
  plan: 'free' | 'premium';
  storageUsed: number;
  listCount: number;
  maxLists: number;
}

/**
 * Interfaz para las preferencias de usuario en Firestore
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  autoSave: boolean;
  autoSync: boolean;
  notifications: boolean;
  showCongratulations: boolean;
  defaultListName: string;
  taskCompletionSound: boolean;
  showStorageIndicator: boolean;
  showDatePickers: boolean;
  defaultExportFormat: 'pdf' | 'txt';
  includeCompletedTasks: boolean;
  includeDates: boolean;
  updatedAt: Timestamp;
  version: string;
  migratedFrom: 'new' | 'localStorage';
}

/**
 * Interfaz para datos de lista en Firestore (extends ChecklistData)
 */
export interface FirestoreChecklistData {
  // Todos los campos de ChecklistData original
  id: string;
  name: string;
  observations: string;
  tasks: any[]; // Se usará Task[] del modelo existente
  createdDate: string;
  modifiedDate: string;
  team: any[]; // Se usará TeamMember[] del modelo existente
  priority?: boolean;
  sharedAt?: string;
  shareVersion?: string;

  // Campos adicionales para Firebase
  lastSyncAt: Timestamp;
  syncVersion: number;
  deviceId: string;
  isArchived: boolean;
  stats: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    hasOverdueTasks: boolean;
    lastActivityAt: string;
    totalSubtasks: number;
    completedSubtasks: number;
    totalErrors: number;
  };
  searchableFields: string[];
  tags: string[];
  hasDateTasks: boolean;
  isPublicShared: boolean;
}

/**
 * Interfaz para progreso actual en Firestore
 */
export interface FirestoreCurrentProgress extends FirestoreChecklistData {
  isAutoSaved: boolean;
  hasUnsavedChanges: boolean;
}

/**
 * Interfaz para actividad de usuario
 */
export interface UserActivity {
  action: 'create' | 'update' | 'delete' | 'complete';
  listId: string;
  listName: string;
  timestamp: Timestamp;
  deviceId: string;
  details: Record<string, any>;
}
