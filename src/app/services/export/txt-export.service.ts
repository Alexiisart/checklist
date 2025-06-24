import { Injectable } from '@angular/core';
import { ChecklistData } from '../../models/task.interface';

/**
 * Servicio para exportar listas de tareas a formato TXT.
 * Genera un archivo de texto descargable con formato limpio y legible.
 */
@Injectable({
  providedIn: 'root',
})
export class TxtExportService {
  /**
   * Exporta los datos de una lista de tareas a formato TXT.
   * Genera un archivo de texto descargable con formato estructurado.
   * @param checklistData Datos de la lista de tareas a exportar
   */
  exportToTXT(checklistData: ChecklistData): void {
    const txtContent = this.generateTxtContent(checklistData);
    this.downloadTxtFile(txtContent, checklistData.name || 'Lista');
  }

  /**
   * Exporta solo las tareas que tienen subtareas a formato TXT.
   * Genera un archivo de texto descargable con formato estructurado solo para tareas con subtareas.
   * @param checklistData Datos de la lista de tareas a exportar
   */
  exportTasksWithSubtasksToTXT(checklistData: ChecklistData): void {
    const txtContent = this.generateTasksWithSubtasksContent(checklistData);
    const fileName = `${checklistData.name || 'Lista'}_Subtareas`;
    this.downloadTxtFile(txtContent, fileName);
  }

  /**
   * Exporta una tarea específica con sus subtareas a formato TXT.
   * @param checklistData Datos de la lista completa
   * @param taskId ID de la tarea específica a exportar
   */
  exportSingleTaskToTXT(checklistData: ChecklistData, taskId: number): void {
    const txtContent = this.generateSingleTaskContent(checklistData, taskId);
    const task = checklistData.tasks.find((t) => t.id === taskId);
    const taskName = task?.name || 'Tarea';
    const fileName = `${taskName.replace(/[^a-zA-Z0-9\s-_]/g, '').trim()}`;
    this.downloadTxtFile(txtContent, fileName);
  }

  /**
   * Genera el contenido del archivo TXT con formato estructurado.
   * @param checklistData Datos de la lista de tareas
   * @returns Contenido del archivo TXT formateado
   */
  private generateTxtContent(checklistData: ChecklistData): string {
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
    content += '📝 CHECKLIST DIARIO\n';
    content += '═'.repeat(50) + '\n\n';
    content += `📅 Fecha: ${currentDate}\n`;
    content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n`;
    content += `✅ Progreso: ${completedTasks} de ${totalTasks} tareas completadas (${progressPercentage}%)\n\n`;

    // Tareas
    content += 'TAREAS:\n';
    content += '─'.repeat(30) + '\n\n';

    checklistData.tasks.forEach((task, index) => {
      const taskNumber = (index + 1).toString().padStart(2, '0');
      const checkmark = task.completed ? '✅' : '⬜';
      const taskName = task.completed ? `${task.name} (COMPLETADA)` : task.name;

      content += `${taskNumber}. ${checkmark} ${taskName}\n`;

      // Subtareas
      if (task.subtasks.length > 0) {
        content += '    Subtareas:\n';
        task.subtasks.forEach((subtask) => {
          const subtaskCheck = subtask.completed ? '✅' : '⬜';
          const subtaskName = subtask.completed
            ? `${subtask.name} (completada)`
            : subtask.name;
          content += `    • ${subtaskCheck} ${subtaskName}\n`;
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
    content += `📄 Exportado desde Checklist Diario - ${new Date().toLocaleString(
      'es-ES'
    )}\n`;

    return content;
  }

  /**
   * Genera el contenido del archivo TXT solo con tareas que tienen subtareas.
   * @param checklistData Datos de la lista de tareas
   * @returns Contenido del archivo TXT formateado solo con tareas que tienen subtareas
   */
  private generateTasksWithSubtasksContent(
    checklistData: ChecklistData
  ): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Filtrar solo tareas que tienen subtareas
    const tasksWithSubtasks = checklistData.tasks.filter(
      (task) => task.subtasks.length > 0
    );

    if (tasksWithSubtasks.length === 0) {
      // Si no hay tareas con subtareas, devolver mensaje informativo
      let content = '';
      content += '📝 CHECKLIST DIARIO - SUBTAREAS\n';
      content += '═'.repeat(50) + '\n\n';
      content += `📅 Fecha: ${currentDate}\n`;
      content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n\n`;
      content += '⚠️  NO HAY TAREAS CON SUBTAREAS EN ESTA LISTA\n\n';
      content +=
        'Esta lista no contiene tareas que tengan subtareas definidas.\n';
      content +=
        'Para exportar la lista completa, usa la opción "Exportar TXT".\n\n';
      content += '═'.repeat(50) + '\n';
      content += `📄 Exportado desde Checklist Diario - ${new Date().toLocaleString(
        'es-ES'
      )}\n`;
      return content;
    }

    const completedTasksWithSubtasks = tasksWithSubtasks.filter(
      (task) => task.completed
    ).length;
    const totalTasksWithSubtasks = tasksWithSubtasks.length;
    const progressPercentage =
      totalTasksWithSubtasks > 0
        ? Math.round(
            (completedTasksWithSubtasks / totalTasksWithSubtasks) * 100
          )
        : 0;

    let content = '';

