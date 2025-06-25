# 📖 Documentación Técnica

> Arquitectura y APIs de Checklist Diario v2.0

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Angular CDK](https://img.shields.io/badge/Angular_CDK-19.2+-green.svg)](https://material.angular.io/cdk)

## 🏗️ Arquitectura v2.0

### Patrón Clean Architecture con CDK Integration

```
┌─────────────────────────────────────────────────┐
│                 COMPONENTS                      │
│  ├── pages/ (UI + Navigation + CDK)             │
│  └── shared/ (Reusable Components + CDK)        │
├─────────────────────────────────────────────────┤
│              CDK INTEGRATION                    │
│  ├── DragDropModule (Reordenamiento)           │
│  ├── Drag Handles (Elementos visuales)         │
│  ├── Drop Zones (Áreas de destino)             │
│  └── Animations (Transiciones suaves)          │
├─────────────────────────────────────────────────┤
│            NOTIFICATION SYSTEM                  │
│  ├── toast.service (Toast notifications)       │
│  ├── alert-modal.component (Modales)           │
│  └── visual-feedback.service (Estados)         │
├─────────────────────────────────────────────────┤
│            FUNCTION SERVICES v2.0               │
│  ├── duplicate-list.service                    │
│  ├── rename-list.service                       │
│  ├── delete-list.service                       │
│  ├── checklist-reorder.service (NEW)           │
│  ├── open-new-tab.service                      │
│  └── checklist-export.service (ENHANCED)       │
├─────────────────────────────────────────────────┤
│               CORE SERVICES                     │
│  ├── checklist.service (Enhanced)              │
│  ├── storage.service (Monitoring)              │
│  ├── uuid.service                              │
│  ├── theme.service (NEW)                       │
│  ├── toast.service (NEW)                       │
│  └── export-import.service (Enhanced)          │
├─────────────────────────────────────────────────┤
│               GUARDS & PROTECTION               │
│  ├── unsaved-changes.guard (NEW)               │
│  └── navigation-protection.service (NEW)       │
├─────────────────────────────────────────────────┤
│              STATE SERVICES                     │
│  ├── home-state.service (UI + Indicators)      │
│  ├── checklist-state.service (Enhanced)        │
│  └── new-list-state.service                    │
├─────────────────────────────────────────────────┤
│                  MODELS                         │
│  └── task.interface (Enhanced)                 │
├─────────────────────────────────────────────────┤
│               STORAGE v2.0                      │
│  ├── localStorage (Monitored)                  │
│  ├── storage-indicator.component (NEW)         │
│  └── storage-progress-indicator.component      │
└─────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto v2.0

```
src/app/
├── pages/                    # Páginas principales
│   ├── home/                # Lista de checklists + indicadores
│   ├── new-list/            # Creación con protección
│   └── checklist/           # Vista + CDK drag-drop
├── services/                # Lógica de negocio
│   ├── functions/           # Servicios modulares v2.0
│   │   ├── checklist/       # Funciones específicas de checklist
│   │   │   ├── checklist-reorder.service.ts (NEW)
│   │   │   ├── checklist-export.service.ts (ENHANCED)
│   │   │   ├── checklist-tasks.service.ts
│   │   │   ├── checklist-subtasks.service.ts
│   │   │   ├── checklist-errors.service.ts
│   │   │   ├── checklist-modals.service.ts
│   │   │   ├── checklist-team.service.ts
│   │   │   └── checklist-navigation.service.ts (ENHANCED)
│   │   └── home/            # Funciones de gestión de listas
│   │       ├── duplicate-list.service.ts
│   │       ├── rename-list.service.ts
│   │       ├── delete-list.service.ts
│   │       └── open-new-tab.service.ts
│   ├── export/              # Servicios de exportación v2.0
│   │   ├── pdf-export.service.ts (ENHANCED)
│   │   └── txt-export.service.ts (NEW)
│   ├── uuid.service.ts
│   ├── checklist.service.ts (ENHANCED)
│   ├── storage.service.ts (MONITORING)
│   ├── theme.service.ts (NEW)
│   ├── toast.service.ts (NEW)
│   └── export-import.service.ts (ENHANCED)
├── guards/                  # Protección de navegación (NEW)
│   └── unsaved-changes.guard.ts
├── shared/                  # Componentes reutilizables v2.0
│   ├── atomic/             # Componentes atómicos
│   │   ├── buttons/        # Botones con estados avanzados
│   │   ├── checkboxes/     # Checkboxes con CDK
│   │   ├── inputs/         # Inputs con validación
│   │   └── tooltip/        # Tooltips contextuales
│   ├── components/         # Componentes complejos v2.0
│   │   ├── alert-modal/    # Modales de alerta
│   │   ├── confirm-modal/  # Modales de confirmación
│   │   ├── reorder-modal/  # Modal de reordenamiento (NEW)
│   │   ├── toast/          # Toast notifications (NEW)
│   │   ├── storage-indicator/ (NEW)
│   │   ├── storage-progress-indicator/ (NEW)
│   │   ├── export-import-dropdown/ (ENHANCED)
│   │   ├── header/         # Header con tema (NEW)
│   │   ├── footer/         # Footer adaptativo (NEW)
│   │   └── task-item/      # Item con drag & drop (ENHANCED)
│   └── styles/             # Estilos globales v2.0
│       ├── animations.css  # Animaciones CDK (NEW)
│       ├── root.css        # Variables de tema (ENHANCED)
│       └── scrollbar.css   # Scrollbars personalizados
├── models/                 # Interfaces TypeScript v2.0
│   └── task.interface.ts   # Interfaces completas (ENHANCED)
└── main.ts
```

### Principios Arquitecturales v2.0

- **CDK Integration**: Drag & drop nativo con Angular CDK
- **Servicios Especializados**: Cada función con su servicio independiente
- **Notificaciones Centralizadas**: Sistema unificado de feedback
- **Protección de Datos**: Guards automáticos contra pérdida
- **Temas Dinámicos**: Sistema completo de design tokens
- **Monitoreo de Recursos**: Gestión inteligente de almacenamiento
- **Clean Architecture**: Dependencias hacia adentro con CDK
- **Reactive Programming**: RxJS + BehaviorSubjects avanzados
- **TypeScript Estricto**: Tipado completo con interfaces robustas

## 🔧 Servicios de Funciones v2.0

Los servicios siguen un patrón mejorado para operaciones específicas:

### Patrón Avanzado de Servicios de Funciones

```typescript
@Injectable({ providedIn: "root" })
export class [Function]Service {
  // Observables para UI
  showModal$: Observable<boolean>;
  isProcessing$: Observable<boolean>;

  // Notificaciones integradas
  constructor(private toastService: ToastService) {}

  // API principal mejorada
  request[Action](item: any): void;
  confirm[Action](): void;
  cancel[Action](): void;

  // Lógica interna con feedback
  private perform[Action](): void {
    // Operación + Notificación automática
    this.toastService.showAlert(message, type, duration);
  }
}
```

### Servicios Implementados v2.0

#### **ChecklistReorderService** ⭐ NEW

- **Modal de reordenamiento** con vista previa completa
- **CDK Drag & Drop** nativo con animaciones suaves
- **Reordenamiento de subtareas** inline con handles visuales
- **Persistencia automática** con notificaciones de confirmación
- **Estados visuales** durante el drag con feedback inmediato

#### **ToastService** ⭐ NEW

- **4 tipos de notificación**: Success, Warning, Danger, Info
- **Animaciones CSS** slide-in/slide-out personalizadas
- **Duración configurable** según importancia del mensaje
- **Posicionamiento inteligente** sin interferir con la UI
- **Queue management** para múltiples notificaciones

#### **ThemeService** ⭐ NEW

- **Detección automática** de preferencias del sistema
- **Persistencia local** de elección manual del usuario
- **Transiciones suaves** entre temas con CSS animations
- **Variables CSS** completas con design tokens
- **Assets dinámicos** (logos, iconos) según tema activo

#### **DuplicateListService** (ENHANCED)

- Modal con **vista previa** del nombre generado automáticamente
- Numeración inteligente con **regex avanzado**
- **Regeneración completa** de IDs únicos para tareas y subtareas
- **Reset automático** de estados completados
- **Notificaciones contextuales** con detalles de la operación

#### **RenameListService** (ENHANCED)

- **Validación en tiempo real** con colores de estado
- **Mensajes específicos** según tipo de error encontrado
- **Múltiples formas de cancelación** (Escape, click fuera, botón)
- **Feedback visual inmediato** durante la edición
- **Integración toast** para confirmaciones

#### **DeleteListService** (ENHANCED)

- **Eliminación masiva** con modo selección dedicado
- **Contadores dinámicos** en botones según cantidad
- **Confirmaciones específicas** adaptadas al contexto
- **Operaciones atómicas** con rollback automático
- **Notificaciones detalladas** de resultados

#### **ChecklistExportService** (ENHANCED)

- **Exportación PDF** con estilos profesionales de impresión
- **Exportación TXT** en múltiples formatos especializados
- **Vista previa** antes de exportar
- **Metadatos completos** con fecha y estadísticas
- **Manejo de errores** con notificaciones específicas

## 🎯 Sistema de Notificaciones v2.0

### Toast Notifications Centralizadas

```typescript
// Uso básico del ToastService
this.toastService.showAlert(
  'Operación completada exitosamente',
  'success',
  3000
);

// Contextos específicos
Success: Guardado, duplicado, exportación exitosa
Warning: Validaciones, almacenamiento alto, advertencias
Danger: Errores críticos, fallos de guardado, límites
Info: Auto-guardado, cambios aplicados, información
```

### Integración en Servicios

```typescript
@Injectable({ providedIn: "root" })
export class ExampleService {
  constructor(private toastService: ToastService) {}

  performOperation(): void {
    try {
      // Operación exitosa
      this.toastService.showAlert("✅ Operación exitosa", "success");
    } catch (error) {
      // Error con contexto
      this.toastService.showAlert("❌ Error: " + error.message, "danger", 5000);
    }
  }
}
```

## 🔄 Sistema CDK Drag & Drop

### Configuración de Módulos

```typescript
// Importación en componentes
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  imports: [DragDropModule],
  // ...
})
```

### Implementación en Templates

```html
<!-- Drag & Drop de Tareas -->
<div cdkDropList [cdkDropListData]="tasks" (cdkDropListDropped)="onTaskDrop($event)">
  <div cdkDrag *ngFor="let task of tasks; trackBy: trackByTaskId" class="task-item">
    <div cdkDragHandle class="drag-handle">
      <span class="material-icons-outlined">drag_indicator</span>
    </div>
    <!-- Contenido de la tarea -->
  </div>
