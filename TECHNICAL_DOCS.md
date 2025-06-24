# 📖 Documentación Técnica

> Arquitectura y APIs de Checklist Diario v1.2

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## 🏗️ Arquitectura

### Patrón Clean Architecture con Servicios Modulares

```
┌─────────────────────────────────────┐
│           COMPONENTS                │
│  ├── pages/                         │
│  │   ├── home/ (UI + Navigation)    │
│  │   ├── checklist/                 │
│  │   └── new-list/                  │
│  └── shared/                        │
├─────────────────────────────────────┤
│           FUNCTION SERVICES         │ ⬅️ NUEVO v1.2
│  ├── duplicate-list.service         │
│  ├── rename-list.service            │
│  └── delete-list.service            │
├─────────────────────────────────────┤
│           CORE SERVICES             │
│  ├── checklist.service             │
│  ├── storage.service               │
│  ├── uuid.service                  │
│  ├── theme.service                 │
│  └── export-import.service         │
├─────────────────────────────────────┤
│           STATE SERVICES            │
│  ├── home-state.service (UI only)  │ ⬅️ REFACTORIZADO v1.2
│  ├── checklist-state.service       │
│  └── new-list-state.service        │
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
│   ├── functions/   # ⬅️ NUEVO: Servicios modulares
│   │   ├── duplicate-list.service.ts
│   │   ├── rename-list.service.ts
│   │   └── delete-list.service.ts
│   ├── uuid.service.ts
│   ├── checklist.service.ts
│   └── storage.service.ts
├── shared/          # Componentes reutilizables
├── models/          # Interfaces TypeScript
└── guards/          # Protección de rutas
```

### Principios Arquitecturales v1.2

- **Servicios Independientes**: Cada función tiene su servicio especializado
- **Separación de Responsabilidades**: State services solo manejan UI
- **Modularidad**: Funciones pueden funcionar independientemente
- **Clean Architecture**: Dependencias van hacia adentro
- **Reactive Programming**: RxJS + BehaviorSubjects
- **TypeScript**: Tipado estricto con interfaces robustas

## 🔧 Servicios de Funciones (v1.2)

### 🆕 DuplicateListService

```typescript
@Injectable({ providedIn: "root" })
export class DuplicateListService {
  // Observables para UI
  showModal$: Observable<boolean>;
  listToDuplicate$: Observable<ChecklistData | null>;
  isProcessing$: Observable<boolean>;

  // API principal
  requestDuplicate(list: ChecklistData): void;
  confirmDuplicate(): void;
  cancelDuplicate(): void;

  // Lógica interna
  private duplicateList(originalList: ChecklistData): ChecklistData;
  private generateCopyName(originalName: string, existingNames: string[]): string;
  private resetTaskStates(task: Task): Task;
}
```

**Características:**

- ✅ Modal de confirmación antes de duplicar
- ✅ Numeración automática inteligente con regex
- ✅ IDs únicos para tareas y subtareas
- ✅ Reset automático de estados completados
- ✅ Limpieza de errores y observaciones

### 🆕 RenameListService

```typescript
@Injectable({ providedIn: "root" })
export class RenameListService {
  // Observables para UI
  showModal$: Observable<boolean>;
  listToRename$: Observable<ChecklistData | null>;
  isProcessing$: Observable<boolean>;
  currentName$: Observable<string>;
  error$: Observable<string | null>;

  // API principal
  requestRename(list: ChecklistData): void;
  updateName(newName: string): void;
  confirmRename(): void;
  cancelRename(): void;

  // Validación
  private validateName(name: string): string | null;
  private isNameUnique(name: string, currentId: string): boolean;
}
```

**Características:**

- ✅ Validación en tiempo real de nombres únicos
- ✅ Manejo robusto de errores con mensajes específicos
- ✅ Confirmación con Enter, cancelación con Escape
- ✅ Prevención de nombres duplicados
- ✅ Feedback visual inmediato

### 🆕 DeleteListService

```typescript
@Injectable({ providedIn: "root" })
export class DeleteListService {
  // Observables para UI
  showModal$: Observable<boolean>;
  itemsToDelete$: Observable<ChecklistData[]>;
  isProcessing$: Observable<boolean>;
  deleteType$: Observable<"single" | "multiple">;

  // API principal
  requestDelete(list: ChecklistData): void;
  requestDeleteMultiple(lists: ChecklistData[]): void;
  confirmDelete(): void;
  cancelDelete(): void;

  // Utilidades
  getDeleteMessage(): string;
  private performDeletion(itemsToDelete: ChecklistData[]): void;
}
```

**Características:**

- ✅ Eliminación individual y múltiple
- ✅ Confirmación específica según cantidad
- ✅ Conteo dinámico en mensajes
- ✅ Operaciones atómicas
- ✅ Feedback de resultados

## 🔄 Flujo de Datos v1.2

### Arquitectura de Eventos

```typescript
// Component → Function Service → Core Service → Storage
home.component.ts → duplicate-list.service → checklist.service → storage.service
                 ↓
                Modal UI + Confirmation
                 ↓
              State Update
```

### Estado Reactivo Mejorado

