# Arquitectura del Checklist - Documentación Técnica

## 📋 Resumen Ejecutivo

El módulo de checklist sigue el **patrón arquitectónico de HomeComponent**, donde el estado básico se maneja en un servicio dedicado y las funciones específicas se inyectan directamente en el componente para máxima flexibilidad y reutilización.

## 🏗️ Arquitectura General

```
ChecklistComponent
├── ChecklistStateService (solo estado básico)
├── ChecklistTasksService (gestión de tareas)
├── ChecklistSubtasksService (gestión de subtareas)
├── ChecklistErrorsService (gestión de errores)
├── ChecklistModalsService (gestión de modales)
├── ChecklistNavigationService (navegación y guardado)
└── ChecklistExportService (exportación)
```

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Cada servicio tiene una responsabilidad específica
2. **Inyección Directa**: Los servicios de funciones van directo al componente, no al state
3. **Consistencia**: Mismo patrón que HomeComponent para uniformidad
4. **Reutilización**: Servicios independientes que pueden usarse en otros componentes
5. **Reactividad**: Uso de observables y async pipe para mejor rendimiento

## 📁 Estructura de Archivos

```
src/app/pages/checklist/
├── checklist.component.ts          # Componente principal
├── checklist.component.html        # Template
├── checklist.component.css         # Estilos
└── checklist-state.service.ts      # Servicio de estado básico

src/app/services/functions/checklist/
├── index.ts                        # Exportaciones centralizadas
├── checklist-tasks.service.ts      # Gestión de tareas
├── checklist-subtasks.service.ts   # Gestión de subtareas
├── checklist-errors.service.ts     # Gestión de errores
├── checklist-modals.service.ts     # Gestión de modales
├── checklist-navigation.service.ts # Navegación y guardado
└── checklist-export.service.ts     # Exportación
```

## 🔧 ChecklistStateService

### Responsabilidades

- **Solo estado básico**: `currentList`, `progress`, `hasUnsavedChanges`
- **Operaciones básicas**: carga, autoguardado, notificaciones de progreso
- **Sin lógica de negocio**: No maneja funciones específicas

### Interface del Estado

```typescript
interface ChecklistState {
  currentList: ChecklistData | null;
  progress: { completed: number; total: number; percentage: number };
  hasUnsavedChanges: boolean;
}
```

### Métodos Públicos

- `initializeWithListId(listId: string)`: Inicializa con una lista específica
- `markAsChanged()`: Marca el estado como modificado
- `updateState(partialState)`: Actualiza el estado
- `cleanup()`: Limpia recursos

### Características Especiales

- **Autoguardado**: Cada 15 segundos si hay cambios y la lista tiene nombre
- **Notificación de completado**: Alerta cuando se completan todas las tareas
- **Manejo de errores**: Navegación automática a home si no encuentra la lista

## 🎯 ChecklistComponent

### Responsabilidades

- **Coordinación**: Orquesta todos los servicios de funciones
- **Interfaz**: Maneja eventos del template y los delega
- **Observables**: Expone observables de todos los servicios
- **Estado local**: Mantiene propiedades para compatibilidad con HTML

### Servicios Inyectados

#### ChecklistTasksService

- **Propósito**: Gestión completa de tareas (CRUD + confirmaciones)
- **Observables**: `showConfirmModal$`, `confirmModalData$`
- **Métodos**: `toggleTask()`, `updateTask()`, `initiateTaskDeletion()`, `confirmTaskDeletion()`

#### ChecklistSubtasksService

- **Propósito**: Gestión de subtareas con notificaciones
- **Funciones**: Toggle, agregar (soporte para múltiples con '+'), eliminar, actualizar
- **Notificaciones**: Mensajes automáticos para cada operación

#### ChecklistErrorsService

- **Propósito**: Gestión de errores/problemas de tareas
- **Funciones**: Agregar, eliminar, actualizar errores
- **Notificaciones**: Mensajes de advertencia para errores

#### ChecklistModalsService

- **Propósito**: Gestión centralizada de todos los modales
- **Modales**: Edición masiva, guardado, alertas
- **Observables**: `showEditModal$`, `showSaveModal$`, `showAlertModal$`

#### ChecklistNavigationService

- **Propósito**: Navegación y operaciones de guardado
- **Funciones**: Guardado con confirmaciones, navegación segura, edición masiva
- **Observables**: `showConfirmModal$`, `confirmModalData$`

#### ChecklistExportService

- **Propósito**: Exportación en múltiples formatos
- **Formatos**: PDF (con Ctrl+P), TXT completo, TXT de tarea individual
- **Características**: Validaciones y notificaciones automáticas

### Organización de Métodos

#### Gestión de Tareas

```typescript
onTaskToggled(event: { taskId: number; completed: boolean })
onTaskUpdated(event: { taskId: number; newName: string })
onTaskDeleted(taskId: number)
confirmTaskDeletion()
cancelTaskDeletion()
```

#### Gestión de Subtareas

```typescript
onSubtaskToggled(event: { taskId: number; subtaskId: number; completed: boolean })
onSubtaskAdded(event: { taskId: number; name: string })
onSubtaskRemoved(event: { taskId: number; subtaskId: number })
onSubtaskUpdated(event: { taskId: number; subtaskId: number; newName: string })
```

#### Gestión de Errores

```typescript
onErrorAdded(event: { taskId: number; description: string })
onErrorRemoved(event: { taskId: number; errorId: number })
onErrorUpdated(event: { taskId: number; errorId: number; newDescription: string })
```

#### Exportación

```typescript
exportToPDF()
exportToTXT()
onTaskExported(taskId: number)
```

#### Navegación y Observaciones

