# 📝 Checklist Diario

> Aplicación web moderna para gestionar tareas diarias con Angular 19+

🌐 **[Ver App en Vivo](https://checkliist.netlify.app)**

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/checkliist/deploys)

## ✨ Características

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 🔄 **Drag & Drop**: Reordenamiento visual de tareas y subtareas con CDK
- 📊 **Indicadores inteligentes**: Almacenamiento y progreso en tiempo real
- 💾 **Auto-guardado**: Sin pérdida de datos con protección de navegación
- 🌙 **Sistema de temas**: Claro/oscuro automático según preferencias
- 📱 **Responsive avanzado**: Móvil, tablet y desktop optimizados
- 📄 **Exportación completa**: PDF con vista previa e impresión, TXT avanzado
- 🔒 **IDs únicos**: Sistema UUID para máxima estabilidad
- ⚡ **Tracking optimizado**: Sin errores de duplicación
- 📋 **Gestión completa de listas**: Duplicar, renombrar y eliminar
- 🔄 **Numeración automática**: Sistema inteligente para copias
- ⚠️ **Confirmaciones inteligentes**: Modales contextuales para operaciones críticas
- 🎯 **Sistema de notificaciones**: Toast notifications con estados visuales
- 🏗️ **Arquitectura modular**: Servicios independientes con CDK drag-drop
- 🛡️ **Protección de cambios**: Guards de navegación para prevención de pérdida de datos

## 🆕 Novedades v2.0

### 🎨 Sistema de Interfaz Avanzado

- **🔄 Drag & Drop nativo**: Reordenamiento visual de tareas y subtareas con Angular CDK
- **📊 Indicadores de almacenamiento**: Monitoreo en tiempo real del espacio usado
- **🎯 Sistema de notificaciones**: Toast notifications contextuales con 4 tipos de estado
- **🌙 Temas inteligentes**: Sistema automático claro/oscuro con persistencia
- **📱 UI responsive mejorada**: Adaptación perfecta móvil/desktop

### 🛡️ Protección y Seguridad

- **🔒 Guards de navegación**: Protección automática contra pérdida de cambios
- **💾 Auto-guardado inteligente**: Detección de cambios con guardado automático
- **⚠️ Confirmaciones contextuales**: Modales específicos según la operación
- **🗄️ Gestión de espacio**: Alertas automáticas y limpieza de almacenamiento

### 📄 Exportación Avanzada

- **🖨️ PDF mejorado**: Vista previa completa con estilos de impresión profesionales
- **📝 TXT avanzado**: Múltiples formatos (completo, subtareas, tareas individuales)
- **🎨 Estilos específicos**: Diseño optimizado para impresión y digital
- **📈 Progreso visual**: Barras de progreso en exportaciones

### 🏗️ Arquitectura Renovada

- **🧩 Servicios modulares**: Cada función con su servicio especializado
- **⚡ Performance optimizada**: Tracking eficiente y gestión de memoria
- **🔧 CDK Integration**: Angular CDK para drag-drop nativo y componentes avanzados
- **🎯 Clean Architecture**: Separación perfecta de responsabilidades

## 🔄 Gestión con Drag & Drop

### Reordenamiento de Tareas

- **Modal de reordenamiento**: Interface dedicada con vista previa
- **Drag & Drop visual**: Arrastrar y soltar con animaciones suaves
- **Vista detallada**: Información de subtareas y errores por tarea
- **Confirmación inteligente**: Aplicar cambios o cancelar operación

### Reordenamiento de Subtareas

- **Reordenamiento inline**: Directamente en cada tarea con handles visuales
- **Feedback inmediato**: Animaciones y estados visuales en tiempo real
- **Persistencia automática**: Cambios guardados automáticamente
- **Notificaciones**: Confirmación visual de cambios aplicados

## 📊 Sistema de Indicadores

### Indicador de Almacenamiento

