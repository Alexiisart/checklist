import { Injectable } from '@angular/core';
import { ChecklistData, Task, SavedList } from '../../../models/task.interface';
import { ToastService } from '../../toast.service';
import { StorageService } from '../../storage.service';

/**
 * Servicio para copiar contenido de tareas y listas al portapapeles
 * usando el mismo formato que la exportación TXT
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistCopyService {
  constructor(
    private toastService: ToastService,
    private storageService: StorageService
  ) {}

  /**
   * Copia una tarea específica con sus subtareas al portapapeles
   * @param checklistData Datos de la lista completa
   * @param taskId ID de la tarea específica a copiar
   */
  async copyTaskToClipboard(
    checklistData: ChecklistData,
    taskId: number
  ): Promise<void> {
    try {
      const content = this.generateSingleTaskContent(checklistData, taskId);
      await navigator.clipboard.writeText(content);

      const task = checklistData.tasks.find((t) => t.id === taskId);
      const taskName = task?.name || 'Tarea';
      this.toastService.showAlert(
        `Tarea "${taskName}" copiada al portapapeles`,
        'success'
      );
    } catch (error) {
      console.error('Error copiando tarea:', error);
      this.toastService.showAlert(
        'Error al copiar la tarea al portapapeles',
        'danger'
      );
    }
  }

  /**
   * Copia toda la lista con todas sus tareas al portapapeles
   * @param checklistData Datos de la lista completa
   */
  async copyFullListToClipboard(checklistData: ChecklistData): Promise<void> {
    try {
      const content = this.generateFullListContent(checklistData);
      await navigator.clipboard.writeText(content);

      this.toastService.showAlert(
        `Lista "${checklistData.name || 'Lista'}" copiada al portapapeles`,
        'success'
      );
    } catch (error) {
      console.error('Error copiando lista completa:', error);
      this.toastService.showAlert(
        'Error al copiar la lista al portapapeles',
        'danger'
      );
    }
  }

  /**
   * Copia una lista desde su información básica (card)
   * Maneja toda la lógica de cargar la lista, validaciones y errores
   */
  async copyListFromCard(savedList: SavedList): Promise<void> {
    try {
      const fullList = this.storageService.loadList(savedList.id);

      if (!fullList) {
        this.toastService.showAlert(
          'Lista no encontrada para copiar',
          'danger'
        );
        return;
      }

      await this.copyFullListToClipboard(fullList);
    } catch (error) {
      console.error('Error cargando lista para copiar:', error);
      this.toastService.showAlert('Error al cargar la lista', 'danger');
    }
  }

  /**
   * Genera el contenido de una tarea específica para copiar
   * (igual que el formato de exportación TXT)
   */
  private generateSingleTaskContent(
    checklistData: ChecklistData,
    taskId: number
  ): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Buscar la tarea específica
    const task = checklistData.tasks.find((t) => t.id === taskId);

    if (!task) {
      return `❌ ERROR: Tarea con ID ${taskId} no encontrada en la lista.`;
    }

    let content = '';

    // Encabezado
    content += '📝 Checkliist - TAREA INDIVIDUAL\n';
    content += '═'.repeat(50) + '\n\n';
    content += `📅 Fecha: ${currentDate}\n`;
    content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n`;
    content += `🎯 Tarea: ${task.name}\n`;
    content += `📊 Estado: ${
      task.completed ? '✅ COMPLETADA' : '⬜ PENDIENTE'
    }\n\n`;

    // Detalles de la tarea
    content += 'DETALLES DE LA TAREA:\n';
    content += '─'.repeat(30) + '\n\n';

    const checkmark = task.completed ? '✅' : '⬜';
    const priorityIndicator = task.priority ? '⭐ ' : '';
    content += `${checkmark} ${priorityIndicator}${task.name}\n`;

    // Información de fechas de la tarea
    if (task.dueDate || task.completedDate) {
      content += '📅 ';
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toLocaleDateString('es-ES');
        const isOverdue =
          !task.completed && new Date(task.dueDate) < new Date();
        content += `Vence: ${dueDate}${isOverdue ? ' (VENCIDA)' : ''}`;
      }
      if (task.completedDate) {
        const completedDate = new Date(task.completedDate).toLocaleDateString(
          'es-ES'
        );
        content += task.dueDate
          ? ` | Completada: ${completedDate}`
          : `Completada: ${completedDate}`;
      }
      content += '\n';
    }

    // Líder de la tarea
    if (task.leader) {
      content += `👤 Líder: ${task.leader.name}\n`;
    }

    // Subtareas
    if (task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(
        (st) => st.completed
      ).length;
      const totalSubtasks = task.subtasks.length;
      const subtaskProgress =
        totalSubtasks > 0
          ? Math.round((completedSubtasks / totalSubtasks) * 100)
          : 0;

      content += `\n📈 Progreso de subtareas: ${completedSubtasks}/${totalSubtasks} (${subtaskProgress}%)\n\n`;
      content += 'SUBTAREAS:\n';
      content += '─'.repeat(20) + '\n';

      task.subtasks.forEach((subtask, index) => {
        const subtaskCheck = subtask.completed ? '✅' : '⬜';
        const subtaskName = subtask.completed
          ? `${subtask.name} (completada)`
          : subtask.name;
        const subNumber = (index + 1).toString().padStart(2, '0');

        const subtaskPriorityIndicator = subtask.priority ? '⭐ ' : '';
        content += `${subNumber}. ${subtaskCheck} ${subtaskPriorityIndicator}${subtaskName}`;

        // Mostrar miembro asignado si existe
        if (subtask.assignedMember) {
          content += ` - Asignado a: ${subtask.assignedMember.name}`;
        }

        content += '\n';
      });
    } else {
      content += '\n📝 Esta tarea no tiene subtareas definidas.\n';
    }

    // Errores/Problemas
    if (task.errors.length > 0) {
      content += '\nPROBLEMAS DOCUMENTADOS:\n';
      content += '─'.repeat(30) + '\n';
      task.errors.forEach((error, index) => {
        const errorNumber = (index + 1).toString().padStart(2, '0');
        content += `${errorNumber}. ⚠️  ${error.name}\n`;
      });
    } else {
      content += '\n✅ No se han documentado problemas para esta tarea.\n';
    }

    // Estadísticas
    content += '\nESTADÍSTICAS:\n';
    content += '─'.repeat(20) + '\n';
    content += `• Estado de la tarea: ${
      task.completed ? 'Completada' : 'Pendiente'
    }\n`;
    content += `• Número de subtareas: ${task.subtasks.length}\n`;
    if (task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(
        (st) => st.completed
      ).length;
      content += `• Subtareas completadas: ${completedSubtasks}\n`;
      content += `• Subtareas pendientes: ${
        task.subtasks.length - completedSubtasks
      }\n`;
    }
    content += `• Problemas documentados: ${task.errors.length}\n\n`;

    // Pie de página
    content += '═'.repeat(50) + '\n';
    content += `📄 Copiado desde Checkliist - ${new Date().toLocaleString(
      'es-ES'
    )}\n`;

    return content;
  }

  /**
   * Genera el contenido de la lista completa para copiar
   * (igual que el formato de exportación TXT)
   */
  private generateFullListContent(checklistData: ChecklistData): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const completedTasks = checklistData.tasks.filter(
      (task) => task.completed
    ).length;
    const totalTasks = checklistData.tasks.length;
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let content = '';

    // Encabezado
    content += '📝 Checkliist\n';
    content += '═'.repeat(50) + '\n\n';
    content += `📅 Fecha: ${currentDate}\n`;
    content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n`;
    content += `✅ Progreso: ${completedTasks} de ${totalTasks} tareas completadas (${progressPercentage}%)\n\n`;

    // Información del equipo
    if (checklistData.team && checklistData.team.length > 0) {
      content += 'EQUIPO:\n';
      content += '─'.repeat(20) + '\n';
      checklistData.team.forEach((member, index) => {
        content += `${index + 1}. ${member.name}\n`;
      });
      content += '\n';
    }

    // Tareas
    content += 'TAREAS:\n';
    content += '─'.repeat(30) + '\n\n';

    checklistData.tasks.forEach((task, index) => {
      const taskNumber = (index + 1).toString().padStart(2, '0');
      const checkmark = task.completed ? '✅' : '⬜';
      const priorityIndicator = task.priority ? '⭐ ' : '';
      const taskName = task.completed ? `${task.name} (COMPLETADA)` : task.name;

      content += `${taskNumber}. ${checkmark} ${priorityIndicator}${taskName}`;

      // Mostrar líder si existe
      if (task.leader) {
        content += ` - Líder: ${task.leader.name}`;
      }

      content += '\n';

      // Información de fechas de la tarea
      if (task.dueDate || task.completedDate) {
        content += '    📅 ';
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate).toLocaleDateString('es-ES');
          const isOverdue =
            !task.completed && new Date(task.dueDate) < new Date();
          content += `Vence: ${dueDate}${isOverdue ? ' (VENCIDA)' : ''}`;
        }
        if (task.completedDate) {
          const completedDate = new Date(task.completedDate).toLocaleDateString(
            'es-ES'
          );
          content += task.dueDate
            ? ` | Completada: ${completedDate}`
            : `Completada: ${completedDate}`;
        }
        content += '\n';
      }

      // Subtareas
      if (task.subtasks.length > 0) {
        content += '    Subtareas:\n';
        task.subtasks.forEach((subtask) => {
          const subtaskCheck = subtask.completed ? '✅' : '⬜';
          const subtaskName = subtask.completed
            ? `${subtask.name} (completada)`
            : subtask.name;

          const subtaskPriorityIndicator = subtask.priority ? '⭐ ' : '';
          content += `    • ${subtaskCheck} ${subtaskPriorityIndicator}${subtaskName}`;

          // Mostrar miembro asignado si existe
          if (subtask.assignedMember) {
            content += ` - Asignado: ${subtask.assignedMember.name}`;
          }

          content += '\n';
        });
      }

      // Errores
      if (task.errors.length > 0) {
        content += '    Errores/Problemas:\n';
        task.errors.forEach((error) => {
          content += `    ⚠️  ${error.name}\n`;
        });
      }

      content += '\n';
    });

    // Observaciones
    if (checklistData.observations && checklistData.observations.trim()) {
      content += 'OBSERVACIONES DEL DÍA:\n';
      content += '─'.repeat(30) + '\n';
      content += checklistData.observations.trim() + '\n\n';
    }

    // Pie de página
    content += '═'.repeat(50) + '\n';
    content += `📄 Copiado desde Checkliist - ${new Date().toLocaleString(
      'es-ES'
    )}\n`;

    return content;
  }
}