    // Encabezado
    content += '📝 CHECKLIST DIARIO - SUBTAREAS\n';
    content += '═'.repeat(50) + '\n\n';
    content += `📅 Fecha: ${currentDate}\n`;
    content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n`;
    content += `🔸 Tareas con subtareas: ${completedTasksWithSubtasks} de ${totalTasksWithSubtasks} completadas (${progressPercentage}%)\n`;
    content += `📊 Total de tareas en la lista: ${checklistData.tasks.length}\n\n`;

    // Tareas con subtareas
    content += 'TAREAS CON SUBTAREAS:\n';
    content += '─'.repeat(30) + '\n\n';

    tasksWithSubtasks.forEach((task, index) => {
      const taskNumber = (index + 1).toString().padStart(2, '0');
      const checkmark = task.completed ? '✅' : '⬜';
      const taskName = task.completed ? `${task.name} (COMPLETADA)` : task.name;

      content += `${taskNumber}. ${checkmark} ${taskName}\n`;

      // Estadísticas de subtareas
      const completedSubtasks = task.subtasks.filter(
        (st) => st.completed
      ).length;
      const totalSubtasks = task.subtasks.length;
      const subtaskProgress =
        totalSubtasks > 0
          ? Math.round((completedSubtasks / totalSubtasks) * 100)
          : 0;

      content += `    📈 Progreso subtareas: ${completedSubtasks}/${totalSubtasks} (${subtaskProgress}%)\n`;

      // Subtareas
      content += '    Subtareas:\n';
      task.subtasks.forEach((subtask, subIndex) => {
        const subtaskCheck = subtask.completed ? '✅' : '⬜';
        const subtaskName = subtask.completed
          ? `${subtask.name} (completada)`
          : subtask.name;
        const subNumber = (subIndex + 1).toString().padStart(2, '0');
        content += `    ${subNumber}. ${subtaskCheck} ${subtaskName}\n`;
      });

      // Errores (solo si existen)
      if (task.errors.length > 0) {
        content += '    Errores/Problemas:\n';
        task.errors.forEach((error, errorIndex) => {
          const errorNumber = (errorIndex + 1).toString().padStart(2, '0');
          content += `    ${errorNumber}. ⚠️  ${error.name}\n`;
        });
      }

      content += '\n';
    });

    // Resumen
    content += 'RESUMEN:\n';
    content += '─'.repeat(30) + '\n';
    content += `• Total de tareas con subtareas: ${totalTasksWithSubtasks}\n`;
    content += `• Tareas con subtareas completadas: ${completedTasksWithSubtasks}\n`;
    content += `• Tareas con subtareas pendientes: ${
      totalTasksWithSubtasks - completedTasksWithSubtasks
    }\n`;

    const totalSubtasks = tasksWithSubtasks.reduce(
      (sum, task) => sum + task.subtasks.length,
      0
    );
    const completedSubtasks = tasksWithSubtasks.reduce(
      (sum, task) => sum + task.subtasks.filter((st) => st.completed).length,
      0
    );

    content += `• Total de subtareas: ${totalSubtasks}\n`;
    content += `• Subtareas completadas: ${completedSubtasks}\n`;
    content += `• Subtareas pendientes: ${
      totalSubtasks - completedSubtasks
    }\n\n`;

    // Observaciones (solo si existen)
    if (checklistData.observations && checklistData.observations.trim()) {
      content += 'OBSERVACIONES DEL DÍA:\n';
      content += '─'.repeat(30) + '\n';
      content += checklistData.observations.trim() + '\n\n';
    }

    // Pie de página
    content += '═'.repeat(50) + '\n';
    content += `📄 Exportado desde Checklist Diario - ${new Date().toLocaleString(
      'es-ES'
    )}\n`;

    return content;
  }

  /**
   * Genera el contenido del archivo TXT para una tarea específica.
   * @param checklistData Datos de la lista completa
   * @param taskId ID de la tarea específica
   * @returns Contenido del archivo TXT formateado para la tarea específica
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
      // Si no se encuentra la tarea, devolver mensaje de error
      let content = '';
      content += '📝 CHECKLIST DIARIO - TAREA INDIVIDUAL\n';
      content += '═'.repeat(50) + '\n\n';
      content += `📅 Fecha: ${currentDate}\n`;
      content += `📋 Lista: ${checklistData.name || 'Lista sin nombre'}\n\n`;
      content += '❌ ERROR: TAREA NO ENCONTRADA\n\n';
      content += `La tarea con ID ${taskId} no fue encontrada en la lista.\n\n`;
      content += '═'.repeat(50) + '\n';
      content += `📄 Exportado desde Checklist Diario - ${new Date().toLocaleString(
        'es-ES'
      )}\n`;
      return content;
    }

    let content = '';

    // Encabezado
    content += '📝 CHECKLIST DIARIO - TAREA INDIVIDUAL\n';
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
    content += `${checkmark} ${task.name}\n`;

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
        content += `${subNumber}. ${subtaskCheck} ${subtaskName}\n`;
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

    // Observaciones generales (si existen)
    if (checklistData.observations && checklistData.observations.trim()) {
      content += 'OBSERVACIONES GENERALES DE LA LISTA:\n';
      content += '─'.repeat(40) + '\n';
      content += checklistData.observations.trim() + '\n\n';
    }

    // Pie de página
    content += '═'.repeat(50) + '\n';
    content += `📄 Exportado desde Checklist Diario - ${new Date().toLocaleString(
      'es-ES'
    )}\n`;

    return content;
  }

  /**
   * Crea y descarga un archivo TXT con el contenido proporcionado.
   * @param content Contenido del archivo TXT
   * @param fileName Nombre base del archivo (sin extensión)
   */
  private downloadTxtFile(content: string, fileName: string): void {
    try {
      // Crear blob con el contenido
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

      // Crear URL temporal
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;

      // Generar nombre de archivo con fecha
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const sanitizedFileName = fileName
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .trim();
      link.download = `${sanitizedFileName}_${dateStr}.txt`;

      // Agregar al DOM temporalmente y hacer clic
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo TXT:', error);
      throw new Error('Error al generar el archivo TXT');
    }
  }
}