</div>

<!-- Drag & Drop de Subtareas -->
<div cdkDropList [cdkDropListData]="task.subtasks" (cdkDropListDropped)="onSubtaskDrop($event)">
  <div cdkDrag *ngFor="let subtask of task.subtasks; trackBy: trackBySubtaskId" class="subtask-item">
    <!-- Contenido de subtarea -->
  </div>
</div>
```

### Manejo de Eventos

```typescript
// Reordenamiento de tareas
onTaskDrop(event: CdkDragDrop<Task[]>): void {
  moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
  this.reorderService.reorderTasks(this.tasks);
  this.toastService.showAlert('Orden actualizado', 'success');
}

// Reordenamiento de subtareas
onSubtaskDrop(event: CdkDragDrop<Subtask[]>): void {
  moveItemInArray(
    this.task.subtasks,
    event.previousIndex,
    event.currentIndex
  );
  this.subtasksReordered.emit({
    taskId: this.task.id,
    reorderedSubtasks: [...this.task.subtasks]
  });
}
```

### Estilos CDK Personalizados

```css
/* Estados de drag & drop */
.cdk-drag-preview {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  transform: rotate(2deg);
  z-index: 1000;
}

.cdk-drag-placeholder {
  opacity: 0.3;
  border: 2px dashed var(--color-border);
  transform: scale(0.95);
}