```typescript
// Home Component conecta con múltiples servicios
export class HomeComponent {
  // Servicios de funciones
  duplicateModal$ = this.duplicateService.showModal$;
  renameModal$ = this.renameService.showModal$;
  deleteModal$ = this.deleteService.showModal$;

  // Suscripciones a completados
  ngOnInit() {
    this.duplicateService.listDuplicated$.subscribe(() => {
      this.homeState.loadSavedLists();
    });
  }
}
```

### State Service Refactorizado

```typescript
// HomeStateService solo maneja UI y navegación
@Injectable({ providedIn: "root" })
export class HomeStateService {
  // Solo estado de UI
  private savedListsSubject = new BehaviorSubject<ChecklistData[]>([]);
  private selectedListsSubject = new BehaviorSubject<Set<string>>(new Set());
  private searchTermSubject = new BehaviorSubject<string>("");

  // Sin lógica de negocio
  loadSavedLists(): void;
  selectList(listId: string): void;
  deselectAllLists(): void;
  updateSearchTerm(term: string): void;
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
  id: number; // UUID-based único
  name: string;
  completed: boolean;
  subtasks: Subtask[];
  errors: TaskError[];
}

interface Subtask {
  id: number; // UUID-based único
  name: string;
  completed: boolean;
}

interface TaskError {
  id: number; // UUID-based único
  description: string;
}

// ⬅️ NUEVO v1.2: Estados de servicios
interface ServiceState<T> {
  showModal: boolean;
  isProcessing: boolean;
  currentItem: T | null;
  error: string | null;
}
```

## 🎨 Componentes y UI

### ListCardComponent (Actualizado v1.2)

```typescript
@Component({
  selector: "app-list-card",
  standalone: true,
})
export class ListCardComponent {
  @Input() list!: ChecklistData;
  @Output() select = new EventEmitter<string>();
  @Output() duplicate = new EventEmitter<ChecklistData>(); // ⬅️ NUEVO
  @Output() rename = new EventEmitter<ChecklistData>(); // ⬅️ ACTUALIZADO
  @Output() delete = new EventEmitter<ChecklistData>(); // ⬅️ ACTUALIZADO

  // Botones de acción consistentes
  onDuplicate(event: Event): void;
  onRename(event: Event): void;
  onDelete(event: Event): void;
}
```

### HomeComponent (Refactorizado v1.2)

```typescript
@Component({
  selector: "app-home",
  standalone: true,
})
export class HomeComponent {
  // Servicios de funciones independientes
  constructor(private homeState: HomeStateService, private duplicateService: DuplicateListService, private renameService: RenameListService, private deleteService: DeleteListService) {}

  // Métodos que llaman servicios directamente
  duplicateList(list: ChecklistData): void {
    this.duplicateService.requestDuplicate(list);
  }

  renameList(list: ChecklistData): void {
    this.renameService.requestRename(list);
  }

  deleteList(list: ChecklistData): void {
    this.deleteService.requestDelete(list);
  }
}
```

## 🚀 Mejoras de Performance v1.2

### Servicios Independientes

- **Carga bajo demanda**: Servicios solo se activan cuando se necesitan
- **Memory management**: Limpieza automática de subscripciones
- **Operaciones atómicas**: Cada servicio maneja su propio estado
- **Error boundaries**: Fallos aislados no afectan otros servicios

### UI Optimizada

- **Cards uniformes**: `grid-auto-rows: 1fr` para altura consistente
- **Lazy loading**: Modales se crean solo cuando se necesitan
- **Event batching**: Múltiples operaciones se agrupan eficientemente
- **State minimal**: Solo se actualiza lo necesario

### Algoritmos Mejorados

```typescript
// Numeración inteligente con regex
private generateCopyName(originalName: string, existingNames: string[]): string {
  const baseName = originalName.endsWith(' (Copia)')
    ? originalName
    : `${originalName} (Copia)`;

  const pattern = new RegExp(`^${this.escapeRegex(baseName)}( \\d+)?$`);
  const existingNumbers = existingNames
    .filter(name => pattern.test(name))
    .map(name => {
      const match = name.match(/\(Copia( (\d+))?\)$/);
      return match && match[2] ? parseInt(match[2]) : 1;
    })
    .sort((a, b) => a - b);

  // Encuentra el primer número disponible
  let nextNumber = 1;
  for (const num of existingNumbers) {
    if (num === nextNumber) {
      nextNumber++;
    } else {
      break;
    }
  }

  return nextNumber === 1 ? baseName : `${baseName} ${nextNumber}`;
}
```

## 🔧 Herramientas de Desarrollo

### Testing

```typescript
// Unit tests para servicios de funciones
describe("DuplicateListService", () => {
  it("should generate unique copy names", () => {
    const service = TestBed.inject(DuplicateListService);
    const result = service.generateCopyName("Mi Lista", ["Mi Lista (Copia)"]);
    expect(result).toBe("Mi Lista (Copia) 2");
  });
});
```

### Debugging

```typescript
// Logging estructurado
console.log("🔄 Duplicating list:", {
  original: originalList.name,
  generated: newName,
  tasksCount: originalList.tasks.length,
});
```

---

**Documentación para Checklist Diario v1.2 - Angular 19+ y TypeScript 5.7+**
