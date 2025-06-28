/**
 * Componente principal de la aplicación.
 */
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { StorageIndicatorComponent } from './shared/components/storage-indicator/storage-indicator.component';
import { SharedUrlLoaderService } from './services/external/shared-url-loader.service';
import { FirebaseSyncService } from './services/firebase/firebase-sync.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    StorageIndicatorComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  /** Título de la aplicación */
  title = 'checklist-diary';

  constructor(
    private sharedUrlLoaderService: SharedUrlLoaderService,
    private firebaseSyncService: FirebaseSyncService
  ) {}

  ngOnInit(): void {
    // Inicializar sincronización automática con Firebase
    this.firebaseSyncService.initialize();

    // Verificar si hay una URL compartida al inicializar (con delay para router)
    setTimeout(() => {
      this.sharedUrlLoaderService.checkAndLoadSharedUrl();
    }, 100);
  }
}
