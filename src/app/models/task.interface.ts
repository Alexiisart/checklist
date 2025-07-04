/**
 * Interfaz que representa un miembro del equipo
 */
export interface TeamMember {
  id: number; // Identificador único del miembro
  name: string; // Nombre del miembro del equipo
}

/**
 * Interfaz que representa una subtarea dentro de una tarea principal
 */
export interface Subtask {
  id: number; // Identificador único de la subtarea
  name: string; // Nombre o descripción de la subtarea
  completed: boolean; // Estado de completado de la subtarea
  assignedMember?: TeamMember | null; // Miembro asignado a esta subtarea (opcional)
  priority?: boolean; // Indica si la subtarea es prioritaria (opcional)
}

/**
 * Interfaz que representa un problema que ocurrió al realizar una tarea
 */
export interface TaskError {
  id: number; // Identificador único del problema
  name: string; // Descripción del problema que ocurrió al realizar la tarea
}

/**
 * Interfaz que representa una tarea principal del checklist
 */
export interface Task {
  id: number; // Identificador único de la tarea
  name: string; // Nombre o descripción de la tarea
  completed: boolean; // Estado de completado de la tarea
  subtasks: Subtask[]; // Lista de subtareas asociadas
  errors: TaskError[]; // Lista de problemas que ocurrieron al realizar la tarea
  leader?: TeamMember | null; // Líder asignado a la tarea (del equipo de la lista)
  priority?: boolean; // Indica si la tarea es prioritaria (opcional)
  dueDate?: string | null; // Fecha de vencimiento de la tarea (formato ISO string, opcional)
  completedDate?: string | null; // Fecha en que se completó la tarea (formato ISO string, opcional)
}

/**
 * Interfaz que representa los datos completos de un checklist
 */
export interface ChecklistData {
  id: string; // Identificador único del checklist
  name: string; // Nombre del checklist
  tasks: Task[]; // Lista de tareas
  observations: string; // Observaciones generales
  createdDate: string; // Fecha de creación
  modifiedDate: string; // Fecha de última modificación
  team: TeamMember[]; // Lista de miembros del equipo
  priority?: boolean; // Indica si la lista es prioritaria (opcional)
  sharedAt?: string; // Fecha cuando se compartió la lista (opcional)
  shareVersion?: string; // Versión del formato de compartir (opcional)
}

/**
 * Interfaz que representa una lista guardada en el almacenamiento
 */
export interface SavedList {
  id: string; // Identificador único de la lista guardada
  name: string; // Nombre de la lista
  tasksCount: number; // Número total de tareas
  completedCount: number; // Número de tareas completadas
  date: string; // Fecha de la lista
  preview: string; // Vista previa del contenido
  priority?: boolean; // Indica si la lista es prioritaria (opcional)
}

/**
 * Interfaz que representa los datos necesarios para un modal de entrada
 */
export interface ModalData {
  title: string; // Título del modal
  label: string; // Etiqueta del campo de entrada
  placeholder: string; // Texto placeholder del campo
  currentValue?: string; // Valor actual del campo (opcional)
  isTextarea?: boolean; // Si debe mostrarse como textarea o input normal (opcional, por defecto true)
  confirmButtonText?: string; // Texto del botón de confirmación (opcional, por defecto "Agregar")
}

/**
 * Interfaz que representa los datos para mostrar una alerta
 */
export interface AlertData {
  message: string; // Mensaje de la alerta
  type: 'success' | 'warning' | 'danger' | 'info'; // Tipo de alerta
  duration?: number; // Duración en milisegundos (opcional)
}

/**
 * Interfaz que representa los datos para un modal de confirmación
 */
export interface ConfirmData {
  message: string; // Mensaje de confirmación
  title: string; // Título del modal
  confirmText: string; // Texto del botón de confirmación
  cancelText: string; // Texto del botón de cancelación
  // Botón adicional opcional para modales de 3 opciones
  thirdButtonText?: string; // Texto del tercer botón (opcional)
}
