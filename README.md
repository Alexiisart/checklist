# 📝 Checkliist

> Aplicación web moderna para gestionar tareas diarias con Angular

🌐 **[Ver App en Vivo](https://checkliist.netlify.app)**

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Características v3.0

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 📅 **Fechas de vencimiento**: Para tareas principales con indicadores visuales ⭐ NEW
- ✅ **Fechas de completado**: Automáticas al marcar como completadas ⭐ NEW
- 🔔 **Estados visuales**: Indicadores para tareas vencidas y completadas ⭐ NEW
- 🔄 **Reordenamiento**: Drag & drop visual de tareas y subtareas
- 💾 **Auto-guardado**: Sin pérdida de datos
- 🌙 **Temas**: Claro/oscuro automático
- 📱 **Responsive**: Móvil, tablet y desktop
- 📄 **Exportación completa**: PDF, TXT y URLs con fechas incluidas ⭐ ENHANCED
- 🔒 **IDs únicos**: Sistema UUID para estabilidad
- 📋 **Gestión de listas**: Duplicar, renombrar y eliminar
- 👥 **Gestión de equipos**: Miembros y asignaciones de tareas
- 🎯 **Notificaciones**: Sistema de alertas contextual
- 🛡️ **Protección**: Guards contra pérdida de cambios

### 📅 Sistema de Fechas v3.0 ⭐ NEW

- **Fechas de vencimiento**: Solo para tareas principales (no subtareas)
- **Fechas automáticas**: Se establece fecha de completado al marcar tarea
- **Indicadores visuales**: Bordes rojos para fechas vencidas
- **Tooltips informativos**: Información contextual sobre fechas
- **Zona horaria local**: Consistencia garantizada en todos los formatos
- **Exportación completa**: Fechas incluidas en PDF, TXT, copiar y URLs

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

## 📖 Uso v3.0

1. **Nueva Lista**: Escribe tareas separadas por comas
2. **Gestionar**: Marca completadas, añade subtareas/errores
3. **Fechas**: Asigna fechas de vencimiento con el selector de fecha ⭐ NEW
4. **Estados visuales**: Observa indicadores de fechas vencidas ⭐ NEW
5. **Reordenar**: Arrastra para organizar visualmente
6. **Guardar**: Auto-guardado o manual con nombre
7. **Duplicar**: Crea copias con numeración automática
8. **Exportar**: PDF, TXT y URLs con fechas incluidas ⭐ ENHANCED

### Casos Especiales v3.0

- **Fechas de tareas**: Solo tareas principales tienen fechas, subtareas no
- **Fechas vencidas**: Se muestran con borde rojo si la fecha es anterior a hoy
- **Fechas completadas**: Se establecen automáticamente al completar tarea
- **Tareas duplicadas**: Cada instancia se maneja independientemente
- **Subtareas múltiples**: Usa `+` para separar (ej: "tarea1+tarea2+tarea3")
- **Nombres únicos**: El sistema previene duplicados
- **Exportación con fechas**: Todas las exportaciones incluyen información de fechas

### 📅 Uso del Sistema de Fechas

1. **Asignar fecha**: Click en selector de fecha junto a la tarea
2. **Ver estado**: Las fechas vencidas aparecen con borde rojo
3. **Información adicional**: Hover para ver tooltip con detalles
4. **Completar tarea**: Se establece fecha de completado automáticamente
5. **Eliminar fecha**: Click en "×" para remover fecha de vencimiento

## 🏗️ Arquitectura v3.0

La aplicación utiliza una arquitectura modular con:

- **Sistema de fechas centralizado**: DateManagerService para toda la lógica ⭐ NEW
- **Servicios especializados**: Cada función con su servicio independiente
- **Angular CDK**: Para componentes nativos y drag & drop
- **Sistema reactivo**: RxJS + BehaviorSubjects
- **Guards de protección**: Prevención de pérdida de datos
- **Componentes atómicos**: Design system reutilizable con fechas
- **Zona horaria local**: Garantía de consistencia en formatos de fecha

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura completa y APIs v3.0
- [App en Vivo](https://checkliist.netlify.app) - Demo funcional

---

**Construido con Angular, TypeScript y Angular CDK**
