# 📝 Checkliist

> Aplicación web moderna para gestionar tareas diarias con Angular

🌐 **[Ver App en Vivo](https://checkliist.netlify.app)**

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Características

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 🔄 **Reordenamiento**: Drag & drop visual de tareas y subtareas
- 💾 **Auto-guardado**: Sin pérdida de datos
- 🌙 **Temas**: Claro/oscuro automático
- 📱 **Responsive**: Móvil, tablet y desktop
- 📄 **Exportación**: PDF para imprimir y TXT para análisis
- 🔒 **IDs únicos**: Sistema UUID para estabilidad
- 📋 **Gestión de listas**: Duplicar, renombrar y eliminar
- 🎯 **Notificaciones**: Sistema de alertas contextual
- 🛡️ **Protección**: Guards contra pérdida de cambios

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
3. **Reordenar**: Arrastra para organizar visualmente
4. **Guardar**: Auto-guardado o manual con nombre
5. **Duplicar**: Crea copias con numeración automática
6. **Exportar**: PDF para imprimir o TXT para análisis

### Casos Especiales

- **Tareas duplicadas**: Cada instancia se maneja independientemente
- **Subtareas múltiples**: Usa `+` para separar (ej: "tarea1+tarea2+tarea3")
- **Nombres únicos**: El sistema previene duplicados
- **Exportación selectiva**: Múltiples formatos disponibles

## 🏗️ Arquitectura

La aplicación utiliza una arquitectura modular con:

- **Servicios especializados**: Cada función con su servicio independiente
- **Angular CDK**: Para componentes nativos y drag & drop
- **Sistema reactivo**: RxJS + BehaviorSubjects
- **Guards de protección**: Prevención de pérdida de datos
- **Componentes atómicos**: Design system reutilizable

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura completa y APIs
- [App en Vivo](https://checkliist.netlify.app) - Demo funcional

---

**Construido con Angular, TypeScript y Angular CDK**
