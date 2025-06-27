import { Injectable } from '@angular/core';
import { ChecklistService } from '../../checklist.service';
import { ToastService } from '../../toast.service';
import { BehaviorSubject } from 'rxjs';
import {
  TeamMember,
  ModalData,
  ChecklistData,
} from '../../../models/task.interface';

/**
 * Servicio para manejar las funciones relacionadas con equipo de la lista completa
 */
@Injectable({
  providedIn: 'root',
})
export class ChecklistTeamService {
  // Subject para manejar el estado del modal de gestión de equipo
  private _showTeamModal$ = new BehaviorSubject<boolean>(false);
  private _teamModalData$ = new BehaviorSubject<ModalData | null>(null);

  // Mapa para manejar la visibilidad del dropdown de líder por tarea
  private _activeLeaderDropdown$ = new BehaviorSubject<number | null>(null);

  // Observables públicos
  public readonly showTeamModal$ = this._showTeamModal$.asObservable();
  public readonly teamModalData$ = this._teamModalData$.asObservable();
  public readonly activeLeaderDropdown$ =
    this._activeLeaderDropdown$.asObservable();

  constructor(
    private checklistService: ChecklistService,
    private toastService: ToastService
  ) {}

  /**
   * Muestra el modal para gestionar el equipo de la lista
   */
  showManageTeamModal(): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const currentTeamNames =
      currentList.team?.map((member: TeamMember) => member.name).join(', ') ||
      '';

    this._teamModalData$.next({
      title: 'Gestionar Equipo',
      label: 'Nombres de los miembros del equipo (separados por comas):',
      placeholder: 'Ejemplo: Juan Pérez, María González, Carlos Silva',
      currentValue: currentTeamNames,
    });

