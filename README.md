# 📝 Checklist Diario - Angular

> Una aplicación web moderna y elegante para gestionar tareas diarias, construida con Angular 18+ y diseño minimalista.

[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

## 🚀 Características Principales

### ✨ **Gestión Inteligente de Tareas**

- 📝 **Creación rápida**: Escribe tareas separadas por comas y genera tu checklist instantáneamente
- ✅ **Sistema de subtareas**: Cada tarea puede tener múltiples subtareas con seguimiento independiente
- 🚨 **Registro de errores**: Documenta problemas específicos por tarea para seguimiento detallado
- 🎯 **Progreso visual**: Barras de progreso animadas que muestran el avance en tiempo real
- 📝 **Observaciones**: Campo libre para notas adicionales del día

### 💾 **Persistencia y Almacenamiento**

- 🗂️ **Múltiples listas**: Guarda y gestiona múltiples checklists con nombres personalizados
- 🔄 **Auto-guardado**: Los cambios se guardan automáticamente en tiempo real
- 📊 **Monitor de almacenamiento**: Indicador visual del uso de espacio local
- 📱 **Sincronización local**: Datos persistentes en el navegador sin necesidad de servidor

### 🎨 **Experiencia de Usuario Premium**

- 🌙 **Tema adaptable**: Soporte completo para modo claro/oscuro con detección automática
- 📱 **Diseño responsive**: Optimizado para móvil, tablet y desktop
- ⚡ **Animaciones suaves**: Micro-interacciones y transiciones fluidas
- 🖨️ **Exportación PDF**: Genera documentos profesionales listos para imprimir
- 🎯 **Navegación intuitiva**: Interfaz limpia y fácil de usar

### 🏗️ **Arquitectura Moderna**

- 🔧 **Angular 18+**: Última versión con Standalone Components
- 📦 **Servicios modulares**: Arquitectura limpia y reutilizable
- 🔄 **Programación reactiva**: RxJS para gestión de estado eficiente
- 💪 **TypeScript estricto**: Tipado fuerte para mejor mantenibilidad
- 🎯 **Lazy Loading**: Carga optimizada de componentes

## 🖼️ Vista Previa

### Pantalla Principal

![Home Screen](docs/screenshots/home-screen.png)

### Vista de Checklist

![Checklist View](docs/screenshots/checklist-view.png)

### Tema Oscuro

![Dark Theme](docs/screenshots/dark-theme.png)

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

Asegúrate de tener instalado:

```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 18.x
```

### 💻 Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Alexiisart/checklist.git
cd checklist

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
ng serve

# 4. Abrir en el navegador
# http://localhost:4200
```

### 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Servidor de desarrollo (puerto 4200)
npm run dev            # Alias para ng serve

# Construcción
npm run build          # Compilación de producción
npm run build:prod     # Construcción optimizada

# Testing
npm run test           # Ejecutar tests unitarios
npm run test:watch     # Tests en modo watch
npm run e2e            # Tests end-to-end

# Análisis
npm run lint           # Análisis de código con ESLint
npm run lint:fix       # Corregir problemas de linting automáticamente

# Utilidades
npm run analyze        # Análisis del bundle
npm run serve:prod     # Servir versión de producción localmente
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── models/                           # 🏗️ Modelos de datos
│   │   └── task.interface.ts             # Interfaces TypeScript
│   │
│   ├── services/                         # 🔧 Servicios de negocio
│   │   ├── checklist.service.ts          # Lógica principal
│   │   ├── storage.service.ts            # Gestión localStorage
│   │   ├── theme.service.ts              # Control de temas
│   │   ├── pdf-export.service.ts         # Exportación PDF
│   │   └── toast.service.ts              # Notificaciones
│   │
│   ├── pages/                            # 📄 Páginas principales
│   │   ├── home/                         # Lista de checklists guardados
│   │   │   ├── home.component.ts
│   │   │   └── home.component.css
│   │   ├── new-list/                     # Creación de nueva lista
│   │   │   ├── new-list.component.ts
│   │   │   └── new-list.component.css
│   │   └── checklist/                    # Vista principal del checklist
│   │       ├── checklist.component.ts
│   │       ├── checklist.component.css
│   │       ├── checklist.component.html
│   │       └── checklist-state.service.ts
│   │
│   ├── shared/                           # 🔄 Componentes compartidos
│   │   └── components/
│   │       ├── header/                   # Header con navegación
│   │       ├── footer/                   # Footer informativo
│   │       ├── modal/                    # Modal genérico reutilizable
│   │       ├── confirm-modal/            # Modal de confirmación
│   │       ├── alert-modal/              # Modal de alertas
│   │       ├── task-item/                # Componente de tarea individual
│   │       ├── toast/                    # Componente de notificaciones
│   │       └── storage-indicator/        # Indicador de almacenamiento
│   │
│   ├── guards/                           # 🛡️ Guards de navegación
│   │   └── unsaved-changes.guard.ts      # Prevenir pérdida de datos
│   │
│   ├── app.component.*                   # 🏠 Componente raíz
│   ├── app.routes.ts                     # 🗺️ Configuración de rutas
│   └── app.config.ts                     # ⚙️ Configuración global
│
├── assets/                               # 🎨 Recursos estáticos
│   ├── logo.svg                          # Logo principal
│   ├── logo-dark.svg                     # Logo para tema oscuro
│   └── icons/                            # Iconografía
│
├── styles.css                            # 🎨 Estilos globales
└── index.html                            # 📄 HTML principal
```

## 🎮 Guía de Uso

### 1. 🆕 Crear Nueva Lista

1. **Navegar**: Haz clic en "Nueva Lista" desde la página principal
2. **Escribir tareas**: Ingresa tareas separadas por comas
   ```
   Ejemplo: Revisar email, Llamar cliente, Preparar informe, Reunión equipo
   ```
3. **Generar**: Presiona "Generar Checklist" o Enter

### 2. ✅ Gestionar Tareas

#### Completar Tareas

- Marca el checkbox principal para completar toda la tarea
- Las subtareas se pueden marcar independientemente

#### Agregar Elementos

- **Subtarea**: Botón "➕ Subtarea" → Modal para escribir
- **Error**: Botón "🚨 Error" → Modal para describir problema

#### Editar Contenido

- **Tarea**: Botón editar (✏️) → Modal de edición
- **Subtarea/Error**: Doble clic para editar inline

#### Eliminar Elementos

- Botón eliminar (🗑️) con confirmación de seguridad

### 3. 🔄 Funciones Avanzadas

#### Observaciones Generales

- Campo de texto libre en la parte inferior
- Ideal para notas del día, comentarios generales
- Se guarda automáticamente

#### Guardar Lista

- Botón "💾 Guardar Lista"
- Asigna un nombre descriptivo
- Se guarda permanentemente en el navegador

#### Exportar a PDF

- Botón "📄 Exportar PDF"
- Genera documento profesional
- Incluye todas las tareas, subtareas, errores y observaciones

#### Modo Edición Masiva

- Botón "✏️ Editar Lista"
- Modifica todas las tareas como texto
- Preserva subtareas y errores existentes

### 4. 📂 Gestión de Listas Guardadas

#### Vista Principal

- **Cards informativas**: Preview, progreso y estadísticas
- **Filtrado rápido**: Busca por nombre o contenido
- **Orden personalizable**: Por fecha, nombre o progreso

#### Cargar Lista

- Clic en cualquier card para abrir
- Conserva todo el estado anterior
- Continúa donde lo dejaste

#### Eliminar Lista

- Botón eliminar con doble confirmación
- Acción irreversible

#### Indicador de Almacenamiento

- Muestra uso del espacio local
- Advertencia cuando se acerca al límite
- Sugerencias de limpieza

## 🎨 Personalización y Temas

### Sistema de Temas

La aplicación utiliza **CSS Custom Properties** para máxima flexibilidad:

```css
/* Tema Claro (Default) */
:root {
  --primary-600: #3b82f6;
  --neutral-50: #f9fafb;
  --neutral-900: #111827;
  --success-500: #10b981;
  --danger-500: #ef4444;
  --warning-500: #f59e0b;
}

/* Tema Oscuro */
[data-theme="dark"] {
  --primary-600: #60a5fa;
  --neutral-50: #1f2937;
  --neutral-900: #f9fafb;
  /* Inversión inteligente de colores */
}
```

### Personalizar Colores

Para cambiar el esquema de colores, edita las variables CSS en `src/styles.css`:

```css
:root {
  --primary-600: #your-brand-color; /* Color principal */
  --accent-color: #your-accent-color; /* Color de acento */
}
```

## 📱 Compatibilidad y Responsive Design

### 🖥️ Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 📐 Breakpoints Responsive

```css
/* Mobile First Approach */
@media (min-width: 640px) {
  /* sm: Móvil grande */
}
@media (min-width: 768px) {
  /* md: Tablet */
}
@media (min-width: 1024px) {
  /* lg: Desktop */
}
@media (min-width: 1280px) {
  /* xl: Desktop grande */
}
```

### 📱 Optimizaciones Móviles

- **Touch-friendly**: Botones con área táctil mínima de 44px
- **Keyboard**: Soporte completo para teclados virtuales
- **Gestos**: Swipe para acciones rápidas
- **Performance**: Lazy loading y optimización de imágenes

## 🔧 Configuración Avanzada

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
# Configuración de desarrollo
NG_APP_VERSION=1.0.0
NG_APP_BUILD_DATE=2024-01-15
NG_APP_DEBUG=true

# Límites de almacenamiento
NG_APP_STORAGE_LIMIT=5242880  # 5MB en bytes
NG_APP_MAX_LISTS=50

# Configuración de PDF
NG_APP_PDF_MARGIN=20
NG_APP_PDF_FORMAT=A4
```

### Configuración de Build

Modifica `angular.json` para personalizar la compilación:

```json
{
  "build": {
    "options": {
      "optimization": true,
      "sourceMap": false,
      "extractCss": true,
      "namedChunks": false,
      "aot": true,
      "extractLicenses": true,
      "vendorChunk": false,
      "buildOptimizer": true
    }
  }
}
```

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage
```

### Tests E2E

```bash
# Instalar Cypress
npm install cypress --save-dev

# Ejecutar tests E2E
npm run e2e
```

## 🚀 Despliegue

### Build de Producción

```bash
# Compilar para producción
npm run build

# Archivos generados en dist/
ls dist/checklist-diary/
```

### Despliegue en Netlify

1. **Fork** el repositorio
2. **Conecta** tu cuenta de Netlify
3. **Configura** el build:
   - Build command: `npm run build`
   - Publish directory: `dist/checklist-diary`

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Despliegue Manual

```bash
# Subir archivos de dist/ a tu servidor web
# Configurar servidor para SPAs (single-page applications)
```

## 🤝 Contribución

### 🎯 Cómo Contribuir

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. **Commit** tus cambios (`git commit -m 'Add amazing feature'`)
4. **Push** a la rama (`git push origin feature/amazing-feature`)
5. **Abre** un Pull Request

### 📋 Guidelines

- Sigue las convenciones de código TypeScript/Angular
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Usa commits descriptivos siguiendo [Conventional Commits](https://conventionalcommits.org/)

### 🐛 Reportar Bugs

Usa el [template de issues](https://github.com/Alexiisart/checklist/issues/new?template=bug_report.md) para reportar bugs con:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Información del navegador/OS

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Angular Team** - Por el framework increíble
- **Tailwind Labs** - Por la inspiración en el sistema de diseño
- **Iconify** - Por los iconos utilizados
- **jsPDF** - Por la funcionalidad de exportación PDF

---

## 📞 Contacto y Soporte

- **GitHub Issues**: [Reportar problemas](https://github.com/Alexiisart/checklist/issues)

---

<div align="center">

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**

[⬆ Volver arriba](#-checklist-diario---angular)

</div>
