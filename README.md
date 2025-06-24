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

## 🆕 Novedades v1.1

- **🔧 UuidService**: Generación de identificadores únicos globalmente
- **🛠️ Componentes independientes**: Mejor separación de responsabilidades
- **🚀 Tracking mejorado**: Resolución definitiva de errores NG0955
- **📋 Gestión de tareas duplicadas**: Manejo correcto de elementos con mismo nombre
- **🎯 Performance**: Optimización en renderizado de listas grandes

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
4. **Exportar**: PDF para imprimir o compartir

### Casos Especiales

- **Tareas duplicadas**: Cada instancia se maneja independientemente
- **Subtareas múltiples**: Usa `+` para separar (ej: "tarea1+tarea2+tarea3")
- **Edición masiva**: Las tareas existentes mantienen su estado

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
