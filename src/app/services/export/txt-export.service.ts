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
