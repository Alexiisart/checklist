import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';
import { ButtonComponent } from '../../atomic/buttons';

/**
 * Componente que representa el encabezado de la aplicación.
 * Permite cambiar entre tema claro y oscuro.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <header class="header">
      <div class="header-content">
        <app-button
          type="icon"
          iconLeft="{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}"
          size="sm"
          title="Cambiar tema"
          extraClasses="theme-toggle"
          (clickEvent)="toggleTheme()"
        >
        </app-button>
        <div class="header-text">
          <div class="logo-container">
            <img [src]="logoSrc" alt="CheckList Diario" class="main-logo" />
            <div class="logo-text">
              <h1>Checklist Diario</h1>
              <p class="subtitle">Organiza tus pendientes del día</p>
            </div>
            <img [src]="sublogoSrc" alt="" class="sub-logo" />
          </div>
        </div>
        <div class="spacer"></div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnDestroy {
  /** Indica si el tema actual es oscuro */
  isDarkTheme = false;

  /** Subject para manejar la limpieza de suscripciones */
  private destroy$ = new Subject<void>();

  /** Rutas de los logos según el tema */
  get logoSrc(): string {
    return this.isDarkTheme ? 'assets/logo-dark.svg' : 'assets/logo.svg';
  }

  get sublogoSrc(): string {
    return this.isDarkTheme ? 'assets/sublogo-dark.svg' : 'assets/sublogo.svg';
  }

  /**
   * Constructor del componente.
   * @param themeService Servicio para gestionar el tema de la aplicación
   */
  constructor(private themeService: ThemeService) {
    this.themeService.isDarkTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDark) => (this.isDarkTheme = isDark));
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Método del ciclo de vida que se ejecuta al destruir el componente.
   * Limpia las suscripciones para evitar memory leaks.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
