import { Injectable } from '@angular/core';
import { ChecklistData } from '../../models/task.interface';

/**
 * Servicio para exportar listas de tareas a PDF mediante la funcionalidad de impresión del navegador.
 */
@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  /**
   * Exporta los datos de una lista de tareas a PDF.
   * Crea una vista de impresión y activa el diálogo de impresión del navegador.
   * @param checklistData Datos de la lista de tareas a exportar
   */
  exportToPDF(checklistData: ChecklistData): void {
    // Crear elementos para la impresión
    this.addPrintStyles();
    this.addPrintContent(checklistData);

    // Disparar la impresión
    setTimeout(() => {
      window.print();
      // Limpiar después de la impresión
      this.cleanupPrintContent();
    }, 100);
  }

  /**
   * Agrega los estilos CSS necesarios para la impresión.
   * Crea un elemento style con los estilos específicos para la vista de impresión.
   */
  private addPrintStyles(): void {
    const existingStyle = document.getElementById('print-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        
        #print-content,
        #print-content * {
          visibility: visible;
        }
        
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          color: black;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        
        .print-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .print-date {
          font-size: 14px;
          color: #666;
        }
        
        .print-list-name {
          font-size: 18px;
          font-weight: 600;
          margin: 20px 0 15px 0;
          color: #333;
        }
        
        .print-task {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        
        .print-task-completed {
          background-color: #f0f0f0;
          opacity: 0.7;
        }
        
        .print-task-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .print-checkbox {
          margin-right: 10px;
          font-size: 18px;
          color: #10b981;
          font-weight: bold;
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }
        
        .print-checkbox.checked {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        
        .print-checkbox-unchecked {
          margin-right: 10px;
          font-size: 18px;
          color: #6b7280;
          font-weight: bold;
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          background: white;
        }
        
        .print-task-name {
          font-weight: 500;
          font-size: 16px;
        }
        
        .print-task-completed .print-task-name {
          text-decoration: line-through;
        }
        
        .print-subtasks {
          margin-left: 25px;
          margin-top: 8px;
        }
        
        .print-subtask {
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }
        
        .print-subtask-checkbox {
          margin-right: 8px;
          font-size: 14px;
          color: #10b981;
          font-weight: bold;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          background: white;
        }
        
        .print-subtask-checkbox.checked {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        
        .print-subtask-checkbox-unchecked {
          margin-right: 8px;
          font-size: 14px;
          color: #6b7280;
          font-weight: bold;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          border-radius: 3px;
          background: white;
        }
        
        .print-subtask-text {
          font-size: 14px;
        }
        
        .print-subtask-completed {
          text-decoration: line-through;
          color: #666;
        }
        
        .print-errors {
          margin-left: 25px;
          margin-top: 8px;
        }
        
        .print-error {
          background-color: #fff2f2;
          border-left: 3px solid #dc3545;
          padding: 5px 8px;
          margin-bottom: 5px;
          font-size: 14px;
          color: #dc3545;
        }
        
        .print-observations {
          margin-top: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        
        .print-observations-title {
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .print-observations-text {
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        .print-progress {
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        
        .print-progress-text {
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .print-progress-bar {
          background-color: #e9ecef;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .print-progress-fill {
          background-color: #74b9ff;
          height: 100%;
          border-radius: 4px;
        }
      }
    `;

    document.head.appendChild(printStyles);
  }

  /**
   * Agrega el contenido HTML que se mostrará en la vista de impresión.
   * Genera una representación visual de la lista de tareas con todos sus elementos.
   * @param checklistData Datos de la lista de tareas a mostrar
   */
  private addPrintContent(checklistData: ChecklistData): void {
    const existingContent = document.getElementById('print-content');
    if (existingContent) {
      existingContent.remove();
    }

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
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    let printHTML = `
      <div id="print-content">
        <div class="print-header">
          <div class="print-title">📝 Checkliist</div>
          <div class="print-date">Generado el: ${currentDate}</div>
        </div>
        
        <div class="print-list-name">${
          checklistData.name || 'Lista sin nombre'
        }</div>
        
        <div class="print-progress">
          <div class="print-progress-text">Progreso: ${completedTasks} de ${totalTasks} tareas completadas</div>
          <div class="print-progress-bar">
            <div class="print-progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
        
        <div class="print-tasks">
    `;

    checklistData.tasks.forEach((task) => {
      const taskClass = task.completed
        ? 'print-task print-task-completed'
        : 'print-task';
      const taskNameClass = task.completed
        ? 'print-task-name'
        : 'print-task-name';

      printHTML += `
        <div class="${taskClass}">
          <div class="print-task-header">
            <span class="${
              task.completed
                ? 'print-checkbox checked'
                : 'print-checkbox-unchecked'
            }">${task.completed ? '✓' : ''}</span>
            <span class="${taskNameClass}">${task.name}</span>
          </div>
      `;

      if (task.subtasks.length > 0) {
        printHTML += '<div class="print-subtasks">';
        task.subtasks.forEach((subtask) => {
          const subtaskTextClass = subtask.completed
            ? 'print-subtask-text print-subtask-completed'
            : 'print-subtask-text';
          printHTML += `
            <div class="print-subtask">
              <span class="${
                subtask.completed
                  ? 'print-subtask-checkbox checked'
                  : 'print-subtask-checkbox-unchecked'
              }">${subtask.completed ? '✓' : ''}</span>
              <span class="${subtaskTextClass}">${subtask.name}</span>
            </div>
          `;
        });
        printHTML += '</div>';
      }

      if (task.errors.length > 0) {
        printHTML += '<div class="print-errors">';
        task.errors.forEach((error) => {
          printHTML += `<div class="print-error">⚠️ ${error.name}</div>`;
        });
        printHTML += '</div>';
      }

      printHTML += '</div>';
    });

    printHTML += '</div>';

    if (checklistData.observations && checklistData.observations.trim()) {
      printHTML += `
        <div class="print-observations">
          <div class="print-observations-title">📝 Observaciones del día:</div>
          <div class="print-observations-text">${checklistData.observations}</div>
        </div>
      `;
    }

    printHTML += '</div>';

    const printContent = document.createElement('div');
    printContent.innerHTML = printHTML;
    document.body.appendChild(printContent);
  }

  /**
   * Limpia los elementos creados para la impresión.
   * Elimina los estilos y el contenido HTML generados.
   */
  private cleanupPrintContent(): void {
    const printContent = document.getElementById('print-content');
    const printStyles = document.getElementById('print-styles');

    if (printContent) {
      printContent.remove();
    }

    if (printStyles) {
      printStyles.remove();
    }
  }
}
