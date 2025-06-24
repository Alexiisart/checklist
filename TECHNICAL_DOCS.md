# 📖 Documentación Técnica

> Arquitectura y APIs de Checklist Diario

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## 🏗️ Arquitectura

### Patrón Clean Architecture con Servicios Modulares

```
┌─────────────────────────────────────┐
│           COMPONENTS                │
│  ├── pages/ (UI + Navigation)       │
│  └── shared/ (Reusable Components)  │
├─────────────────────────────────────┤
│           FUNCTION SERVICES         │
│  ├── duplicate-list.service         │
│  ├── rename-list.service            │
│  ├── delete-list.service            │
│  └── open-new-tab.service           │
├─────────────────────────────────────┤
│           CORE SERVICES             │
│  ├── checklist.service             │
│  ├── storage.service               │
│  ├── uuid.service                  │
│  ├── theme.service                 │
│  └── export-import.service         │
├─────────────────────────────────────┤
│           STATE SERVICES            │
│  ├── home-state.service (UI only)  │
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

## 📁 Estructura del Proyecto

```
src/app/
├── pages/           # Páginas principales
│   ├── home/        # Lista de checklists guardadas
│   ├── new-list/    # Creación de nuevas listas
│   └── checklist/   # Vista y edición de checklists
├── services/        # Lógica de negocio
│   ├── functions/   # Servicios modulares especializados
│   │   ├── duplicate-list.service.ts
│   │   ├── rename-list.service.ts
│   │   ├── delete-list.service.ts
│   │   └── open-new-tab.service.ts
│   ├── uuid.service.ts
│   ├── checklist.service.ts
│   └── storage.service.ts
├── shared/          # Componentes reutilizables
│   ├── atomic/      # Componentes atómicos (buttons, inputs, etc.)
│   ├── components/  # Componentes complejos
│   └── styles/      # Estilos globales y variables
├── models/          # Interfaces TypeScript
└── guards/          # Protección de rutas
```

### Principios Arquitecturales

- **Servicios Independientes**: Cada función tiene su servicio especializado
- **Separación de Responsabilidades**: State services solo manejan UI
- **Modularidad**: Funciones pueden funcionar independientemente
- **Clean Architecture**: Dependencias van hacia adentro
- **Reactive Programming**: RxJS + BehaviorSubjects
- **TypeScript**: Tipado estricto con interfaces robustas

## 🔧 Servicios de Funciones

Los servicios de funciones siguen un patrón consistente para operaciones específicas:

### Patrón General de Servicios de Funciones

```typescript
@Injectable({ providedIn: "root" })
export class [Function]Service {
  // Observables para UI
  showModal$: Observable<boolean>;
  isProcessing$: Observable<boolean>;

  // API principal
  request[Action](item: any): void;
  confirm[Action](): void;
  cancel[Action](): void;

  // Lógica interna específica
  private perform[Action](): void;
}
```

### Servicios Implementados

#### **DuplicateListService**

- Modal de confirmación antes de duplicar
- Numeración automática inteligente con regex
- IDs únicos para tareas y subtareas
- Reset automático de estados completados
- Limpieza de errores y observaciones

#### **RenameListService**

- Validación en tiempo real de nombres únicos
- Manejo robusto de errores con mensajes específicos
- Confirmación con Enter, cancelación con Escape
- Prevención de nombres duplicados
- Feedback visual inmediato

#### **DeleteListService**

- Eliminación individual y múltiple
- Confirmación específica según cantidad
- Conteo dinámico en mensajes
- Operaciones atómicas
- Feedback de resultados

#### **OpenNewTabService**

- Apertura de listas en nueva pestaña del navegador
- Soporte para hash routing de Angular
- Fallback automático a navegación en misma pestaña
- URL absolutas con origen del sitio
- Manejo de errores silencioso para producción

## 🔄 Flujo de Datos

### Arquitectura de Eventos

```typescript
// Component → Function Service → Core Service → Storage
component.ts → function.service → core.service → storage.service
           ↓
          Modal UI + Confirmation
           ↓
        State Update
```

### Estado Reactivo

```typescript
// Components conectan con múltiples servicios
export class Component {
  // Servicios de funciones
  serviceModal$ = this.functionService.showModal$;

  // Suscripciones a completados
  ngOnInit() {
    this.functionService.operationCompleted$.subscribe(() => {
      this.stateService.refreshData();
    });
  }
}
```

### State Services Refactorizados

Los state services se enfocan únicamente en:

- Estado de UI y navegación
- Manejo de datos para presentación
- Sin lógica de negocio compleja
- Delegación a servicios especializados

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

// Estados de servicios genéricos
interface ServiceState<T> {
  showModal: boolean;
  isProcessing: boolean;
  currentItem: T | null;
  error: string | null;
}
```

## 🎨 Componentes y UI

### Componentes Principales

#### **ListCardComponent**

Componente reutilizable para mostrar información de listas:

- Múltiples outputs para diferentes acciones
- Modo selección para operaciones masivas
- Botones de acción consistentes
- Estados visuales claros

#### **HomeComponent**

Coordinador principal que:

- Conecta con múltiples servicios de funciones
- Maneja estado de UI através de HomeStateService
- Delega operaciones a servicios especializados
- Mantiene UI reactiva con observables

#### **Componentes Atómicos**

Sistema de design consistente:

- ButtonComponent con múltiples variantes
- InputComponent con validación
- CheckboxComponent reutilizable
- Todos con tipado estricto y props configurables

## 🚀 Mejoras de Performance

### Servicios Independientes

- **Carga bajo demanda**: Servicios solo se activan cuando se necesitan
- **Memory management**: Limpieza automática de subscripciones
- **Operaciones atómicas**: Cada servicio maneja su propio estado
- **Error boundaries**: Fallos aislados no afectan otros servicios

### UI Optimizada

- **Cards uniformes**: Altura consistente en grids
- **Lazy loading**: Modales se crean solo cuando se necesitan
- **Event batching**: Múltiples operaciones se agrupan eficientemente
- **State minimal**: Solo se actualiza lo necesario

### Algoritmos Eficientes

- Numeración inteligente con regex para nombres únicos
- Generación de IDs optimizada con UUID nativo
- Tracking robusto para evitar re-renders innecesarios
- Validaciones en tiempo real sin bloqueos

## 🔧 Herramientas de Desarrollo

### Testing

Los servicios siguen patrones testeable:

- Dependency injection para mocking
- Observables para testing asíncrono
- Separación clara de responsabilidades
- APIs predictibles y consistentes

### Debugging

- Logging estructurado en desarrollo
- Error handling consistente
- Estado observable para inspection
- Fallbacks robustos para producción

---

**Documentación para Checklist Diario - Angular 19+ y TypeScript 5.7+**