.cdk-drag-animating {
  transition: transform 150ms cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Handles de drag */
.drag-handle {
  cursor: grab;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.drag-handle:hover {
  opacity: 1;
  color: var(--color-text-primary);
}

.drag-handle:active {
  cursor: grabbing;
}
```

## 📊 Sistema de Monitoreo v2.0

### Storage Service con Monitoreo

```typescript
@Injectable({ providedIn: "root" })
export class StorageService {
  private readonly MAX_STORAGE_SIZE = 3.5 * 1024 * 1024; // 3.5MB

  // Información de almacenamiento en tiempo real
  getStorageInfo(): StorageInfo {
    const percentage = this.getStoragePercentage();
    return {
      percentage,
      isNearLimit: percentage > 80,
      isFull: percentage >= 100,
      formattedSize: this.formatBytes(this.calculateStorageSize()),
      level: this.getStorageLevel(percentage),
    };
  }

  // Alertas automáticas
  checkAndAlertStorageLimits(): void {
    const percentage = this.getStoragePercentage();

    if (percentage >= 100) {
      this.toastService.showAlert(`¡Almacenamiento lleno! (${percentage.toFixed(1)}%)`, "danger", 5000);
    } else if (percentage >= 90) {
      this.toastService.showAlert(`¡Almacenamiento casi lleno! (${percentage.toFixed(1)}%)`, "danger", 4000);
    } else if (percentage >= 70) {
      this.toastService.showAlert(`Almacenamiento alto (${percentage.toFixed(1)}%)`, "warning", 3000);
    }
  }
}
```

### Componente de Indicador

```typescript
@Component({
  selector: "app-storage-indicator",
  template: `
    <div class="storage-indicator" [ngClass]="storageInfo.level">
      <div class="desktop-version">
        <span class="storage-text"> Almacenamiento: {{ storageInfo.percentage.toFixed(1) }}% </span>
        <div class="storage-progress">
          <div class="storage-progress-fill" [style.width.%]="storageInfo.percentage"></div>
        </div>
      </div>
      <div class="mobile-version">
        <span class="material-icons-outlined">storage</span>
        <div class="storage-percentage">{{ storageInfo.percentage.toFixed(1) }}%</div>
      </div>
    </div>
  `,
})
export class StorageIndicatorComponent implements OnInit, OnDestroy {
  // Actualización cada 5 segundos
  ngOnInit(): void {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateStorageInfo());
  }
}
```

## 🛡️ Sistema de Protección v2.0

### Unsaved Changes Guard

```typescript
@Injectable({ providedIn: "root" })
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Promise<boolean> {
    if (component.canDeactivate) {
      return component.canDeactivate();
    }
    return true; // Cada componente maneja sus confirmaciones
  }
}

