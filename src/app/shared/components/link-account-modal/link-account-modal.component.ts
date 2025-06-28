import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../../services/firebase/firebase-auth.service';
import { FirebaseMigrationService } from '../../../services/firebase/firebase-migration.service';
import { ToastService } from '../../../services/toast.service';
import { InputComponent } from '../../atomic/inputs/input.component';
import { ButtonComponent } from '../../atomic/buttons/button.component';

@Component({
  selector: 'app-link-account-modal',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  template: `
    <div class="modal" *ngIf="show" (click)="closeModal()">
      <div class="modal-overlay"></div>
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>☁️ Vincular a la Nube</h2>
          <app-button
            type="icon"
            iconLeft="close"
            size="sm"
            (clickEvent)="closeModal()"
          ></app-button>
        </div>

        <div class="modal-body">
          <!-- Botones de pestañas -->
          <div class="tabs">
            <app-button
              type="secondary"
              [extraClasses]="activeTab === 'login' ? 'active' : ''"
              text="Iniciar Sesión"
              size="sm"
              (clickEvent)="activeTab = 'login'"
            ></app-button>
            <app-button
              type="secondary"
              [extraClasses]="activeTab === 'register' ? 'active' : ''"
              text="Crear Cuenta"
              size="sm"
              (clickEvent)="activeTab = 'register'"
            ></app-button>
          </div>

          <!-- Login Form -->
          <div *ngIf="activeTab === 'login'" class="form-section">
            <app-input
              type="email"
              label="📧 Email"
              placeholder="tu@email.com"
              [value]="loginEmail"
              (valueChange)="loginEmail = $event"
              iconLeft="email"
            ></app-input>

            <app-input
              type="password"
              label="🔒 Contraseña"
              placeholder="Tu contraseña"
              [value]="loginPassword"
              (valueChange)="loginPassword = $event"
              iconLeft="lock"
            ></app-input>

            <app-button
              type="primary"
              text="{{ isLoading ? '🔄 Conectando...' : '🔑 Iniciar Sesión' }}"
              [fullWidth]="true"
              [loading]="isLoading"
              [disabled]="!loginEmail || !loginPassword || isLoading"
              (clickEvent)="onLogin()"
            ></app-button>
          </div>

          <!-- Register Form -->
          <div *ngIf="activeTab === 'register'" class="form-section">
            <app-input
              type="text"
              label="👤 Nombre"
              placeholder="Tu nombre completo"
              [value]="registerName"
              (valueChange)="registerName = $event"
              iconLeft="person"
            ></app-input>

            <app-input
              type="email"
              label="📧 Email"
              placeholder="tu@email.com"
              [value]="registerEmail"
              (valueChange)="registerEmail = $event"
              iconLeft="email"
            ></app-input>

            <app-input
              type="password"
              label="🔒 Contraseña"
              placeholder="Mínimo 6 caracteres"
              [value]="registerPassword"
              (valueChange)="registerPassword = $event"
              iconLeft="lock"
              helpText="Debe tener al menos 6 caracteres"
            ></app-input>

            <app-button
              type="primary"
              text="{{
                isLoading ? '🔄 Creando cuenta...' : '✨ Crear Cuenta'
              }}"
              [fullWidth]="true"
              [loading]="isLoading"
              [disabled]="
                !registerName ||
                !registerEmail ||
                !registerPassword ||
                registerPassword.length < 6 ||
                isLoading
              "
              (clickEvent)="onRegister()"
            ></app-button>
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <p>🔒 Tus datos estarán seguros y privados</p>
            <p>🔄 Sincronización automática entre dispositivos</p>
            <p>📱 Acceso desde cualquier lugar</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./link-account-modal.component.css'],
})
export class LinkAccountModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  activeTab: 'login' | 'register' = 'register';
  isLoading = false;

  // Login datos
  loginEmail = '';
  loginPassword = '';

  // Register datos
  registerName = '';
  registerEmail = '';
  registerPassword = '';

  constructor(
    private authService: FirebaseAuthService,
    private migrationService: FirebaseMigrationService,
    private toastService: ToastService
  ) {}

  async onLogin(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) return;

    this.isLoading = true;
    try {
      await this.authService.signIn(this.loginEmail, this.loginPassword);
      this.toastService.showAlert('¡Sesión iniciada correctamente!', 'success');
      this.closeModal();
    } catch (error: any) {
      console.error('Error en login:', error);
      this.toastService.showAlert(
        'Error al iniciar sesión: ' + error.message,
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    if (!this.registerName || !this.registerEmail || !this.registerPassword)
      return;
    if (this.registerPassword.length < 6) return;

    this.isLoading = true;
    try {
      await this.authService.createAccount(
        this.registerEmail, // email
        this.registerPassword, // password
        this.registerName, // username
        this.registerName // displayName
      );
      // Obtener el usuario actual para la migración
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        await this.migrationService.migrateAllDataToFirebase(currentUser.uid);
      }
      this.toastService.showAlert(
        '¡Cuenta creada y datos migrados exitosamente!',
        'success'
      );
      this.closeModal();
    } catch (error: any) {
      console.error('Error en registro:', error);
      this.toastService.showAlert(
        'Error al crear cuenta: ' + error.message,
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  closeModal(): void {
    if (this.isLoading) return;

    // Limpiar formularios
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerEmail = '';
    this.registerPassword = '';

    this.close.emit();
  }
}
