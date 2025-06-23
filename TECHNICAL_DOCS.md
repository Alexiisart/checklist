# 📖 Documentación Técnica - Checklist Diario

> Documentación técnica completa de la aplicación Angular para gestión de checklists

[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8+-purple.svg)](https://rxjs.dev/)
[![Standalone Components](https://img.shields.io/badge/Standalone%20Components-✓-green.svg)]()

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño Principal

La aplicación implementa **Clean Architecture** con **Angular Standalone Components** y separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│ Components (Pages & Shared)                                 │
│ ├── pages/                                                  │
│ │   ├── home.component          # Lista de checklists      │
│ │   ├── new-list.component      # Creación de listas       │
│ │   └── checklist.component     # Vista principal          │
│ └── shared/components/                                      │
│     ├── header.component        # Navegación global        │
│     ├── footer.component        # Información de pie       │
│     ├── modal.component         # Modal reutilizable       │
│     ├── task-item.component     # Item de tarea            │
│     └── toast.component         # Notificaciones           │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│ Services & State Management                                 │
│ ├── checklist.service          # Lógica de negocio        │
│ ├── checklist-state.service    # Estado del componente     │
│ ├── storage.service            # Persistencia de datos     │
│ ├── theme.service              # Gestión de temas          │
│ ├── pdf-export.service         # Exportación de archivos   │
│ └── toast.service              # Sistema notificaciones    │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                           │
├─────────────────────────────────────────────────────────────┤
│ Models & Interfaces                                         │
│ ├── task.interface             # Modelo de datos           │
│ ├── checklist.interface        # Estructura de checklist   │
│ └── types/                     # Tipos auxiliares          │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│ External Services & APIs                                    │
│ ├── LocalStorage               # Almacenamiento local       │
│ ├── jsPDF                      # Generación PDF             │
│ └── Browser APIs               # APIs nativas del navegador │
└─────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

#### 🎯 **Separation of Concerns**

- **Componentes**: Solo responsables de la UI y la interacción
- **Servicios**: Lógica de negocio e integración con APIs
- **Modelos**: Definición de estructuras de datos
- **Guards**: Protección de rutas y validaciones

#### 🔄 **Reactive Programming**

- **RxJS Observables**: Para gestión de estado asíncrono
- **BehaviorSubjects**: Para estado compartido entre componentes
- **Operators**: Para transformación y filtrado de datos

#### 📦 **Modular Architecture**

- **Standalone Components**: Eliminación de NgModules
- **Lazy Loading**: Carga bajo demanda de componentes
- **Tree Shaking**: Optimización automática del bundle

## 🔧 Servicios Principales

### ChecklistService

**Responsabilidades:**

- 🎯 Estado global de la aplicación
- 💼 Lógica de negocio de tareas
- 🔄 Operaciones CRUD completas
- 💾 Auto-guardado inteligente
- 📊 Cálculo de progreso en tiempo real

**API Pública:**

```typescript
@Injectable({
  providedIn: "root",
})
export class ChecklistService {
  // 📡 Observables de estado reactivo
  currentList$: Observable<ChecklistData | null>;
  hasUnsavedChanges$: Observable<boolean>;
  progress$: Observable<ProgressData>;

  // 🆕 Gestión de listas
  createNewList(taskNames: string[]): ChecklistData;
  loadCurrentProgress(): void;
  clearCurrentList(): void;
  loadListById(listId: string): ChecklistData | null;

  // ✅ Operaciones de tareas
  toggleTask(taskId: string): void;
  addTask(taskName: string): void;
  editTask(taskId: string, newText: string): void;
  deleteTask(taskId: string): void;
  reorderTasks(oldIndex: number, newIndex: number): void;

  // 📋 Gestión de subtareas
  addSubtask(taskId: string, subtaskText: string): void;
  toggleSubtask(taskId: string, subtaskId: string): void;
  editSubtask(taskId: string, subtaskId: string, newText: string): void;
  deleteSubtask(taskId: string, subtaskId: string): void;

  // 🚨 Gestión de errores
  addError(taskId: string, errorText: string): void;
  editError(taskId: string, errorId: string, newText: string): void;
  deleteError(taskId: string, errorId: string): void;

  // 📝 Observaciones
  updateObservations(observations: string): void;

  // 💾 Persistencia
  saveProgress(): void;
  saveList(listName: string): string;
  exportToJSON(): string;
  importFromJSON(jsonData: string): boolean;
}

// 📊 Interfaces de datos
interface ChecklistData {
  id: string;
  name?: string;
  tasks: Task[];
  observations: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    totalTasks: number;
    completedTasks: number;
    totalSubtasks: number;
    completedSubtasks: number;
    errorCount: number;
  };
}

interface Task {
  id: string;
  name: string;
  completed: boolean;
  subtasks: Subtask[];
  errors: TaskError[];
  createdAt: Date;
  updatedAt: Date;
}
```

### StorageService

**Responsabilidades:**

- 🗄️ Interfaz robusta con localStorage
- 📊 Gestión inteligente de límites de almacenamiento
- 🔄 Serialización/deserialización segura
- 🆔 Generación de IDs únicos
- 🛡️ Validación y migración de datos

**API Completa:**

```typescript
@Injectable({
  providedIn: "root",
})
export class StorageService {
  // 🔧 Configuración
  private readonly STORAGE_KEYS = {
    CURRENT_LIST: "checklist_data",
    SAVED_LISTS_INDEX: "saved_lists",
    THEME_PREFERENCE: "theme_preference",
    APP_CONFIG: "app_config",
  } as const;

  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly WARNING_THRESHOLD = 0.8; // 80%

  // 📋 Gestión de checklist actual
  saveChecklistData(data: ChecklistData): void;
  loadChecklistData(): ChecklistData | null;
  clearChecklistData(): void;
  hasCurrentChecklist(): boolean;

  // 🗂️ Gestión de listas guardadas
  saveNamedList(data: ChecklistData, name: string): string;
  loadNamedList(listId: string): ChecklistData | null;
  deleteNamedList(listId: string): boolean;
  getAllSavedLists(): SavedListSummary[];
  updateListMetadata(listId: string, updates: Partial<ListMetadata>): void;

  // 📊 Análisis de almacenamiento
  getStorageUsage(): StorageUsageInfo;
  isStorageNearLimit(): boolean;
  getStorageStats(): StorageStats;
  cleanupOldData(maxAge: number): number; // Retorna items eliminados

  // 🔧 Utilidades
  generateUniqueId(): string;
  exportAllData(): string;
  importAllData(jsonData: string): ImportResult;
  validateStorageIntegrity(): ValidationResult;
  migrateDataIfNeeded(): MigrationResult;

  // 🛡️ Manejo de errores
  isStorageAvailable(): boolean;
  handleStorageError(error: Error): void;
  getStorageErrorInfo(): StorageErrorInfo | null;
}

// 📊 Interfaces de datos
interface StorageUsageInfo {
  used: number; // Bytes utilizados
  total: number; // Límite total
  percentage: number; // Porcentaje de uso
  isNearLimit: boolean;
  remainingSpace: number;
}

interface SavedListSummary {
  id: string;
  name: string;
  taskCount: number;
  completedCount: number;
  errorCount: number;
  createdAt: Date;
  updatedAt: Date;
  size: number; // Tamaño en bytes
}

interface ImportResult {
  success: boolean;
  importedLists: number;
  skippedLists: number;
  errors: string[];
}
```

### ThemeService

**Responsabilidades:**

- 🎨 Gestión completa del tema claro/oscuro
- 💾 Persistencia de preferencias del usuario
- 🔍 Detección automática del tema del sistema
- 🔄 Sincronización con cambios del sistema
- ⚡ Aplicación instantánea de temas

```typescript
@Injectable({
  providedIn: "root",
})
export class ThemeService {
  // 📡 Estado reactivo del tema
  currentTheme$: Observable<ThemeType>;
  isSystemTheme$: Observable<boolean>;

  /**
   * 🚀 Inicializa el servicio de temas
   * Detecta preferencias del usuario o del sistema
   */
  initializeTheme(): void;

  /**
   * 🔄 Cambia entre tema claro y oscuro
   */
  toggleTheme(): void;

  /**
   * 🎨 Establece un tema específico
   * @param theme - 'light' | 'dark' | 'system'
   */
  setTheme(theme: ThemeType): void;

  /**
   * 🔍 Obtiene el tema actual
   * @returns Tema activo actual
   */
  getCurrentTheme(): ThemeType;

  /**
   * 🌟 Detecta si el sistema soporta tema oscuro
   */
  isSystemDarkModeSupported(): boolean;

  /**
   * 👁️ Observa cambios en el tema del sistema
   */
  watchSystemThemeChanges(): Observable<boolean>;

  /**
   * 🧩 Aplica el tema al DOM
   * @param theme - Tema a aplicar
   */
  private applyThemeToDOM(theme: ThemeType): void;
}

// 🎨 Tipos de tema
type ThemeType = "light" | "dark" | "system";

interface ThemeConfig {
  type: ThemeType;
  appliedTheme: "light" | "dark";
  isSystemDefault: boolean;
  timestamp: Date;
}
```

### PdfExportService

**Responsabilidades:**

- 📄 Generación profesional de PDF para impresión
- 🎨 Formateo avanzado del contenido
- 📊 Estilos optimizados para impresión
- 📈 Inclusión de gráficos de progreso
- 🔧 Configuración personalizable

```typescript
@Injectable({
  providedIn: "root",
})
export class PdfExportService {
  /**
   * 📄 Exporta el checklist actual a PDF
   * @param data - Datos del checklist
   * @param options - Opciones de exportación
   */
  exportToPdf(data: ChecklistData, options?: PdfExportOptions): void;

  /**
   * 🎨 Genera vista previa del PDF
   * @param data - Datos del checklist
   * @returns URL de la vista previa
   */
  generatePreview(data: ChecklistData): string;

  /**
   * ⚙️ Configura opciones por defecto
   * @param options - Nuevas opciones por defecto
   */
  setDefaultOptions(options: Partial<PdfExportOptions>): void;
}

interface PdfExportOptions {
  fileName?: string;
  includeProgress: boolean;
  includeObservations: boolean;
  includeErrors: boolean;
  pageFormat: "A4" | "Letter";
  orientation: "portrait" | "landscape";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### ToastService

**Responsabilidades:**

- 🔔 Sistema de notificaciones no intrusivas
- 🎯 Diferentes tipos de mensajes (éxito, error, info, warning)
- ⏰ Gestión automática de tiempo de vida
- 📱 Soporte para múltiples notificaciones
- 🎨 Animaciones suaves

```typescript
@Injectable({
  providedIn: "root",
})
export class ToastService {
  // 📡 Observable de notificaciones activas
  toasts$: Observable<Toast[]>;

  /**
   * ✅ Muestra notificación de éxito
   */
  showSuccess(message: string, options?: ToastOptions): void;

  /**
   * ❌ Muestra notificación de error
   */
  showError(message: string, options?: ToastOptions): void;

  /**
   * ℹ️ Muestra notificación informativa
   */
  showInfo(message: string, options?: ToastOptions): void;

  /**
   * ⚠️ Muestra notificación de advertencia
   */
  showWarning(message: string, options?: ToastOptions): void;

  /**
   * 🗑️ Elimina una notificación específica
   */
  dismissToast(toastId: string): void;

  /**
   * 🧹 Limpia todas las notificaciones
   */
  clearAll(): void;
}
```

## 📱 Componentes de UI

### Componentes de Página

#### HomeComponent

- **Propósito**: Lista de checklists guardados
- **Características**:
  - Grid responsive de cards
  - Indicador de almacenamiento
  - Acciones de carga/eliminación
  - Estado vacío

#### NewListComponent

- **Propósito**: Creación de nuevas listas
- **Características**:
  - Input de tareas separadas por comas
  - Validación en tiempo real
  - Ejemplos de uso
  - Navegación automática

#### ChecklistComponent

- **Propósito**: Vista principal del checklist
- **Características**:
  - Indicador de progreso animado
  - Lista de tareas interactiva
  - Área de observaciones
  - Botones de acción (PDF, guardar, limpiar)

### Componentes Compartidos

#### TaskItemComponent

- **Propósito**: Componente individual de tarea
- **Funcionalidades**:
  - Checkbox de completado
  - Botones de acción (editar, eliminar, agregar subtarea/error)
  - Lista de subtareas
  - Lista de errores
  - Modales integrados

#### Modal Components

- **ModalComponent**: Modal genérico reutilizable
- **ConfirmModalComponent**: Modal de confirmación
- **AlertModalComponent**: Modal de alertas con tipos

## 🎨 Sistema de Diseño

### Tokens de Diseño

#### Colores

```css
/* Paleta principal */
--primary-500: #0ea5e9    /* Color principal */
--primary-600: #0284c7    /* Hover states */
--primary-700: #0369a1    /* Active states */

/* Neutros */
--neutral-50: #fafafa     /* Fondos claros */
--neutral-100: #f5f5f5    /* Hover backgrounds */
--neutral-200: #e5e5e5    /* Bordes */
--neutral-500: #737373    /* Texto secundario */
--neutral-900: #171717    /* Texto principal */

/* Semánticos */
--color-success: #10b981  /* Estados exitosos */
--color-warning: #f59e0b  /* Advertencias */
--color-error: #ef4444    /* Errores */
--color-info: #3b82f6     /* Información */
```

#### Espaciado

```css
--space-1: 0.25rem  /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
--space-10: 2.5rem  /* 40px */
```

#### Tipografía

```css
/* Fuente principal */
font-family: "Funnel Display", system-ui, sans-serif

/* Escalas de tamaño */
font-size: 0.75rem  /* 12px - Pequeño */
font-size: 0.875rem /* 14px - Base */
font-size: 1rem     /* 16px - Cuerpo */
font-size: 1.125rem /* 18px - Subtítulos */
font-size: 1.5rem   /* 24px - Títulos */
```

### Componentes de UI

#### Botones

```css
/* Botón primario */
.primary-btn {
  background: var(--primary-600);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estados de interacción */
.primary-btn:hover {
  background: var(--primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Inputs

```css
/* Input base */
input,
textarea {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estado de focus */
input:focus,
textarea:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

## 📦 Gestión de Estado

### Patrón Reactivo

La aplicación utiliza **RxJS BehaviorSubject** para la gestión de estado:

```typescript
// Estado central del checklist
private currentListSubject = new BehaviorSubject<ChecklistData | null>(null);
public currentList$ = this.currentListSubject.asObservable();

// Estado de cambios no guardados
private hasUnsavedChangesSubject = new BehaviorSubject<boolean>(false);
public hasUnsavedChanges$ = this.hasUnsavedChangesSubject.asObservable();
```

### Flujo de Datos

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User Action │───▶│   Service   │───▶│  Component  │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  │                   │
       │                  ▼                   │
       │           ┌─────────────┐            │
       └───────────│ Local Store │◀───────────┘
                   └─────────────┘
```

## 🔒 Persistencia de Datos

### Estructura LocalStorage

```typescript
// Clave principal del checklist actual
"checklist_data": {
  id: string;
  tasks: Task[];
  observations: string;
  createdAt: Date;
  updatedAt: Date;
}

// Índice de listas guardadas
"saved_lists": SavedList[]

// Listas individuales guardadas
"list_{id}": ChecklistData

// Configuración de tema
"theme": "light" | "dark"
```

### Gestión de Límites

```typescript
const STORAGE_LIMIT = 3.5 * 1024 * 1024; // 3.5MB

/**
 * Verifica si hay espacio suficiente antes de guardar
 * @param data - Datos a guardar
 * @returns true si hay espacio, false en caso contrario
 */
private checkStorageSpace(data: any): boolean {
  const serialized = JSON.stringify(data);
  const currentUsage = this.getStorageUsage();
  const newSize = new Blob([serialized]).size;

  return (currentUsage + newSize) < STORAGE_LIMIT;
}
```

## 🧪 Testing Strategy

### Pruebas Unitarias

```bash
# Ejecutar todas las pruebas
ng test

# Pruebas con coverage
ng test --code-coverage

# Pruebas en modo watch
ng test --watch
```

### Estructura de Pruebas

```
src/
├── app/
│   ├── services/
│   │   ├── checklist.service.spec.ts
│   │   ├── storage.service.spec.ts
│   │   └── theme.service.spec.ts
│   ├── components/
│   │   └── *.component.spec.ts
│   └── models/
│       └── *.interface.spec.ts
```

## 🚀 Optimizaciones de Performance

### Lazy Loading

```typescript
// Configuración de rutas con lazy loading
const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "new",
    loadComponent: () => import("./pages/new-list/new-list.component").then((m) => m.NewListComponent),
  },
  {
    path: "checklist",
    loadComponent: () => import("./pages/checklist/checklist.component").then((m) => m.ChecklistComponent),
  },
];
```

### OnPush Strategy

```typescript
@Component({
  selector: "app-task-item",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class TaskItemComponent {
  // Uso de OnPush para optimizar detección de cambios
}
```

### Debounce en Inputs

```typescript
// Auto-guardado con debounce
private setupAutoSave(): void {
  this.currentList$.pipe(
    debounceTime(2000),
    distinctUntilChanged(),
    filter(data => data !== null)
  ).subscribe(data => {
    this.storageService.saveChecklistData(data!);
  });
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 480px) {
  /* Mobile */
}
@media (max-width: 768px) {
  /* Tablet */
}
@media (max-width: 1024px) {
  /* Laptop */
}
@media (min-width: 1025px) {
  /* Desktop */
}
```

### Grid Adaptive

```css
.saved-lists-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .saved-lists-container {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
```

## 🔧 Configuración de Build

### Optimizaciones de Producción

```typescript
// angular.json
"build": {
  "optimization": true,
  "outputHashing": "all",
  "sourceMap": false,
  "namedChunks": false,
  "aot": true,
  "extractLicenses": true,
  "vendorChunk": false,
  "buildOptimizer": true
}
```

### Bundle Analysis

```bash
# Analizar el bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## 🛡️ Seguridad

### Sanitización de Datos

```typescript
// Sanitización automática en templates
{{ userInput | sanitizeHtml }}

// Validación de entrada
private validateInput(input: string): boolean {
  return input.length > 0 && input.length <= 500;
}
```

### CSP Headers

```html
<!-- Configuración de Content Security Policy -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com;" />
```

## 📊 Métricas y Monitoreo

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Bundle Size Targets

- **Main Bundle**: < 250KB (gzipped)
- **Vendor Bundle**: < 150KB (gzipped)
- **Runtime Bundle**: < 5KB (gzipped)

## 🔄 Ciclo de Desarrollo

### Comandos Principales

```bash
# Desarrollo
npm start              # Servidor de desarrollo
npm run build          # Build de producción
npm run test          # Pruebas unitarias
npm run lint          # Análisis de código
npm run e2e           # Pruebas end-to-end

# Calidad de código
npm run format        # Formatear código
npm run analyze       # Análisis de bundle
```

### Git Hooks

```bash
# Pre-commit
npm run lint && npm run test

# Pre-push
npm run build && npm run e2e
```

Esta documentación técnica proporciona una visión completa de la arquitectura, patrones de diseño, y mejores prácticas implementadas en la aplicación Checklist Diario.