// Implementación en componentes
export class ChecklistComponent implements CanComponentDeactivate {
  canDeactivate(): boolean | Promise<boolean> {
    if (this.hasUnsavedChanges) {
      return this.navigationService.confirmNavigation();
    }
    return true;
  }
}
```

### Navigation Protection Service

```typescript
@Injectable({ providedIn: "root" })
export class ChecklistNavigationService {
  // Confirmación inteligente según destino
  confirmStartNewList(): void {
    this.checklistService.hasUnsavedChanges$.pipe(first()).subscribe((hasChanges) => {
      if (hasChanges) {
        this.showConfirmationModal({
          title: "Cambios sin guardar",
          message: "¿Quieres guardar antes de comenzar una nueva lista?",
          confirmText: "Guardar y nueva lista",
          cancelText: "Nueva lista sin guardar",
        });
      } else {
        this.navigateToNewList();
      }
    });
  }

  // Auto-guardado inteligente
  saveProgressDirectly(currentList: ChecklistData | null): boolean {
    if (!currentList?.name) return false;

    const saved = this.checklistService.saveList(currentList.name);
    if (saved) {
      this.toastService.showAlert("Lista actualizada", "success", 2000);
    }
    return saved;
  }
}
```

## 🎨 Sistema de Temas v2.0

### Theme Service Completo

```typescript
@Injectable({ providedIn: "root" })
export class ThemeService {
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      this.setTheme(savedTheme === "dark");
    } else {
      // Usar tema claro por defecto
      this.setTheme(false);
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkThemeSubject.value;
    this.setTheme(newTheme);
  }

  setTheme(isDark: boolean): void {
    this.isDarkThemeSubject.next(isDark);

    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }
}
```

### Variables CSS Avanzadas

```css
/* Variables base - Tema Claro */
:root {
  /* Colores principales - Paleta Teal Elegante */
  --primary-500: #14b8a6;
  --primary-600: #0d9488;

  /* Sistema de colores semánticos */
  --color-background: #ffffff;
  --color-surface: #fafafa;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #171717;
  --color-text-secondary: #525252;

  /* Sombras muy tenues */
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04);
}