- **Monitoreo en tiempo real**: Actualización cada 5 segundos
- **Estados visuales**: Safe (verde), Warning (amarillo), Danger (rojo)
- **Responsive completo**: Adaptación móvil con iconos compactos
- **Alertas automáticas**: Notificaciones al alcanzar límites (70%, 90%, 100%)

### Indicador de Progreso

- **Progreso por lista**: Porcentaje de tareas completadas
- **Estados visuales**: Colores dinámicos según avance
- **Integración**: Visible en cards y exportaciones

## 🎯 Sistema de Notificaciones

### Toast Notifications

- **4 tipos de estado**: Success, Warning, Danger, Info
- **Animaciones suaves**: Slide-in/slide-out con CSS animations
- **Duración configurable**: Tiempos específicos según importancia
- **Posicionamiento fijo**: Esquina superior derecha sin interferir UI

### Contextos de Uso

- **Operaciones exitosas**: Guardado, duplicado, exportación
- **Advertencias**: Almacenamiento alto, validaciones
- **Errores críticos**: Fallos de guardado, límites alcanzados
- **Información**: Auto-guardado, cambios aplicados

## 🛡️ Protección de Navegación

### Guards Inteligentes

- **Detección automática**: Cambios sin guardar detectados automáticamente
- **Confirmaciones contextuales**: Mensajes específicos según destino
- **Opciones flexibles**: Guardar y continuar, o continuar sin guardar
- **Múltiples escenarios**: Nueva lista, ir a home, cambio de ruta

### Auto-guardado

- **Detección de cambios**: Sistema reactivo de estado
- **Guardado silencioso**: Para listas con nombre existente
- **Temporizador inteligente**: Auto-guardado cada 30 segundos si hay cambios
- **Feedback visual**: Notificaciones discretas de guardado automático

## 📋 Gestión Avanzada de Listas

### Duplicación Inteligente

- **Modal de confirmación** con vista previa de nombre generado
- **Numeración automática**: "Lista (Copia)", "Lista (Copia 2)", etc.
- **IDs únicos regenerados** para todas las tareas y subtareas
- **Reset de estados**: Tareas sin completar en la copia
- **Limpieza total**: Sin errores ni observaciones en copias nuevas

### Renombrado Robusto

- **Validación en tiempo real** de nombres únicos
- **Mensajes de error específicos** con colores de estado
- **Confirmación automática** al presionar Enter
- **Cancelación múltiple**: Escape, botón cerrar, o click fuera
- **Feedback inmediato**: Estados visuales durante la edición

### Eliminación Masiva

- **Eliminación individual** con confirmación contextual
- **Eliminación múltiple** de listas seleccionadas
- **Contador dinámico** en botón según cantidad seleccionada
- **Confirmación específica**: Mensajes adaptados a cantidad de elementos
- **Modo selección**: Interface dedicada para operaciones masivas

## 🎨 Sistema de Temas

### Temas Automáticos

- **Detección del sistema**: Respeta preferencias del usuario
- **Persistencia local**: Guarda elección manual del usuario
- **Transiciones suaves**: Animaciones CSS para cambios de tema
- **Variables CSS**: Sistema completo de design tokens

### Assets Dinámicos

- **Logos adaptativos**: Cambio automático según tema activo
- **Iconos contextuales**: Estados visuales coherentes
- **Colores inteligentes**: Paleta optimizada para accesibilidad

## 📄 Exportación de Nueva Generación

### PDF Profesional

- **Estilos de impresión dedicados**: CSS especializado para PDF
- **Vista previa completa**: Todos los elementos formateados
- **Progreso visual**: Barras de progreso incluidas
- **Metadatos completos**: Fecha, título, estado de tareas
- **Checkboxes visuales**: Representación gráfica de estados

### TXT Avanzado

