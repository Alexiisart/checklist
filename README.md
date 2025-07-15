# 📝 Checkliist

> Aplicación web moderna para gestionar tareas diarias con Angular

🌐 **[Ver App en Vivo](https://checkliist.openiis.org)**

[![Angular](https://img.shields.io/badge/Angular-19+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Características v3.1

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 📅 **Fechas de vencimiento**: Para tareas principales con indicadores visuales
- ✅ **Fechas de completado**: Automáticas al marcar como completadas
- 🔔 **Estados visuales**: Indicadores para tareas vencidas y completadas
- 🔄 **Reordenamiento**: Drag & drop visual de tareas y subtareas
- 💾 **Auto-guardado**: Sin pérdida de datos
- 🌙 **Temas**: Claro/oscuro automático con iconos adaptados ⭐ ENHANCED
- 📱 **Responsive**: Móvil, tablet y desktop
- 📄 **Exportación completa**: PDF, TXT y URLs con fechas incluidas
- 🔒 **IDs únicos**: Sistema UUID mejorado para máxima estabilidad ⭐ ENHANCED
- 📋 **Gestión de listas**: Duplicar, renombrar y eliminar
- 👥 **Gestión de equipos**: Miembros y asignaciones de tareas
- 🎯 **Notificaciones optimizadas**: Sistema de alertas sin repeticiones ⭐ ENHANCED
- 🛡️ **Protección**: Guards contra pérdida de cambios
- 🔗 **Compartir listas inteligente**: Detección y comparación automática ⭐ NEW
- 📅 **Iconos de fecha personalizados**: Adaptados al modo oscuro ⭐ NEW

### 🔗 Sistema de Listas Compartidas v3.1 ⭐ NEW

- **Detección automática**: Reconoce cuando existe una lista con el mismo nombre
- **Modal de comparación**: Permite decidir entre actualizar o crear copia nueva
- **Comparación inteligente**: Analiza diferencias entre listas compartidas y existentes
- **Preservación de datos**: Mantiene información original al actualizar
- **URLs seguras**: Sistema de codificación Base64 para enlaces compartidos

### 📅 Mejoras del Sistema de Fechas v3.1 ⭐ ENHANCED

- **Iconos personalizados**: Reemplaza iconos nativos del navegador
- **Adaptación automática**: Iconos que cambian con el tema claro/oscuro
- **Mejor UX**: Interfaz más consistente entre navegadores
- **Accesibilidad mejorada**: Tooltips y estados visuales optimizados

### 🔧 Optimizaciones Técnicas v3.1 ⭐ ENHANCED

- **Tracking mejorado**: Sistema UUID único que elimina errores de duplicados
- **Notificaciones inteligentes**: Previene mensajes repetitivos durante edición
- **Rendimiento optimizado**: Menos re-renders innecesarios
- **Estabilidad aumentada**: Mejor manejo de estados y actualizaciones

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

## 📖 Uso v3.1

### Funcionalidades Básicas

1. **Nueva Lista**: Escribe tareas separadas por comas
2. **Gestionar**: Marca completadas, añade subtareas/errores
3. **Fechas**: Asigna fechas de vencimiento con el selector personalizado ⭐ ENHANCED
4. **Estados visuales**: Observa indicadores de fechas vencidas
5. **Reordenar**: Arrastra para organizar visualmente
6. **Guardar**: Auto-guardado o manual con nombre
7. **Duplicar**: Crea copias con numeración automática
8. **Exportar**: PDF, TXT y URLs con fechas incluidas

### 🔗 Compartir Listas v3.1 ⭐ NEW

1. **Generar enlace**: Click en "Compartir" para crear URL
2. **Compartir URL**: Envía el enlace a otros usuarios
3. **Abrir enlace**: El destinatario abre la URL compartida
4. **Comparación automática**: Si existe lista con el mismo nombre, aparece modal
5. **Decidir acción**: Elegir entre actualizar lista existente o crear copia nueva

### 📅 Selector de Fechas Mejorado v3.1 ⭐ ENHANCED

1. **Icono personalizado**: Click en el icono de calendario (no depende del navegador)
2. **Adaptación automática**: El icono cambia color según el tema activo
3. **Mejor visibilidad**: Iconos más claros y consistentes
4. **Doble funcionalidad**: Icono de calendario + botón de limpiar fecha

### Casos Especiales v3.1

- **Listas duplicadas por nombre**: Sistema inteligente ofrece opciones de fusión
- **Fechas personalizadas**: Iconos que funcionan igual en todos los navegadores
- **Notificaciones contextuales**: No se repiten durante la edición de texto
- **Tracking robusto**: Eliminación completa de errores de elementos duplicados
- **Compatibilidad total**: Funciona idénticamente en Chrome, Firefox, Safari, Edge

## 🏗️ Arquitectura v3.1

La aplicación utiliza una arquitectura modular con:

- **Sistema de listas compartidas**: Comparación y fusión inteligente ⭐ NEW
- **Iconos personalizados**: Componentes propios que se adaptan al tema ⭐ NEW
- **UUID avanzado**: Sistema de tracking único mejorado ⭐ ENHANCED
- **Notificaciones optimizadas**: Control de duplicados y contexto ⭐ ENHANCED
- **Sistema de fechas centralizado**: DateManagerService para toda la lógica
- **Servicios especializados**: Cada función con su servicio independiente
- **Angular CDK**: Para componentes nativos y drag & drop
- **Sistema reactivo**: RxJS + BehaviorSubjects
- **Guards de protección**: Prevención de pérdida de datos
- **Componentes atómicos**: Design system reutilizable
- **Zona horaria local**: Garantía de consistencia en formatos

### 🆕 Nuevos Servicios v3.1

- **SharedListComparisonService**: Gestión de comparación de listas
- **UuidService mejorado**: Generación de IDs únicos optimizada
- **Tracking universal**: Sistema común para todos los componentes

## 🐛 Correcciones v3.1

- ✅ **Notificaciones repetitivas**: Eliminado el bug de felicitaciones constantes
- ✅ **Tracking duplicado**: Solucionados errores NG0955 de elementos repetidos
- ✅ **Iconos de fecha**: Reemplazados iconos nativos por versiones personalizadas
- ✅ **Comparación de listas**: Detección inteligente mejorada por nombre
- ✅ **Estabilidad general**: Múltiples mejoras de rendimiento y consistencia

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura completa y APIs v3.1
- [App en Vivo](https://checkliist.openiis.org) - Demo funcional

---

**Construido con Angular, TypeScript y Angular CDK**
