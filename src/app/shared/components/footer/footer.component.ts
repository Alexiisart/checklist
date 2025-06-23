import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ThemeService } from '../../../services/theme.service';

/**
 * Componente del footer de la aplicación
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <span class="powered-text">powered by</span>
        <img [src]="xSrc" alt="X" class="x-logo" />
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnDestroy {
  /** Indica si el tema actual es oscuro */
  isDarkTheme = false;

  /** Subject para manejar la limpieza de suscripciones */
  private destroy$ = new Subject<void>();

  /** Ruta del logo X según el tema */
  get xSrc(): string {
    return this.isDarkTheme ? 'assets/x-dark.svg' : 'assets/x.svg';
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
   * Método del ciclo de vida que se ejecuta al destruir el componente.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
