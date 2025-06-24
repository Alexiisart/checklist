# 📖 Documentación Técnica

> Arquitectura y APIs de Checklist Diario v1.1

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## 🏗️ Arquitectura

### Patrón Clean Architecture

```
┌─────────────────────────────────────┐
│           COMPONENTS                │
│  ├── pages/                         │
│  └── shared/                        │
├─────────────────────────────────────┤
│           SERVICES                  │
│  ├── checklist.service             │
│  ├── storage.service               │
│  ├── uuid.service                  │ ⬅️ NUEVO v1.1
│  └── theme.service                 │
├─────────────────────────────────────┤
│           MODELS                    │
│  └── task.interface                │
├─────────────────────────────────────┤
│           STORAGE                   │
│  └── localStorage                  │
└─────────────────────────────────────┘
```

## 📁 Estructura

```
src/app/
├── pages/           # Páginas principales
│   ├── home/        # Lista de checklists
│   ├── new-list/    # Creación de lista
│   └── checklist/   # Vista del checklist
├── services/        # Lógica de negocio
│   ├── uuid.service.ts       # ⬅️ NUEVO: Generación UUID
│   ├── checklist.service.ts  # ⬅️ MEJORADO: IDs únicos
│   └── storage.service.ts
├── shared/          # Componentes reutilizables
├── models/          # Interfaces TypeScript
└── guards/          # Protección de rutas
```

### Principios

- **Standalone Components**: Sin NgModules
- **Reactive Programming**: RxJS + BehaviorSubjects
- **Clean Code**: Separación de responsabilidades
- **TypeScript**: Tipado estricto
- **UUID Strategy**: Identificadores únicos garantizados

## 🔧 Servicios Principales

### 🆕 UuidService (v1.1)

```typescript
@Injectable({ providedIn: "root" })
export class UuidService {
  // Generación UUID nativa con fallback
  generateUniqueId(): string;
  generateNumericId(): number;

  // Gestión de cache para optimización
  clearUsedIdsCache(): void;
  getStats(): { totalGenerated: number; cacheSize: number };

  private generateUUIDFallback(): string; // RFC 4122 compatible
}
```

**Características:**

- ✅ Usa `crypto.randomUUID()` cuando está disponible
- ✅ Fallback robusto para navegadores legacy
- ✅ Garantía de unicidad absoluta
- ✅ Compatible con IDs numéricos existentes

### ChecklistService (Mejorado v1.1)

```typescript
@Injectable({ providedIn: "root" })
export class ChecklistService {
  // Estado reactivo
  currentList$: Observable<ChecklistData | null>;
  hasUnsavedChanges$: Observable<boolean>;

  // ⬅️ MEJORADO: Operaciones CRUD con IDs únicos
  createNewList(taskNames: string[]): ChecklistData;
  loadList(listId: string): ChecklistData | null;
  saveList(name: string): boolean;

  // ⬅️ MEJORADO: Gestión de tareas con UUID
  toggleTask(taskId: number, completed: boolean): void;
  addSubtask(taskId: number, name: string): void;
  addError(taskId: number, description: string): void;

  // ⬅️ NUEVO: Corrección de IDs duplicados
  public ensureUniqueIds(listData: ChecklistData): void;

  // ⬅️ MEJORADO: Gestión correcta de tareas duplicadas
  updateTasks(newTasksString: string): void;

  private generateUniqueId(): number; // Usando UuidService
}
```

**Mejoras v1.1:**

- 🔧 **Algoritmo UUID**: Generación de IDs verdaderamente únicos
- 🛠️ **Corrección automática**: `ensureUniqueIds()` repara listas corruptas
- 📋 **Tareas duplicadas**: `updateTasks()` maneja correctamente nombres repetidos
- ⚡ **Performance**: Eliminación de bucles redundantes

### StorageService

```typescript
@Injectable({ providedIn: "root" })
export class StorageService {
  // Almacenamiento local
  saveChecklistData(data: ChecklistData): void;
  loadChecklistData(): ChecklistData | null;

  // Listas guardadas
  saveNamedList(data: ChecklistData, name: string): string;
  loadNamedList(listId: string): ChecklistData | null;
  getAllSavedLists(): SavedListInfo[];

  // Gestión de espacio
  getStorageUsage(): StorageInfo;
  cleanupOldData(): void;
}
```

## 📊 Modelos de Datos

### Interfaces Principales

