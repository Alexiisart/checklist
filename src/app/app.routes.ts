import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'new-list',
    loadComponent: () =>
      import('./pages/new-list/new-list.component').then(
        (m) => m.NewListComponent
      ),
  },
  {
    path: 'checklist/:id',
    loadComponent: () =>
      import('./pages/checklist/checklist.component').then(
        (m) => m.ChecklistComponent
      ),
    canDeactivate: [UnsavedChangesGuard],
  },
  {
    path: 'checklist',
    loadComponent: () =>
      import('./pages/checklist/checklist.component').then(
        (m) => m.ChecklistComponent
      ),
    canDeactivate: [UnsavedChangesGuard],
  },
  {
    path: '**',
    redirectTo: '/home',
  },
];