    this._showTeamModal$.next(true);
  }

  /**
   * Confirma la actualización del equipo de la lista
   */
  confirmTeamUpdate(teamNamesString: string): void {
    const currentList = this.getCurrentList();
    if (!currentList) return;

    const teamNames = teamNamesString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    // Preservar IDs existentes para miembros que ya están en el equipo
    const currentTeam = currentList.team || [];
    const team: TeamMember[] = teamNames.map((name, index) => {
      // Buscar si el miembro ya existe en el equipo actual
      const existingMember = currentTeam.find(
        (m) => m.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (existingMember) {
        // Preservar el ID existente pero actualizar el nombre (por si hay cambios de mayúsculas/espacios)
        return {
          id: existingMember.id,
          name: name,
        };
      } else {
        // Crear nuevo miembro con ID único
        return {
          id: Date.now() + Math.random() + index, // ID más único
          name: name,
        };
      }
    });

    this.updateListTeam(team);
    this.closeTeamModal();

    if (team.length > 0) {
      this.toastService.showAlert(
        `Equipo actualizado: ${team.length} miembros`,
        'success'
      );
    } else {
      this.toastService.showAlert('Equipo removido', 'info');
    }
  }

  /**
   * Cierra el modal de gestión de equipo
   */
  closeTeamModal(): void {
    this._showTeamModal$.next(false);
    this._teamModalData$.next(null);
  }

  /**
   * Alterna la visibilidad del dropdown de líder para una tarea específica
   */
  toggleLeaderDropdown(taskId: number): void {
    const currentActiveId = this._activeLeaderDropdown$.value;
    if (currentActiveId === taskId) {
      this._activeLeaderDropdown$.next(null);
    } else {
      this._activeLeaderDropdown$.next(taskId);
    }
  }

  /**
   * Cierra el dropdown de líder
   */
  closeLeaderDropdown(): void {
    this._activeLeaderDropdown$.next(null);
  }

  /**
   * Verifica si el dropdown está activo para una tarea específica
   */
  isLeaderDropdownActive(taskId: number): boolean {
    return this._activeLeaderDropdown$.value === taskId;
  }

  /**
   * Actualiza el equipo de la lista
   */
  updateListTeam(team: TeamMember[]): void {
    const currentList = this.getCurrentList();
    if (currentList) {
      const previousTeam = currentList.team || [];
      currentList.team = team;

      // Solo limpiar asignaciones si un miembro fue completamente eliminado del equipo
      // (no si solo cambió de nombre)
      currentList.tasks.forEach((task) => {
        if (task.leader) {
          // Verificar si el líder actual todavía existe en el nuevo equipo
          const leaderStillExists = team.find((m) => m.id === task.leader!.id);
          if (!leaderStillExists) {
            // Solo limpiar si el miembro fue eliminado completamente
            const leaderExistedBefore = previousTeam.find(
              (m) => m.id === task.leader!.id
            );
            if (leaderExistedBefore) {
              task.leader = null;
            }
          }
        }

        task.subtasks.forEach((subtask) => {
          if (subtask.assignedMember) {
            // Verificar si el miembro asignado todavía existe en el nuevo equipo
            const memberStillExists = team.find(
              (m) => m.id === subtask.assignedMember!.id
            );
            if (!memberStillExists) {
              // Solo limpiar si el miembro fue eliminado completamente
              const memberExistedBefore = previousTeam.find(
                (m) => m.id === subtask.assignedMember!.id
              );
              if (memberExistedBefore) {
                subtask.assignedMember = null;
              }
            }
          }
        });
      });

      this.updateListInService();
    }
  }

  /**
   * Actualiza el líder de una tarea
   */
  updateTaskLeader(taskId: number, leader: TeamMember | null): void {
    const currentList = this.getCurrentList();
    if (currentList) {
      const task = currentList.tasks.find((t) => t.id === taskId);
      if (task) {
        task.leader = leader;
        this.updateListInService();

        const leaderName = leader ? leader.name : 'ninguno';
        this.toastService.showAlert(
          `Líder actualizado: ${leaderName}`,
          'success'
        );
      }
    }
    this.closeLeaderDropdown();
  }

  /**
   * Asigna un miembro a una subtarea
   */
  assignMemberToSubtask(
    taskId: number,
    subtaskId: number,
    member: TeamMember | null
  ): void {
    const currentList = this.getCurrentList();

    if (currentList) {
      const task = currentList.tasks.find((t) => t.id === taskId);

      if (task) {
        const subtask = task.subtasks.find((s) => s.id === subtaskId);

        if (subtask) {
          subtask.assignedMember = member;
          this.updateListInService();

          const memberName = member ? member.name : 'nadie';
          this.toastService.showAlert(
            `Subtarea asignada a: ${memberName}`,
            'success'
          );
        } else {
          console.error('❌ Subtask not found:', subtaskId);
        }
      } else {
        console.error('❌ Task not found:', taskId);
      }
    } else {
      console.error('❌ Current list not found');
    }
  }

  /**
   * Obtiene los miembros del equipo de la lista
   */
  getListTeamMembers(): TeamMember[] {
    const currentList = this.getCurrentList();
    return currentList?.team || [];
  }

  /**
   * Verifica si la lista tiene equipo configurado
   */
  hasTeam(): boolean {
    const currentList = this.getCurrentList();
    return !!(currentList?.team && currentList.team.length > 0);
  }

  /**
   * Obtiene la lista actual
   */
  private getCurrentList(): ChecklistData | null {
    // Usar getValue() del BehaviorSubject para obtener el valor actual directamente
    return this.checklistService['currentListSubject'].getValue();
  }

  /**
   * Actualiza la lista en el servicio principal
   */
  private updateListInService(): void {
    const currentList = this.getCurrentList();

    if (currentList) {
      // Usar la función updateList del ChecklistService que maneja todo automáticamente
      this.checklistService['updateList'](currentList);
    } else {
      console.error('❌ No se pudo actualizar: currentList es null');
    }
  }
}
