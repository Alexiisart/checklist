# 📖 Documentación Técnica - Checklist Diario

## 🏗️ Arquitectura del Sistema

### Patrón de Diseño Principal

La aplicación sigue el patrón **Angular Standalone Components** con arquitectura modular:

```
┌─────────────────────────────────────────┐
│              Presentation Layer          │
├─────────────────────────────────────────┤
│ Components (Pages & Shared)             │
│ ├── home.component                      │
│ ├── new-list.component                  │
│ ├── checklist.component                 │
│ └── shared/                             │
│     ├── header.component                │
│     ├── modal.component                 │
│     ├── alert-modal.component           │
│     ├── confirm-modal.component         │
│     └── task-item.component             │
├─────────────────────────────────────────┤
│              Business Logic Layer        │
├─────────────────────────────────────────┤
│ Services                                │
│ ├── checklist.service                   │
│ ├── storage.service                     │
│ ├── theme.service                       │
│ └── pdf-export.service                  │
├─────────────────────────────────────────┤
│              Data Layer                  │
├─────────────────────────────────────────┤
│ Models & Interfaces                     │
│ └── task.interface                      │
├─────────────────────────────────────────┤
│              Storage Layer               │
├─────────────────────────────────────────┤
│ LocalStorage (Browser API)              │
└─────────────────────────────────────────┘
```

## 🔧 Servicios Principales

### ChecklistService

**Responsabilidades:**

- Estado global de la aplicación
- Lógica de negocio de tareas
- Operaciones CRUD
- Auto-guardado

**API Pública:**

```typescript
interface ChecklistService {
  // Observables de estado
  currentList$: Observable<ChecklistData | null>;
  hasUnsavedChanges$: Observable<boolean>;

  // Gestión de listas
  createNewList(taskNames: string[]): ChecklistData;
  loadCurrentProgress(): void;
  clearCurrentList(): void;

  // Operaciones de tareas
  toggleTask(taskId: string): void;
  addSubtask(taskId: string, subtaskText: string): void;
  addError(taskId: string, errorText: string): void;
  editTask(taskId: string, newText: string): void;
  deleteTask(taskId: string): void;

  // Observaciones
  updateObservations(observations: string): void;

  // Persistencia
  saveProgress(): void;
  saveList(listName: string): string;
}
```

### StorageService

**Responsabilidades:**

- Interfaz con localStorage
- Gestión de límites de almacenamiento
- Serialización/deserialización
- Generación de IDs únicos

**Funciones Principales:**

```typescript
/**
 * Guarda los datos del checklist actual
 * @param data - Datos del checklist a guardar
 */
saveChecklistData(data: ChecklistData): void

/**
 * Carga los datos del checklist actual
 * @returns Datos del checklist o null si no existe
 */
loadChecklistData(): ChecklistData | null

/**
 * Guarda una lista nombrada permanentemente
 * @param id - ID único de la lista
 * @param data - Datos de la lista
 * @param name - Nombre de la lista
 */
saveNamedList(id: string, data: ChecklistData, name: string): void

/**
 * Calcula el uso actual del almacenamiento
 * @returns Porcentaje de uso (0-100)
 */
getStorageUsage(): number
```

### ThemeService

**Responsabilidades:**

- Gestión del tema claro/oscuro
- Persistencia de preferencias
- Detección de tema del sistema

```typescript
/**
 * Inicializa el servicio de temas
 * Detecta preferencias del usuario o del sistema
 */
initializeTheme(): void

/**
 * Cambia entre tema claro y oscuro
 */
toggleTheme(): void

/**
 * Establece un tema específico
 * @param theme - 'light' o 'dark'
 */
setTheme(theme: 'light' | 'dark'): void
```

### PdfExportService

**Responsabilidades:**

- Generación de PDF para impresión
- Formateo del contenido
- Estilos de impresión

```typescript
/**
 * Exporta el checklist actual a PDF
 * @param data - Datos del checklist
 * @param listName - Nombre del checklist
 */
exportToPdf(data: ChecklistData, listName?: string): void
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
