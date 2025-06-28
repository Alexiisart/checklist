import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChecklistData } from '../../models/task.interface';
import { StorageService } from '../storage.service';

/**
 * Interfaz para los datos del modal de comparación
 */
export interface ComparisonModalData {
  show: boolean;
  sharedList: ChecklistData;
  existingList: ChecklistData;
}

/**
 * Servicio para manejar la comparación de listas compartidas con listas existentes por nombre
 * Si encuentra una lista con el mismo nombre, muestra modal para decidir actualizar o crear copia
 */
@Injectable({
  providedIn: 'root',
})
export class SharedListComparisonService {
  private comparisonModalSubject = new BehaviorSubject<ComparisonModalData>({
    show: false,
    sharedList: {} as ChecklistData,
    existingList: {} as ChecklistData,
  });

  public comparisonModal$: Observable<ComparisonModalData> =
    this.comparisonModalSubject.asObservable();

  constructor(private storageService: StorageService) {}

  /**
   * Verifica si existe una lista con el mismo nombre que la lista compartida
   * @param sharedList Lista compartida a verificar
   * @returns Lista existente si la encuentra, null si no existe
   */
  findExistingListByName(sharedList: ChecklistData): ChecklistData | null {
    const savedLists = this.storageService.getSavedLists();

    // Buscar una lista con el mismo nombre (sin el sufijo "(Compartida)")
    const listName = sharedList.name
      ?.replace(/\s*\(Compartida\)\s*$/, '')
      .trim();

    const existingSavedList = savedLists.find((savedList) => {
      // También remover el sufijo "(Compartida)" de la lista guardada para comparar
      const savedListName = savedList.name
        ?.replace(/\s*\(Compartida\)\s*$/i, '')
        .trim();

      return savedListName.toLowerCase() === listName?.toLowerCase();
    });

    if (existingSavedList) {
      return this.storageService.loadList(existingSavedList.id);
    }

    return null;
  }

  /**
   * Muestra el modal de comparación si encuentra una lista con el mismo nombre
   * @param sharedList Lista compartida
   * @param existingList Lista existente
   */
  showComparisonModal(
    sharedList: ChecklistData,
    existingList: ChecklistData
  ): void {
    const modalData = {
      show: true,
      sharedList,
      existingList,
    };

    this.comparisonModalSubject.next(modalData);
  }

  /**
   * Cierra el modal de comparación
   */
  closeComparisonModal(): void {
    this.comparisonModalSubject.next({
      show: false,
      sharedList: {} as ChecklistData,
      existingList: {} as ChecklistData,
    });
  }

  /**
   * Obtiene los datos actuales del modal de comparación
   */
  getCurrentModalData(): ComparisonModalData {
    return this.comparisonModalSubject.value;
  }
}
