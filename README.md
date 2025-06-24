# 📝 Checklist Diario

> Aplicación web moderna para gestionar tareas diarias con Angular 19+

🌐 **[Ver App en Vivo](https://checkliist.netlify.app)**

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/checkliist/deploys)

## ✨ Características

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 💾 **Auto-guardado**: Sin pérdida de datos
- 🌙 **Tema oscuro/claro**: Automático según preferencias
- 📱 **Responsive**: Móvil, tablet y desktop
- 📄 **Exportación PDF**: Para imprimir o compartir
- 🔒 **IDs únicos**: Sistema UUID para máxima estabilidad
- ⚡ **Tracking optimizado**: Sin errores de duplicación
- 📋 **Gestión completa de listas**: Duplicar, renombrar y eliminar
- 🔄 **Numeración automática**: Sistema inteligente para copias
- ⚠️ **Confirmaciones**: Modales para operaciones críticas
- 🏗️ **Arquitectura modular**: Servicios independientes para cada función

## 🆕 Novedades v1.2

- **🔧 Servicios de Funciones**: Duplicar, renombrar y eliminar listas con servicios independientes
- **📋 Duplicación inteligente**: Sistema automático de numeración para copias
- **✏️ Renombrado robusto**: Validación de nombres únicos y manejo de errores
- **🗑️ Eliminación múltiple**: Borrado individual y masivo con confirmación
- **🎯 UI/UX mejorada**: Cards uniformes y botones consistentes
- **🧩 Arquitectura limpia**: Separación de responsabilidades sin lógica en state services

## 📋 Gestión de Listas

### Duplicar Listas

- **Modal de confirmación** antes de duplicar
- **Numeración automática**: "Lista (Copia)", "Lista (Copia 2)", etc.
- **IDs únicos** para todas las tareas y subtareas
- **Reset de estados**: Tareas sin completar en la copia
- **Limpieza automática**: Sin errores ni observaciones en copias

### Renombrar Listas

- **Validación en tiempo real** de nombres únicos
- **Manejo de errores** visual con mensajes específicos
- **Confirmación automática** al presionar Enter
- **Cancelación** con Escape o botón cerrar

### Eliminar Listas

- **Eliminación individual** con confirmación
- **Eliminación múltiple** de listas seleccionadas
- **Contador dinámico** en botón de eliminar masivo
- **Confirmación específica** según cantidad de elementos

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

### Scripts

```bash
npm start       # Desarrollo
npm run build   # Producción
npm test        # Pruebas
npm run lint    # Linting
```

## 📖 Uso

1. **Nueva Lista**: Escribe tareas separadas por comas
2. **Gestionar**: Marca completadas, añade subtareas/errores
3. **Guardar**: Auto-guardado o manual con nombre
4. **Duplicar**: Crea copias con numeración automática
5. **Renombrar**: Cambia nombres con validación
6. **Eliminar**: Borra individual o múltiple con confirmación
7. **Exportar**: PDF para imprimir o compartir

### Casos Especiales

- **Tareas duplicadas**: Cada instancia se maneja independientemente
- **Subtareas múltiples**: Usa `+` para separar (ej: "tarea1+tarea2+tarea3")
- **Edición masiva**: Las tareas existentes mantienen su estado
- **Nombres únicos**: El sistema previene duplicados en renombrado
- **Copias automáticas**: Numeración inteligente para evitar conflictos

## 🏗️ Arquitectura de Servicios

La aplicación utiliza una arquitectura modular con servicios independientes:

- **`duplicate-list.service`**: Maneja duplicación con confirmación y numeración
- **`rename-list.service`**: Gestiona renombrado con validación
- **`delete-list.service`**: Controla eliminación individual y masiva
- **State Services**: Solo manejan UI y navegación básica
- **Servicios principales**: ChecklistService, StorageService, etc.

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura y APIs
- [App en Vivo](https://checkliist.netlify.app) - Demo funcional

---

**Construido usando Angular 19+ y TypeScript 5.7+**
