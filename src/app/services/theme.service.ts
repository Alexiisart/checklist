import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio para gestionar el tema de la aplicación.
 * Permite alternar entre tema claro y oscuro, y persiste la preferencia del usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** Subject que mantiene el estado del tema oscuro */
  private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  /** Observable público del estado del tema */
  public isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  /**
   * Inicializa el tema de la aplicación.
   * Usa tema claro por defecto, o el tema guardado en localStorage.
   */
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.setTheme(savedTheme === 'dark');
    } else {
      // Usar tema claro por defecto
      this.setTheme(false);
    }
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkThemeSubject.value;
    this.setTheme(newTheme);
  }

  /**
   * Establece el tema de la aplicación
   * @param isDark - true para tema oscuro, false para tema claro
   */
  setTheme(isDark: boolean): void {
    this.isDarkThemeSubject.next(isDark);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Obtiene el tema actual de la aplicación
   * @returns 'dark' si el tema es oscuro, 'light' si es claro
   */
  getCurrentTheme(): string {
    return this.isDarkThemeSubject.value ? 'dark' : 'light';
  }
}