- **Exportación completa**: Todas las tareas con metadatos
- **Solo subtareas**: Filtro de tareas con subtareas únicamente
- **Tarea individual**: Exportación granular por tarea específica
- **Formato estructurado**: Layout profesional con separadores visuales
- **Estadísticas incluidas**: Conteos y porcentajes de progreso

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/Alexiisart/checklist.git
cd checklist

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start  # http://localhost:4200
```

### Requisitos

- Node.js >= 18.x
- Angular CLI >= 19.x
- Angular CDK >= 19.2.x

### Scripts

```bash
npm start       # Desarrollo
npm run build   # Producción
npm test        # Pruebas
npm run lint    # Linting
```

## 📖 Uso Avanzado

### Flujo de Trabajo Básico

1. **Nueva Lista**: Escribe tareas separadas por comas
2. **Gestionar**: Marca completadas, añade subtareas/errores
3. **Reordenar**: Usa drag & drop para organizar visualmente
4. **Guardar**: Auto-guardado o manual con nombre
5. **Duplicar**: Crea copias con numeración automática
6. **Renombrar**: Cambia nombres con validación en tiempo real
7. **Eliminar**: Borra individual o múltiple con confirmación
8. **Exportar**: PDF para imprimir o TXT para análisis

### Funciones Avanzadas

#### Drag & Drop

- **Tareas**: Usar modal de reordenamiento desde botón "Reordenar"
- **Subtareas**: Arrastrar directamente con handle de drag en cada subtarea
- **Persistencia**: Cambios se aplican automáticamente
- **Visual feedback**: Animaciones y estados durante el arrastre

#### Gestión de Almacenamiento

- **Monitoreo**: Indicador siempre visible en esquina superior
- **Límites automáticos**: Alertas en 70%, 90% y 100% de uso
- **Limpieza inteligente**: Sugerencias de eliminación automática
- **Optimización**: Gestión eficiente del localStorage

#### Protección de Datos

- **Detección automática**: Sistema sabe cuándo hay cambios sin guardar
- **Guardado inteligente**: Auto-guardado para listas con nombre
- **Confirmaciones**: Nunca perderás trabajo por navegación accidental
- **Recuperación**: Sistema de persistencia robusto

### Casos Especiales Avanzados

- **Tareas duplicadas**: Cada instancia con ID único independiente
- **Subtareas múltiples**: Usa `+` para separar (ej: "tarea1+tarea2+tarea3")
- **Reordenamiento complejo**: Combinación de modal y drag inline
- **Nombres únicos**: Validación en tiempo real previene duplicados
- **Copias automáticas**: Numeración inteligente evita conflictos
- **Exportación selectiva**: Múltiples formatos según necesidad

## 🏗️ Arquitectura Técnica

### Servicios Especializados

- **`duplicate-list.service`**: Duplicación con confirmación y numeración
- **`rename-list.service`**: Renombrado con validación en tiempo real
- **`delete-list.service`**: Eliminación individual y masiva
- **`checklist-reorder.service`**: Gestión de drag & drop con CDK
- **`toast.service`**: Sistema de notificaciones centralizado
- **`theme.service`**: Gestión de temas con persistencia
- **`storage.service`**: Monitoreo y gestión de almacenamiento

### Componentes Angular CDK

- **DragDropModule**: Reordenamiento nativo con animaciones
- **Drag handles**: Elementos visuales para interacción
- **Drop zones**: Áreas de destino con feedback visual
- **Animations**: Transiciones suaves entre estados

### Sistema de Estado

- **Estado reactivo**: BehaviorSubjects para UI responsive
- **Persistencia**: localStorage con compresión inteligente
- **Sincronización**: Updates automáticos entre componentes
- **Performance**: Lazy loading y optimizaciones de memoria

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR
- Testing con Angular CDK

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura completa y APIs
- [App en Vivo](https://checkliist.netlify.app) - Demo funcional v2.0

---

**🎯 Checklist Diario v2.0 - Construido con Angular 19+, TypeScript 5.7+ y Angular CDK 19+**
