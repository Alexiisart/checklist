# 📖 Documentación Técnica

> Arquitectura y APIs de Checklist Diario

[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)

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
│  └── theme.service                 │
├─────────────────────────────────────┤
│           MODELS                    │
│  └── task.interface                │
├─────────────────────────────────────┤
│           STORAGE                   │
│  └── localStorage                  │
└─────────────────────────────────────┘
```

### Principios

- **Standalone Components**: Sin NgModules
- **Reactive Programming**: RxJS + BehaviorSubjects
- **Clean Code**: Separación de responsabilidades
- **TypeScript**: Tipado estricto

## 🔧 Servicios Principales

### ChecklistService

```typescript
@Injectable({ providedIn: "root" })
export class ChecklistService {
  // Estado reactivo
  currentList$: Observable<ChecklistData | null>;
  hasUnsavedChanges$: Observable<boolean>;

  // Operaciones CRUD
  createNewList(taskNames: string[]): ChecklistData;
  loadList(listId: string): ChecklistData | null;
  saveList(name: string): boolean;

  // Gestión de tareas
  toggleTask(taskId: number, completed: boolean): void;
  addSubtask(taskId: number, name: string): void;
  addError(taskId: number, description: string): void;
}
```

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
  id: number;
  name: string;
  completed: boolean;
  subtasks: Subtask[];
  errors: TaskError[];
}

interface Subtask {
  id: number;
  name: string;
  completed: boolean;
}

interface TaskError {
  id: number;
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

### TaskItemComponent

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
  @Output() errorAdded = new EventEmitter<{ taskId: number; description: string }>();
}
```

## 🔒 Guards

### UnsavedChangesGuard

```typescript
@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<any> {
  canDeactivate(): Observable<boolean> {
    return this.checklistService.hasUnsavedChanges$.pipe(map((hasChanges) => !hasChanges || confirm("¿Salir sin guardar?")));
  }
}
```

## 🚀 Optimizaciones

### Lazy Loading

```typescript
const routes: Routes = [
  { path: "", loadComponent: () => import("./pages/home/home.component") },
  { path: "new-list", loadComponent: () => import("./pages/new-list/new-list.component") },
  { path: "checklist/:id", loadComponent: () => import("./pages/checklist/checklist.component") },
];
```

### Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizedComponent {
  constructor(private cdr: ChangeDetectorRef) {}
}
```

## 📦 Build y Deployment

### Configuración

```json
{
  "build": {
    "optimization": true,
    "sourceMap": false,
    "namedChunks": false,
    "extractLicenses": true,
    "vendorChunk": false,
    "buildOptimizer": true
  }
}
```

### Métricas

- **Bundle size**: ~150KB gzipped
- **First Paint**: <1s
- **Lighthouse Score**: 95+ Performance

---

**Para más detalles sobre implementación específica, consulta el código fuente.**
