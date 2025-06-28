# 📖 Documentación Técnica

> Arquitectura y APIs de Checkliist v3.1

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Angular CDK](https://img.shields.io/badge/Angular_CDK-19.2+-green.svg)](https://material.angular.io/cdk)

## 🏗️ Arquitectura v3.1

### Patrón Clean Architecture con Shared Lists, Custom Icons & Enhanced Tracking

```
┌─────────────────────────────────────────────────┐
│                 COMPONENTS                      │
│  ├── pages/ (UI + Navigation + CDK + Dates)     │
│  └── shared/ (Reusable Components + CDK)        │
├─────────────────────────────────────────────────┤
│          SHARED LISTS SYSTEM v3.1               │ ⭐ NEW
│  ├── SharedListComparisonService (NEW)         │
│  ├── ListComparisonModal (NEW)                 │
│  ├── URL Generation (Enhanced)                 │
│  ├── Base64 Encoding (Enhanced)                │
│  └── Intelligent Comparison (Name Based)       │
├─────────────────────────────────────────────────┤
│          CUSTOM ICONS SYSTEM v3.1               │ ⭐ ENHANCED
│  ├── DateInputComponent (Custom Icons)         │
│  ├── Theme Adaptation (Auto Dark/Light)        │
│  ├── Cross-browser Consistency                 │
│  └── Material Icons Integration                │
├─────────────────────────────────────────────────┤
│          ENHANCED TRACKING v3.1                 │ ⭐ ENHANCED
│  ├── UuidService (Improved)                    │
│  ├── Universal TrackBy Functions               │
│  ├── Duplicate Prevention (NG0955)             │
│  └── Unique ID Generation (Index + Content)    │
├─────────────────────────────────────────────────┤
│            DATE MANAGEMENT SYSTEM               │
│  ├── DateManagerService (Centralized)          │
│  ├── DateInputComponent (Custom Icons)         │ ⭐ ENHANCED
│  ├── Due Date Logic (Business)                 │
│  ├── Local Timezone (Consistency)              │
│  └── Format Standardization (Display)          │
├─────────────────────────────────────────────────┤
│           OPTIMIZED NOTIFICATIONS v3.1          │ ⭐ ENHANCED
│  ├── toast.service (Smart Duplicates)          │
│  ├── alert-modal.component (Context Aware)     │
│  ├── Congratulations Control (No Repeats)      │
│  └── Contextual Feedback (Enhanced)            │
├─────────────────────────────────────────────────┤
│              CDK INTEGRATION                    │
│  ├── DragDropModule (Reordenamiento)           │
│  ├── Drag Handles (Elementos visuales)         │
│  ├── Drop Zones (Áreas de destino)             │
│  └── Animations (Transiciones suaves)          │
├─────────────────────────────────────────────────┤
│            FUNCTION SERVICES v3.1               │
│  ├── duplicate-list.service                    │
│  ├── rename-list.service                       │
│  ├── delete-list.service                       │
│  ├── checklist-reorder.service                 │
│  ├── open-new-tab.service                      │
│  ├── checklist-export.service (Date Enhanced)  │
│  ├── date-manager.service                      │
│  └── shared-list-comparison.service (NEW)      │ ⭐ NEW
├─────────────────────────────────────────────────┤
│               CORE SERVICES                     │
│  ├── checklist.service (Date Enhanced)         │
│  ├── storage.service (Monitoring)              │
│  ├── uuid.service (Enhanced Tracking)          │ ⭐ ENHANCED
│  ├── theme.service                             │
│  ├── toast.service (Smart Notifications)       │ ⭐ ENHANCED
│  └── export-import.service (Date Enhanced)     │
├─────────────────────────────────────────────────┤
│               GUARDS & PROTECTION               │
│  ├── unsaved-changes.guard                     │
│  └── navigation-protection.service             │
├─────────────────────────────────────────────────┤
│              STATE SERVICES                     │
│  ├── home-state.service (UI + Indicators)      │
│  ├── checklist-state.service (Enhanced)        │ ⭐ ENHANCED
│  └── new-list-state.service                    │
├─────────────────────────────────────────────────┤
│                  MODELS                         │
│  └── task.interface (Date Enhanced)            │
├─────────────────────────────────────────────────┤
│               STORAGE v3.1                      │
│  ├── localStorage (Monitored + Dates)          │
│  ├── storage-indicator.component               │
│  └── storage-progress-indicator.component      │
└─────────────────────────────────────────────────┘
```

## 🔗 Sistema de Listas Compartidas v3.1 ⭐ NEW

### Funcionalidades Principales

- **🔍 Detección automática**: Reconoce listas con el mismo nombre
- **📊 Comparación inteligente**: Modal que muestra opciones de actualización
- **🔄 Preservación de datos**: Mantiene información original al actualizar
- **📝 Decisión del usuario**: Elegir entre actualizar o crear copia nueva
- **🔒 URLs seguras**: Codificación Base64 para enlaces compartidos

### SharedListComparisonService - Gestión de Comparación

```typescript
@Injectable({ providedIn: "root" })
export class SharedListComparisonService {
  private comparisonModalSubject = new BehaviorSubject<ComparisonModalData>({
    show: false,
    sharedList: {} as ChecklistData,
    existingList: {} as ChecklistData,
  });

  // Busca lista existente por nombre (sin sufijo "Compartida")
  findExistingListByName(sharedList: ChecklistData): ChecklistData | null;

  // Muestra modal de comparación con opciones
  showComparisonModal(sharedList: ChecklistData, existingList: ChecklistData): void;

  // Control del modal
  closeComparisonModal(): void;
  getCurrentModalData(): ComparisonModalData;
}
```

### ComparisonModalData Interface

```typescript
export interface ComparisonModalData {
  show: boolean;
  sharedList: ChecklistData; // Lista entrante
  existingList: ChecklistData; // Lista local existente
}
```

## 📅 Iconos Personalizados v3.1 ⭐ ENHANCED

### DateInputComponent con Iconos Personalizados

- **🎨 Material Icons**: Icono `calendar_today` personalizado
- **🌙 Adaptación automática**: Cambio de color según tema
- **🔧 Cross-browser**: Funciona igual en todos los navegadores
- **🎯 UX mejorada**: Interfaz consistente sin depender del navegador

### Implementación CSS Avanzada

```css
/* Ocultar icono nativo del navegador */
.date-input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

.date-input::-moz-calendar-picker-indicator {
  display: none;
}

/* Icono personalizado */
.calendar-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.calendar-icon-btn:hover:not(:disabled) {
  color: var(--color-primary);
}
```

## 🔧 Sistema de Tracking Mejorado v3.1 ⭐ ENHANCED

### UuidService Optimizado

- **🎯 Prevención NG0955**: Elimina errores de tracking duplicado
- **🔄 IDs únicos universales**: Combinación de índice, ID y contenido
- **📊 Funciones trackBy**: Implementación estándar para todos los componentes

### Implementación Universal de TrackBy

```typescript
// En cada componente con @for loops
trackByUniqueId(index: number, item: any): string {
  return this.uuidService.generateTrackingId(index, item.id, item.name, item.date);
}

// UuidService mejorado
@Injectable({ providedIn: "root" })
export class UuidService {
  generateTrackingId(index: number, id: string, name: string, additional?: string): string {
    const base = `${index}-${id}-${name}`;
    return additional ? `${base}-${additional}` : base;
  }

  generateUniqueId(): string {
    return crypto.randomUUID();
  }
}
```

## 📅 Sistema de Fechas (Actualizado)

### Funcionalidades Principales

- **📅 Fechas de vencimiento**: Para tareas principales (no subtareas)
- **✅ Fechas de completado**: Automáticas al marcar como completadas
- **🔄 Gestión centralizada**: Un solo servicio para toda la lógica de fechas
- **🌍 Zona horaria local**: Consistencia garantizada en todos los formatos
- **🎨 Estados visuales**: Indicadores visuales para fechas vencidas
- **📤 Exportación completa**: Fechas incluidas en PDF, TXT, URLs y copiar
- **🎯 Iconos personalizados**: Interfaz consistente cross-browser ⭐ ENHANCED

### DateManagerService - Servicio Centralizado

```typescript
@Injectable({ providedIn: "root" })
export class DateManagerService {
  // Conversión y normalización
  createLocalDate(dateInput: string | Date): Date;
  getTodayLocal(): Date;

  // Formateo consistente
  formatDateForInput(date: Date | string): string; // YYYY-MM-DD
  formatDateForDisplay(date: Date | string): string; // DD/MM/YYYY
  formatDateToISO(date: Date): string; // ISO local

  // Validación de negocio
  isOverdue(dueDate: string, isCompleted: boolean): boolean;
  isSameDay(date1: Date | string, date2: Date | string): boolean;

  // Gestión de tareas
  updateTaskDueDate(listId: string, taskId: number, dueDate: string | null): void;
  setTaskCompletedDate(listId: string, taskId: number): void;

  // Estadísticas
  getDateStats(tasks: Task[]): {
    totalWithDueDates: number;
    overdue: number;
    dueToday: number;
    completed: number;
  };
}
```

### DateInputComponent - Componente Visual

```typescript
@Component({
  selector: "app-date-input",
  template: `
    <div class="date-input-container" [class.overdue]="isOverdue">
      <input type="date" [value]="value" (change)="onDateChange($event)" [class]="'date-input-' + size" />
      <button *ngIf="value" (click)="clearDate()" class="clear-btn" appTooltip="Eliminar fecha" tooltipPosition="top">×</button>
    </div>
  `,
})
export class DateInputComponent {
  @Input() value: string | null = null;
  @Input() size: "sm" | "md" | "lg" = "md";
  @Output() valueChange = new EventEmitter<string | null>();

  // Estados calculados automáticamente
  get isOverdue(): boolean {
    return this.dateManager.isOverdue(this.value || "", false);
  }
}
```

## 📁 Estructura del Proyecto v3.1

```
src/app/
├── pages/                    # Páginas principales
│   ├── home/                # Lista de checklists + indicadores
│   ├── new-list/            # Creación con protección
│   └── checklist/           # Vista + CDK drag-drop + Dates
├── services/                # Lógica de negocio
│   ├── date-manager.service.ts                     # Sistema de fechas centralizado
│   ├── functions/           # Servicios modulares v3.1
│   │   ├── checklist/       # Funciones específicas de checklist
│   │   │   ├── checklist-reorder.service.ts
│   │   │   ├── checklist-export.service.ts (Date Enhanced)
│   │   │   ├── checklist-tasks.service.ts
│   │   │   ├── checklist-subtasks.service.ts
│   │   │   ├── checklist-errors.service.ts
│   │   │   ├── checklist-modals.service.ts
│   │   │   ├── checklist-team.service.ts
│   │   │   ├── checklist-copy.service.ts (Date Enhanced)
│   │   │   └── checklist-navigation.service.ts
│   │   └── home/            # Funciones de gestión de listas
│   │       ├── duplicate-list.service.ts
│   │       ├── rename-list.service.ts
│   │       ├── delete-list.service.ts
│   │       └── open-new-tab.service.ts
│   ├── export/              # Servicios de exportación v3.1
│   │   ├── pdf-export.service.ts (Date Enhanced)
│   │   └── txt-export.service.ts (Date Enhanced)
│   ├── external/            # Servicios externos v3.1
│   │   ├── base64-url.service.ts (Date Enhanced)
│   │   ├── url-generator.service.ts
│   │   ├── tiny-url.service.ts
│   │   ├── shared-url-loader.service.ts
│   │   └── shared-list-comparison.service.ts (NEW) ⭐  # Comparación de listas
│   ├── uuid.service.ts (Enhanced Tracking) ⭐          # UUIDs mejorados
│   ├── checklist.service.ts (Date Enhanced)
│   ├── storage.service.ts (MONITORING)
│   ├── theme.service.ts
│   ├── toast.service.ts (Smart Notifications) ⭐       # Notificaciones optimizadas
│   └── export-import.service.ts (Date Enhanced)
├── guards/                  # Protección de navegación
│   └── unsaved-changes.guard.ts
├── shared/                  # Componentes reutilizables v3.1
│   ├── atomic/             # Componentes atómicos
│   │   ├── buttons/        # Botones con estados avanzados
│   │   ├── checkboxes/     # Checkboxes con CDK
│   │   ├── inputs/         # Inputs con validación + Dates
│   │   │   ├── input.component.ts
│   │   │   └── date-input.component.ts (Custom Icons) ⭐  # Input con iconos personalizados
│   │   ├── dropdown/       # dropdown con validación
│   │   └── tooltip/        # Tooltips contextuales
│   ├── components/         # Componentes complejos v3.1
│   │   ├── alert-modal/    # Modales de alerta
│   │   ├── confirm-modal/  # Modales de confirmación
│   │   ├── list-comparison-modal/ (NEW) ⭐           # Modal de comparación de listas
│   │   ├── reorder-modal/  # Modal de reordenamiento
│   │   ├── toast/          # Toast notifications (Enhanced)
│   │   ├── storage-indicator/
│   │   ├── storage-progress-indicator/
│   │   ├── export-import-dropdown/ (Date Enhanced)
│   │   ├── header/         # Header con tema
│   │   ├── footer/         # Footer adaptativo
│   │   └── task-item/      # Item con drag & drop + Dates
│   └── styles/             # Estilos globales v3.0
│       ├── animations.css  # Animaciones CDK
│       ├── root.css        # Variables de tema (Date Enhanced)
│       └── scrollbar.css   # Scrollbars personalizados
├── models/                 # Interfaces TypeScript v3.0
│   └── task.interface.ts   # Interfaces con fechas (Date Enhanced)
└── main.ts
```

### Principios Arquitecturales v3.0

- **Date Management**: Sistema centralizado para todas las operaciones de fechas
- **Local Timezone**: Garantía de consistencia en zona horaria local
- **Visual Feedback**: Estados visuales para fechas (vencida, completada, etc.)
- **CDK Integration**: Drag & drop nativo con Angular CDK
- **Servicios Especializados**: Cada función con su servicio independiente
- **Notificaciones Centralizadas**: Sistema unificado de feedback
- **Protección de Datos**: Guards automáticos contra pérdida
- **Temas Dinámicos**: Sistema completo de design tokens
- **Monitoreo de Recursos**: Gestión inteligente de almacenamiento
- **Clean Architecture**: Dependencias hacia adentro con CDK + Dates
- **Reactive Programming**: RxJS + BehaviorSubjects avanzados
- **TypeScript Estricto**: Tipado completo con interfaces robustas

## 🔧 Servicios de Funciones v3.0

Los servicios siguen un patrón mejorado para operaciones específicas con soporte de fechas:

### Patrón Avanzado de Servicios de Funciones

```typescript
@Injectable({ providedIn: "root" })
export class [Function]Service {
  // Servicios centralizados
  constructor(
    private toastService: ToastService,
    private dateManager: DateManagerService // ⭐ NEW
  ) {}

  // Observables para UI
  showModal$: Observable<boolean>;
  isProcessing$: Observable<boolean>;

  // API principal mejorada con fechas
  request[Action](item: any): void;
  confirm[Action](): void;
  cancel[Action](): void;

  // Lógica interna con feedback y fechas
  private perform[Action](): void {
    // Operación + Gestión de fechas + Notificación automática
    this.dateManager.setTaskCompletedDate(listId, taskId);
    this.toastService.showAlert(message, type, duration);
  }
}
```

### Servicios Implementados v3.0

#### **DateManagerService** ⭐ NEW

- **Gestión centralizada** de todas las operaciones de fechas
- **Zona horaria local** garantizada en todos los formatos
- **Formateo consistente** para input, display, ISO y comparaciones
- **Validación de negocio** para fechas vencidas y completadas
- **Estadísticas de fechas** para análisis y reportes
- **Integración completa** con todos los servicios de exportación

#### **ChecklistReorderService** (Date Enhanced)

- **Modal de reordenamiento** con vista previa completa + fechas
- **CDK Drag & Drop** nativo con animaciones suaves
- **Reordenamiento de subtareas** inline con handles visuales
- **Persistencia automática** con notificaciones de confirmación
- **Estados visuales** durante el drag con feedback inmediato

#### **ToastService**

- **4 tipos de notificación**: Success, Warning, Danger, Info
- **Animaciones CSS** slide-in/slide-out personalizadas
- **Duración configurable** según importancia del mensaje
- **Posicionamiento inteligente** sin interferir con la UI
- **Queue management** para múltiples notificaciones

#### **ThemeService**

- **Detección automática** de preferencias del sistema
- **Persistencia local** de elección manual del usuario
- **Transiciones suaves** entre temas con CSS animations
- **Variables CSS** completas con design tokens
- **Assets dinámicos** (logos, iconos) según tema activo

#### **DuplicateListService** (Date Enhanced)

- Modal con **vista previa** del nombre generado automáticamente
- Numeración inteligente con **regex avanzado**
- **Regeneración completa** de IDs únicos para tareas y subtareas
- **Reset automático** de estados completados **y fechas**
- **Notificaciones contextuales** con detalles de la operación

#### **RenameListService** (Date Enhanced)

- **Validación en tiempo real** con colores de estado
- **Mensajes específicos** según tipo de error encontrado
- **Múltiples formas de cancelación** (Escape, click fuera, botón)
- **Feedback visual inmediato** durante la edición
- **Integración toast** para confirmaciones

#### **DeleteListService** (Date Enhanced)

- **Eliminación masiva** con modo selección dedicado
- **Contadores dinámicos** en botones según cantidad
- **Confirmaciones específicas** adaptadas al contexto
- **Operaciones atómicas** con rollback automático
- **Notificaciones detalladas** de resultados

#### **ChecklistExportService** (Date Enhanced) ⭐ ENHANCED

- **Exportación PDF** con estilos profesionales de impresión **+ fechas**
- **Exportación TXT** en múltiples formatos especializados **+ fechas**
- **Exportación Copy** con formato completo **+ fechas**
- **URLs compartidas** con fechas incluidas en metadatos
- **Vista previa** antes de exportar
- **Metadatos completos** con fecha y estadísticas
- **Manejo de errores** con notificaciones específicas
- **Formateo consistente** usando DateManagerService

## 🎯 Sistema de Notificaciones v2.1

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

## 📊 Sistema de Monitoreo v2.1

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

## 🛡️ Sistema de Protección v2.1

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

## 🎨 Sistema de Temas v2.1

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

## 🔄 Flujo de Datos v2.1

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

## 📊 Modelos de Datos v3.0

### Interfaces Principales con Sistema de Fechas

```typescript
interface ChecklistData {
  id: string;
  name?: string;
  tasks: Task[];
  observations: string;
  team?: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: number; // UUID-based único
  name: string;
  completed: boolean;
  priority?: boolean;
  dueDate?: string | null; // ⭐ NEW - Fecha de vencimiento (YYYY-MM-DD)
  completedDate?: string | null; // ⭐ NEW - Fecha de completado (ISO)
  leader?: TeamMember;
  subtasks: Subtask[];
  errors: TaskError[];
}

interface Subtask {
  id: number; // UUID-based único
  name: string;
  completed: boolean;
  priority?: boolean;
  assignedMember?: string;
  // Nota: Las subtareas NO tienen fechas por diseño
}

interface TaskError {
  id: number; // UUID-based único
  name: string; // Cambio: description → name para consistencia
}

interface TeamMember {
  id: string;
  name: string;
}

// Interfaces del Sistema de Fechas v3.0 ⭐ NEW
interface DateStats {
  totalWithDueDates: number;
  overdue: number;
  dueToday: number;
  completed: number;
}

interface DateValidation {
  isValid: boolean;
  isOverdue: boolean;
  isToday: boolean;
  formattedDisplay: string;
  formattedInput: string;
}

// Interfaces de Servicios v3.0
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

## 🎨 Componentes y UI v2.1

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

## 🚀 Mejoras de Performance v2.1

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

### UI Optimizada v2.1

- **Cards uniformes**: Altura consistente con contenido dinámico
- **Modal Management**: Creación/destrucción eficiente de modales
- **Event Batching**: Múltiples operaciones agrupadas
- **State Minimal**: Solo se actualiza lo estrictamente necesario
- **CDK Animations**: Transiciones hardware-accelerated

### Algoritmos Eficientes v2.1

- **Numeración inteligente**: Regex optimizado para nombres únicos
- **UUID Generation**: Optimizado con performance nativa
- **Drag Tracking**: Sistema robusto para evitar re-renders
- **Validaciones async**: En tiempo real sin bloqueos de UI
- **Storage Compression**: Optimización de datos en localStorage

## 🔧 Herramientas de Desarrollo v2.1

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

## 🐛 Mejoras y Correcciones v3.1 ⭐ NEW

### Correcciones Críticas

#### **Notificaciones Repetitivas SOLUCIONADO**

- **Problema**: Felicitaciones se mostraban cada vez al escribir comentarios
- **Causa**: `updateProgress()` se ejecutaba en cada cambio de la lista
- **Solución**: Bandera `hasShownCongratulations` en `checklist-state.service.ts`
- **Resultado**: Felicitaciones solo se muestran una vez por completado

```typescript
// ChecklistStateService v3.1
private hasShownCongratulations = false;

updateProgress(): void {
  const allCompleted = this.allTasksCompleted();

  if (allCompleted && !this.hasShownCongratulations) {
    this.hasShownCongratulations = true;
    this.toastService.showToast("¡Felicitaciones! Has completado todas las tareas", "success");
  } else if (!allCompleted) {
    this.hasShownCongratulations = false;
  }
}
```

#### **Errores de Tracking Duplicado (NG0955) SOLUCIONADO**

- **Problema**: Errores `NG0955` por claves duplicadas en `@for` loops
- **Archivos afectados**: `home.component.html`, `export-import-dropdown.component.html`, `team-dropdown.component.ts`
- **Solución**: Funciones `trackByUniqueId()` con UuidService mejorado
- **Resultado**: Eliminación completa de errores de tracking

```typescript
// Implementación universal de trackBy
trackByUniqueId(index: number, item: any): string {
  return this.uuidService.generateTrackingId(
    index,
    item.id,
    item.name,
    item.date || JSON.stringify(item)
  );
}
```

#### **Iconos de Fecha Nativos REEMPLAZADO**

- **Problema**: Iconos nativos del navegador inconsistentes entre browsers
- **Afectaba**: Safari, Chrome, Firefox con diferentes estilos
- **Solución**: Icono personalizado `calendar_today` de Material Icons
- **Resultado**: Interfaz consistente que se adapta al tema automáticamente

### Mejoras de Arquitectura

#### **Sistema de Listas Compartidas Inteligente**

- **Detección automática** por nombre de lista
- **Modal de decisión** para actualizar vs crear copia
- **Comparación regex** case-insensitive sin sufijo "(Compartida)"
- **Preservación de datos** originales en actualizaciones

#### **UuidService Robusto**

- **Generación de IDs únicos** combinando múltiples factores
- **Prevención de colisiones** en elementos dinámicos
- **Compatibilidad universal** para todos los componentes con loops

#### **Sistema de Notificaciones Optimizado**

- **Control de contexto** para evitar spam
- **Timing inteligente** basado en acciones del usuario
- **Estados persistentes** que se resetean apropiadamente

### Optimizaciones de Performance

#### **Menos Re-renders**

- **TrackBy functions** optimizadas para todos los loops
- **Cambios mínimos** en el DOM
- **Estados calculados** solo cuando es necesario

#### **Mejor UX Cross-browser**

- **Iconos personalizados** que funcionan igual en todos los browsers
- **CSS robusto** con fallbacks apropiados
- **Adaptación automática** al tema sin JavaScript adicional

### Compatibilidad y Estabilidad

#### **Compatibilidad Total**

- ✅ **Chrome/Edge**: Iconos consistentes
- ✅ **Firefox**: Iconos consistentes
- ✅ **Safari**: Iconos consistentes
- ✅ **Mobile browsers**: Responsive completo

#### **Robustez del Sistema**

- **Error handling** mejorado en comparación de listas
- **Fallbacks** apropiados para funciones críticas
- **Validación** de datos en servicios externos

---

**📖 Documentación Técnica v3.1 - Checkliist con Shared Lists, Custom Icons & Enhanced Tracking**