```typescript
interface ChecklistData {
  id: string;
  name?: string;
  tasks: Task[];
  observations: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: number; // ⬅️ MEJORADO: UUID-based único
  name: string;
  completed: boolean;
  subtasks: Subtask[];
  errors: TaskError[];
}

interface Subtask {
  id: number; // ⬅️ MEJORADO: UUID-based único
  name: string;
  completed: boolean;
}

interface TaskError {
  id: number; // ⬅️ MEJORADO: UUID-based único
  description: string;
}
```

## 🔄 Flujo de Datos

### Estado Reactivo

```typescript
// ChecklistService maneja el estado global
private currentListSubject = new BehaviorSubject<ChecklistData | null>(null);
currentList$ = this.currentListSubject.asObservable();

// Componentes se suscriben al estado
this.checklistService.currentList$.subscribe(list => {
  this.currentList = list;
  this.updateProgress();
});
```

### Auto-guardado

```typescript
// Intervalo de 15 segundos
setInterval(() => {
  if (this.hasUnsavedChanges && this.currentList?.name) {
    this.saveList(this.currentList.name);
  }
}, 15000);
```

## 🎨 Sistema de Temas

### CSS Variables

```css
:root {
  --primary-600: #3b82f6;
  --neutral-50: #f9fafb;
  --neutral-900: #111827;
}

[data-theme="dark"] {
  --primary-600: #60a5fa;
  --neutral-50: #1f2937;
  --neutral-900: #f9fafb;
}
```

### ThemeService

```typescript
@Injectable({ providedIn: "root" })
export class ThemeService {
  private currentTheme = new BehaviorSubject<"light" | "dark">("light");

  toggleTheme(): void;
  setTheme(theme: "light" | "dark"): void;
  detectSystemTheme(): "light" | "dark";
}
```

## 📱 Componentes Clave

### TaskItemComponent (Mejorado v1.1)

```typescript
@Component({
  selector: "app-task-item",
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() taskToggled = new EventEmitter<{ taskId: number; completed: boolean }>();
  @Output() subtaskAdded = new EventEmitter<{ taskId: number; name: string }>();

  // ⬅️ NUEVO: Tracking personalizado para evitar NG0955
  trackBySubtaskId(index: number, subtask: Subtask): string | number;
  trackByErrorId(index: number, error: TaskError): string | number;
}
```

### ChecklistComponent (Mejorado v1.1)

```typescript
@Component({
  selector: "app-checklist",
  standalone: true,
})
export class ChecklistComponent {
  // ⬅️ NUEVO: Tracking personalizado para tareas
  trackByTaskId(index: number, task: any): string | number;
}
```

## 🆕 Resolución de Problemas (v1.1)

### Error NG0955 - IDs Duplicados

**Problema:** Angular detectaba claves duplicadas en tracking de listas.

**Solución implementada:**

```typescript
// Funciones de tracking robustas
trackByTaskId(index: number, task: any): string | number {
  if (!task || (!task.id && task.id !== 0)) {
    console.warn('Tarea sin ID válido detectada en índice:', index, task);
    return `fallback-task-${index}`;
  }
  return task.id;
}
```

### Tareas Duplicadas en updateTasks

**Problema:** Tareas con mismo nombre reutilizaban subtareas de la primera instancia.

**Solución implementada:**

```typescript
updateTasks(newTasksString: string): void {
  const availableTasks = [...currentList.tasks];

  newTaskNames.forEach((name) => {
    const existingTaskIndex = availableTasks.findIndex((t) => t.name === name);

    if (existingTaskIndex !== -1) {
      // Usar tarea existente y removerla de disponibles
      const existingTask = availableTasks.splice(existingTaskIndex, 1)[0];
      updatedTasks.push(existingTask);
    } else {
      // Crear nueva tarea con ID único
      updatedTasks.push({
        id: this.generateUniqueId(),
        name,
        completed: false,
        subtasks: [],
        errors: [],
      });
    }
  });
}
```

## 🚀 Mejoras de Performance

### Generación de IDs Optimizada

- **UUID nativo**: Usa `crypto.randomUUID()` cuando está disponible
- **Fallback robusto**: RFC 4122 compatible para navegadores legacy
- **Cache interno**: Evita duplicados mediante `Set<string>`
- **Limpieza automática**: Gestión de memoria optimizada

### Tracking Mejorado

- **Fallbacks únicos**: Template strings para casos edge
- **Verificación temprana**: Detección de IDs inválidos
- **Logging diagnóstico**: Facilita debugging en desarrollo

---

**Documentación para Checklist Diario v1.1 - Angular 19+ y TypeScript 5.7+**
