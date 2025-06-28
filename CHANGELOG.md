# 📝 Changelog

Todos los cambios importantes del proyecto estarán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [3.1.0] - 2024-01-XX

### ✨ Añadido

- **🔗 Sistema de Listas Compartidas**: Detección automática y comparación inteligente cuando existe una lista con el mismo nombre
- **📅 Iconos Personalizados de Fecha**: Reemplazo de iconos nativos del navegador por iconos Material Icons que se adaptan al tema
- **🔧 Sistema de Tracking Mejorado**: Funciones trackBy universales que eliminan errores NG0955 de elementos duplicados
- **📊 Modal de Comparación**: Interfaz para decidir entre actualizar lista existente o crear copia nueva
- **🎯 UuidService Optimizado**: Generación de IDs únicos más robusta combinando múltiples factores

### 🔧 Mejorado

- **🔔 Notificaciones Inteligentes**: Control de contexto que previene mensajes repetitivos durante la edición
- **🎨 Adaptación de Tema**: Iconos de calendario que cambian automáticamente entre modo claro y oscuro
- **⚡ Performance**: Menos re-renders gracias a funciones trackBy optimizadas
- **🌐 Compatibilidad Cross-browser**: Interfaz consistente en Chrome, Firefox, Safari y Edge
- **📱 UX Móvil**: Mejor experiencia en dispositivos móviles con iconos adaptados

### 🐛 Corregido

- **Notificaciones Repetitivas**: Eliminado el bug donde las felicitaciones aparecían al escribir comentarios
- **Errores NG0955**: Solucionados errores de tracking duplicado en loops `@for`
- **Iconos Inconsistentes**: Reemplazados iconos nativos del navegador por versión personalizada
- **Comparación de Listas**: Mejorada detección por nombre eliminando sufijo "(Compartida)"
- **Estados de Felicitaciones**: Control apropiado de cuándo mostrar mensajes de completado

### 🏗️ Técnico

- **SharedListComparisonService**: Nuevo servicio para gestión de listas compartidas
- **ComparisonModalData**: Nueva interfaz para datos del modal de comparación
- **TrackBy Universal**: Implementación estándar para todos los componentes con loops
- **CSS Robusto**: Estilos que ocultan iconos nativos y muestran personalizados
- **Estados Persistentes**: Mejor manejo de banderas y control de notificaciones

### 📚 Documentación

- **README.md**: Actualizado con características v3.1 y nuevos casos de uso
- **TECHNICAL_DOCS.md**: Documentación completa de nuevos servicios y arquitectura
- **CHANGELOG.md**: Nuevo archivo para tracking de cambios

---

## [3.0.0] - 2024-01-XX

### ✨ Añadido

- **📅 Sistema de Fechas**: Fechas de vencimiento para tareas principales
- **✅ Fechas de Completado**: Automáticas al marcar tareas como completadas
- **🔔 Estados Visuales**: Indicadores para tareas vencidas con bordes rojos
- **📄 Exportación con Fechas**: PDF, TXT y URLs incluyen información de fechas
- **🎯 DateManagerService**: Servicio centralizado para gestión de fechas

### 🔧 Mejorado

- **📱 Interfaz Responsive**: Mejor adaptación a móviles y tablets
- **🌙 Sistema de Temas**: Mejorado cambio entre modo claro y oscuro
- **💾 Auto-guardado**: Sistema más robusto de persistencia
- **📊 Indicadores**: Tooltips informativos para fechas y estados

### 🏗️ Técnico

- **Angular 19+**: Actualización a la última versión
- **TypeScript 5.7+**: Tipos mejorados y mejor performance
- **Zona Horaria Local**: Consistencia garantizada en formatos de fecha
- **Clean Architecture**: Servicios modulares especializados

---

## [2.1.0] - 2023-XX-XX

### ✨ Añadido

- **🔄 Drag & Drop**: Reordenamiento visual con Angular CDK
- **👥 Gestión de Equipos**: Miembros y asignaciones de tareas
- **📊 Indicadores de Almacenamiento**: Monitoreo de uso de localStorage
- **🎨 Componentes Atómicos**: Design system reutilizable

### 🔧 Mejorado

- **⚡ Performance**: Optimizaciones de rendering y memoria
- **🎯 UX**: Mejor experiencia de usuario con feedback visual
- **📱 Mobile First**: Diseño completamente responsive

---

## [2.0.0] - 2023-XX-XX

### ✨ Añadido

- **📝 Subtareas**: Sistema completo de tareas anidadas
- **❌ Gestión de Errores**: Tracking de problemas por tarea
- **📤 Exportación**: PDF y TXT con formato profesional
- **🔗 URLs Compartibles**: Sistema de codificación Base64

### 🔧 Mejorado

- **💾 Persistencia**: Sistema robusto de auto-guardado
- **🎨 UI/UX**: Interfaz completamente rediseñada
- **📱 Responsive**: Adaptación completa a dispositivos móviles

---

## [1.0.0] - 2023-XX-XX

### ✨ Inicial

- **📝 Creación de Listas**: Funcionalidad básica de tareas
- **✅ Marcar Completadas**: Sistema simple de check/uncheck
- **💾 Almacenamiento Local**: Persistencia básica en localStorage
- **🌙 Tema Oscuro**: Soporte inicial para modo oscuro