/* Variables - Tema Oscuro */
[data-theme="dark"] {
  --color-background: #0f0f0f;
  --color-surface: #171717;
  --color-surface-elevated: #262626;
  --color-text-primary: #fafafa;
  --color-text-secondary: #d4d4d4;

  /* Sombras para tema oscuro */
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.2);
}
```

## 🔄 Flujo de Datos v2.0

### Arquitectura de Eventos Mejorada

```typescript
// Component → Function Service → Core Service → Storage → Toast
component.ts → function.service → core.service → storage.service → toast.service
           ↓
      CDK Drag Event
           ↓
    Visual Feedback + Animation
           ↓
    State Update + Notification
```

### Estado Reactivo Avanzado

```typescript
// Components con múltiples servicios integrados
export class Component implements OnInit, OnDestroy {
  // Servicios de funciones con notificaciones
  reorderModal$ = this.reorderService.showReorderModal$;
  storageInfo$ = this.storageService.getStorageInfo$;
  isDarkTheme$ = this.themeService.isDarkTheme$;

  ngOnInit() {
    // Suscripciones con cleanup automático
    this.reorderService.operationCompleted$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.stateService.refreshData();
      this.toastService.showAlert("Orden actualizado", "success");
    });
  }
}
```

## 📊 Modelos de Datos v2.0

### Interfaces Principales Mejoradas

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
  name: string; // Cambio: description → name para consistencia
}

// Nuevas interfaces v2.0
interface StorageInfo {
  percentage: number;
  isNearLimit: boolean;
  isFull: boolean;
  formattedSize: string;
  level: "safe" | "warning" | "danger";
}

interface ToastData {
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  duration?: number;
}

interface ReorderModalData {
  title: string;
  tasks: Task[];
  listId: string;
}
```

## 🎨 Componentes y UI v2.0

### Componentes Principales Mejorados

#### **TaskItemComponent** (ENHANCED)

- **CDK Drag & Drop** para subtareas con handles visuales
- **Tracking personalizado** para evitar errores de IDs duplicados
- **Eventos granulares** para todas las operaciones
- **Estados visuales** mejorados para completed/pending
- **Responsive** con adaptación móvil/desktop

#### **ReorderModalComponent** ⭐ NEW

- **Modal dedicado** para reordenamiento de tareas
- **CDK Drop List** con animaciones suaves
- **Vista detallada** de cada tarea con subtareas y errores
- **Drag handles** visuales con estados hover/active
- **Confirmación/cancelación** con preview de cambios

#### **StorageIndicatorComponent** ⭐ NEW

