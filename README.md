# 📝 Checklist Diario

> Aplicación web moderna para gestionar tareas diarias con Angular 18+

🌐 **[Ver App en Vivo](https://checkliist.netlify.app)**

[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/checkliist/deploys)

## ✨ Características

- 📝 **Creación rápida**: Tareas separadas por comas
- ✅ **Subtareas y errores**: Seguimiento detallado por tarea
- 💾 **Auto-guardado**: Sin pérdida de datos
- 🌙 **Tema oscuro/claro**: Automático según preferencias
- 📱 **Responsive**: Móvil, tablet y desktop
- 📄 **Exportación PDF**: Para imprimir o compartir

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
- Angular CLI >= 18.x

### Scripts

```bash
npm start       # Desarrollo
npm run build   # Producción
npm test        # Pruebas
npm run lint    # Linting
```

## 📁 Estructura

```
src/app/
├── pages/           # Páginas principales
│   ├── home/        # Lista de checklists
│   ├── new-list/    # Creación de lista
│   └── checklist/   # Vista del checklist
├── services/        # Lógica de negocio
├── shared/          # Componentes reutilizables
├── models/          # Interfaces TypeScript
└── guards/          # Protección de rutas
```

## 📖 Uso

1. **Nueva Lista**: Escribe tareas separadas por comas
2. **Gestionar**: Marca completadas, añade subtareas/errores
3. **Guardar**: Auto-guardado o manual con nombre
4. **Exportar**: PDF para imprimir o compartir

## 🤝 Contribuir

Lee la [Guía de Contribución](CONTRIBUTING.md) para:

- Proceso de desarrollo
- Estándares de código
- Requisitos de PR

## 📚 Documentación

- [Documentación Técnica](TECHNICAL_DOCS.md) - Arquitectura y APIs
- [App en Vivo](https://checkliist.netlify.app) - Demo funcional

---

**Construido usando Angular 18+ y TypeScript**