```typescript
onObservationsChange();
goHome();
confirmStartNewList();
onConfirmAction();
onCancelAction();
```

#### Modales y Utilidades

```typescript
editMode()
onEditConfirm(newTasksString: string)
closeEditModal()
onSaveConfirm(name: string)
closeSaveModal()
showSaveModalDialog()
closeAlert()
saveProgress()
```

## 🔄 Flujos de Datos

### Flujo de Estado Básico

```
ChecklistService → ChecklistStateService → ChecklistComponent
```

### Flujo de Funciones Específicas

```
Template Event → ChecklistComponent → FunctionService → ChecklistService
                                   ↓
                                markAsChanged() → ChecklistStateService
```

### Flujo de Modales

```
FunctionService → BehaviorSubject → Observable → Component → Template (async pipe)
```

## ✨ Características Especiales

### Sugerencia Automática de Nombres

Cuando se guarda una lista sin nombre, el sistema sugiere automáticamente el nombre de la primera tarea:

```typescript
// En showSaveModalDialog()
if (!suggestedName || suggestedName.trim() === "") {
  const firstTask = this.currentList?.tasks?.[0];
  if (firstTask) {
    suggestedName = firstTask.name;
  }
}
```

### Soporte para Múltiples Subtareas

El sistema permite agregar múltiples subtareas separadas por '+':

```typescript
// En ChecklistSubtasksService
const subtasks = name
  .split("+")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
```

### Autoguardado Inteligente

- Solo guarda si hay cambios (`hasUnsavedChanges: true`)
- Solo guarda si la lista tiene nombre
- Intervalo de 15 segundos
- Notificación discreta al usuario

### Navegación Segura

- Detecta cambios sin guardar antes de navegar
- Ofrece opciones: "Guardar y salir" o "Salir sin guardar"
- Maneja pendingActions para ejecutar navegación después del guardado

## 🎨 Patrones de Diseño Utilizados

### Observer Pattern

- Observables para comunicación reactiva
- BehaviorSubjects para estado de modales
- Async pipe en templates para mejor rendimiento

### Service Locator Pattern

- Inyección directa de servicios en el componente
- Cada servicio es independiente y reutilizable

### Command Pattern

- Métodos específicos para cada acción
- Separación clara entre trigger y ejecución

### State Pattern

- Estado centralizado en ChecklistStateService
- Transiciones de estado controladas

## 🔧 Configuración y Uso

### Inyección de Dependencias

```typescript
constructor(
  private route: ActivatedRoute,
  private stateService: ChecklistStateService,
  // Servicios de funciones
  private tasksService: ChecklistTasksService,
  private subtasksService: ChecklistSubtasksService,
  private errorsService: ChecklistErrorsService,
  private modalsService: ChecklistModalsService,
  private navigationService: ChecklistNavigationService,
  private exportService: ChecklistExportService
) {}
```

### Inicialización de Observables

```typescript
private initializeServiceObservables(): void {
  // Observables del servicio de tareas
  this.taskShowConfirmModal$ = this.tasksService.showConfirmModal$;
  this.taskConfirmModalData$ = this.tasksService.confirmModalData$;

  // Observables del servicio de modales
  this.showEditModal$ = this.modalsService.showEditModal$;
  // ... más observables
}
```

### Uso en Template

```html
<!-- Modal de confirmación de tareas -->
<app-confirm-modal [show]="taskShowConfirmModal$ | async" [data]="taskConfirmModalData$ | async" (onConfirm)="confirmTaskDeletion()" (onCancel)="cancelTaskDeletion()"> </app-confirm-modal>
```

## 🚀 Beneficios de esta Arquitectura

### Mantenibilidad

- Código organizado por responsabilidades
- Fácil localización de funcionalidades
- Cambios aislados sin efectos colaterales

### Escalabilidad

- Fácil agregar nuevos servicios de funciones
- Servicios reutilizables en otros componentes
- Arquitectura consistente en toda la aplicación

### Testabilidad

- Servicios independientes fáciles de testear
- Mocking sencillo de dependencias
- Separación clara de lógica de negocio

### Rendimiento

- Uso de async pipe para mejor change detection
- Observables para comunicación eficiente
- Lazy loading de funcionalidades

### Consistencia

- Mismo patrón que HomeComponent
- Convenciones uniformes en toda la aplicación
- Fácil onboarding para nuevos desarrolladores

## 📊 Comparación con HomeComponent

| Aspecto                | HomeComponent               | ChecklistComponent              |
| ---------------------- | --------------------------- | ------------------------------- |
| State Service          | HomeStateService            | ChecklistStateService           |
| Servicios de Funciones | 4 servicios                 | 6 servicios                     |
| Responsabilidad State  | Listas, búsqueda, selección | Lista actual, progreso, cambios |
| Modales                | En state service            | En servicio dedicado            |
| Complejidad            | Media                       | Alta                            |
| Reutilización          | Alta                        | Alta                            |

## 🔮 Extensibilidad Futura

### Agregar Nuevos Servicios

1. Crear servicio en `src/app/services/functions/checklist/`
2. Exportar en `index.ts`
3. Inyectar en `ChecklistComponent`
4. Inicializar observables si es necesario
5. Agregar métodos de delegación

### Nuevas Funcionalidades

- **Comentarios**: `ChecklistCommentsService`
- **Colaboración**: `ChecklistCollaborationService`
- **Historial**: `ChecklistHistoryService`
- **Plantillas**: `ChecklistTemplatesService`

### Optimizaciones

- Lazy loading de servicios pesados
- Caching de datos frecuentes
- Debounce en operaciones costosas
- Virtual scrolling para listas grandes

---

_Documentación actualizada: Diciembre 2024_
_Versión de la arquitectura: 2.0_
_Patrón base: HomeComponent_