- **Indicador fijo** en esquina superior derecha
- **Estados visuales** con colores dinámicos
- **Responsive** con versión móvil compacta
- **Actualización automática** cada 5 segundos
- **Animaciones** smooth para cambios de estado

#### **ToastComponent** ⭐ NEW

- **4 tipos de estado** con colores específicos
- **Animaciones CSS** slide-in/slide-out
- **Auto-dismiss** con duración configurable
- **Posicionamiento inteligente** sin bloquear UI
- **Stack management** para múltiples toasts

#### **HeaderComponent & FooterComponent** ⭐ NEW

- **Toggle de tema** integrado con estados visuales
- **Assets dinámicos** que cambian según tema activo
- **Logos responsivos** con SVGs optimizados
- **Animaciones** de transición suaves

### Componentes Atómicos Avanzados

#### **ButtonComponent** (ENHANCED)

- **12 variantes**: primary, secondary, danger, success, warning, outline-\*, ghost, icon, text, subtle, link
- **5 tamaños**: xs, sm, md, lg, xl
- **Estados avanzados**: loading, disabled, active
- **Iconos** left/right con Material Icons
- **Clases CSS** modulares y extensibles

#### **InputComponent** (ENHANCED)

- **Validación en tiempo real** con estados visuales
- **Textarea support** con rows configurables
- **Tamaños** y variantes múltiples
- **Estados de error** con mensajes contextuales
- **Integración** con formularios reactivos

## 🚀 Mejoras de Performance v2.0

### CDK Optimizations

- **Virtual Scrolling**: Para listas grandes (preparado para futuro)
- **Drag Optimizations**: Configuraciones específicas para performance
- **Animation Controls**: Smooth animations sin afectar performance
- **Memory Management**: Cleanup automático de listeners CDK

### Servicios Independientes Mejorados

- **Lazy Service Loading**: Servicios se activan solo cuando se necesitan
- **Advanced Memory Management**: Cleanup automático con takeUntil patterns
- **Operaciones Atómicas**: Rollback automático en caso de error
- **Error Boundaries**: Fallos aislados con notificaciones específicas

### UI Optimizada v2.0

- **Cards uniformes**: Altura consistente con contenido dinámico
- **Modal Management**: Creación/destrucción eficiente de modales
- **Event Batching**: Múltiples operaciones agrupadas
- **State Minimal**: Solo se actualiza lo estrictamente necesario
- **CDK Animations**: Transiciones hardware-accelerated

### Algoritmos Eficientes v2.0

- **Numeración inteligente**: Regex optimizado para nombres únicos
- **UUID Generation**: Optimizado con performance nativa
- **Drag Tracking**: Sistema robusto para evitar re-renders
- **Validaciones async**: En tiempo real sin bloqueos de UI
- **Storage Compression**: Optimización de datos en localStorage

## 🔧 Herramientas de Desarrollo v2.0

### Testing con CDK

```typescript
// Testing de drag & drop
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TestBed } from "@angular/core/testing";

describe("TaskItemComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DragDropModule],
      // ...
    });
  });

  it("should handle subtask reordering", () => {
    // Test drag & drop functionality
  });
});
```

### Debugging Avanzado

- **CDK Debug**: Herramientas específicas para drag & drop
- **Toast Debugging**: Console logs para notificaciones en desarrollo
- **Storage Monitoring**: Métricas detalladas de uso de almacenamiento
- **Theme Testing**: Switching automático para testing visual
- **Error Boundaries**: Captura y reporte de errores específicos por servicio

### Performance Monitoring

```typescript
// Ejemplo de monitoring en servicios
@Injectable({ providedIn: "root" })
export class PerformanceService {
  trackDragOperation(startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    if (duration > 100) {
      // > 100ms
      console.warn(`Slow drag operation: ${duration}ms`);
    }
  }
}
```

---

**📖 Documentación Técnica v2.0 - Checklist Diario con Angular 19+, TypeScript 5.7+ y Angular CDK 19+**
