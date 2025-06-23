# 📝 Checklist Diario - Angular

Una aplicación web moderna y elegante para gestionar tareas diarias, construida con Angular 18+ y diseño minimalista.

## ✨ Características Principales

### 🎯 **Gestión de Tareas Avanzada**

- ✅ Creación rápida de listas mediante texto separado por comas
- ✅ Sistema de subtareas con auto-completado inteligente
- ✅ Registro y gestión de errores por tarea
- ✅ Edición completa de todos los elementos sin pérdida de datos
- ✅ Eliminación con confirmación de seguridad

### 💾 **Persistencia y Almacenamiento**

- 📦 Múltiples listas guardadas con metadata
- 🔄 Auto-guardado en localStorage
- 📊 Indicador de uso de espacio de almacenamiento
- 🗑️ Gestión inteligente de límites de almacenamiento

### 🎨 **Experiencia de Usuario**

- 🌙 Tema claro/oscuro con persistencia
- 📱 Diseño completamente responsive
- ⚡ Animaciones suaves y micro-interacciones
- 🖨️ Exportación a PDF optimizada para impresión
- 🎯 Indicadores de progreso visuales

### 🏗️ **Arquitectura Moderna**

- 🔧 Angular 18+ con Standalone Components
- 📦 Servicios modulares y reutilizables
- 🔄 Reactive Programming con RxJS
- 💪 TypeScript con tipado estricto
- 🎯 Lazy Loading de rutas

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 18.x
```

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd checklist-diary

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Compilar para producción
ng build --prod
```

### Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Compilación de producción
npm run test       # Ejecutar tests
npm run lint       # Análisis de código
npm run e2e        # Tests end-to-end
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── models/                     # Interfaces y tipos TypeScript
│   │   └── task.interface.ts       # Modelos de datos principales
│   ├── services/                   # Servicios de negocio
│   │   ├── checklist.service.ts    # Lógica principal de checklist
│   │   ├── storage.service.ts      # Gestión de localStorage
│   │   ├── theme.service.ts        # Control de temas
│   │   └── pdf-export.service.ts   # Exportación a PDF
│   ├── shared/                     # Componentes compartidos
│   │   └── components/
│   │       ├── header/             # Header con toggle de tema
│   │       ├── modal/              # Modal genérico
│   │       ├── confirm-modal/      # Modal de confirmación
│   │       ├── alert-modal/        # Modal de alertas
│   │       └── task-item/          # Componente de tarea individual
│   ├── pages/                      # Páginas principales
│   │   ├── home/                   # Lista de checklists guardados
│   │   ├── new-list/               # Creación de nueva lista
│   │   └── checklist/              # Vista principal del checklist
│   ├── app.component.*             # Componente raíz
│   ├── app.routes.ts               # Configuración de rutas
│   └── app.config.ts               # Configuración de la app
├── styles.css                      # Estilos globales
└── index.html                      # HTML principal
```

## 🔧 Servicios Principales

### ChecklistService

Servicio principal que maneja toda la lógica de negocio de las tareas:

- Creación y gestión de listas
- Operaciones CRUD en tareas, subtareas y errores
- Estado reactivo con BehaviorSubject
- Auto-guardado y persistencia

### StorageService

Gestión del almacenamiento local:

- Guardado/carga de listas completas
- Índice de listas guardadas
- Control de límites de almacenamiento
- Generación de IDs únicos

### ThemeService

Control del tema de la aplicación:

- Toggle entre tema claro/oscuro
- Persistencia de preferencias
- Detección automática del tema del sistema

### PdfExportService

Exportación profesional a PDF:

- Generación dinámica de contenido para impresión
- Estilos optimizados para PDF
- Inclusión de progreso, tareas, subtareas y observaciones

## 🎮 Uso de la Aplicación

### 1. Crear Nueva Lista

1. Hacer clic en "Nueva Lista" desde la página principal
2. Escribir tareas separadas por comas: `Cliente, Vehículos, Reclamos`
3. Presionar "Generar Checklist" o Enter

### 2. Gestionar Tareas

- **Completar**: Marcar checkbox de la tarea
- **Agregar Subtarea**: Botón "Subtarea" → modal para escribir
- **Reportar Error**: Botón "Error" → modal para describir problema
- **Editar**: Botón editar (✏️) en cualquier elemento
- **Eliminar**: Botón eliminar con confirmación

### 3. Funciones Avanzadas

- **Observaciones**: Campo de texto libre para notas del día
- **Guardar Lista**: Asignar nombre y guardar permanentemente
- **Exportar PDF**: Generar documento listo para imprimir
- **Editar Lista**: Modificar tareas preservando datos existentes

### 4. Gestión de Listas

- **Vista Principal**: Cards con preview, progreso y estadísticas
- **Cargar Lista**: Clic en cualquier card guardado
- **Eliminar Lista**: Botón eliminar con confirmación
- **Indicador de Espacio**: Advertencia cuando el almacenamiento se llena

## 🎨 Personalización de Temas

La aplicación utiliza CSS Custom Properties para facilitar la personalización:

```css
:root {
  --primary-color: #3b82f6; /* Color principal */
  --bg-surface: #ffffff; /* Fondo de superficie */
  --text-primary: #1f2937; /* Texto principal */
  --border-color: #e5e7eb; /* Bordes */
  /* ... más variables */
}

[data-theme="dark"] {
  --primary-color: #60a5fa;
  --bg-surface: #1f2937;
  --text-primary: #f9fafb;
  /* ... versiones oscuras */
}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones Móviles

- Navigation colapsado
- Botones de tamaño táctil
- Grid adaptativo para cards
- Formularios optimizados
- Modales responsivos

## 🔒 Almacenamiento de Datos

### LocalStorage Schema

```javascript
// Lista actual en progreso
"checklist_data": ChecklistData

// Índice de listas guardadas
"saved_lists": SavedList[]

// Lista individual guardada
"list_{id}": ChecklistData

// Configuración de tema
"theme": "light" | "dark"
```

### Límites de Almacenamiento

- **Límite máximo**: 3.5MB
- **Advertencia**: 80% de uso
- **Gestión automática**: Indicadores visuales

## 🧪 Testing

```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e

# Coverage
ng test --code-coverage
```

## 🚀 Deployment

### Build de Producción

```bash
ng build --prod
```

### Variables de Entorno

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  version: "1.0.0",
};
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch: `git checkout -b feature/amazing-feature`
3. Commit cambios: `git commit -m 'Add amazing feature'`
4. Push a branch: `git push origin feature/amazing-feature`
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆕 Changelog

### v1.0.0 (2024)

- ✨ Implementación completa de la aplicación
- 🎨 Diseño moderno y responsive
- 📱 Soporte completo móvil
- 🌙 Sistema de temas
- 📄 Exportación a PDF
- 💾 Persistencia avanzada

## 🙏 Agradecimientos

- Angular Team por el excelente framework
- Google Fonts por Funnel Display
- Material Icons por los iconos
