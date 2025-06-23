import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesGuard
  implements CanDeactivate<CanComponentDeactivate>
{
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Si el componente tiene su propia lógica de deactivación, úsala
    if (component.canDeactivate) {
      return component.canDeactivate();
    }

    // Por defecto, permitir la navegación
    // Cada componente maneja sus propias confirmaciones como en el original
    return true;
  }
}
