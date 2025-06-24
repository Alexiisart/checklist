# InputComponent

Componente Input elegante y reutilizable que proporciona una experiencia de entrada de datos unificada y accesible.

## Características

- ✅ **Múltiples tipos**: text, email, password, search, url, tel
- ✅ **Soporte para textarea** con redimensionamiento vertical
- ✅ **4 variantes de estilo**: default, filled, outlined, minimal
- ✅ **5 tamaños**: xs, sm, md, lg, xl
- ✅ **Iconos integrados** a izquierda y derecha
- ✅ **Botón de limpiar** opcional
- ✅ **Contador de caracteres** con límite máximo
- ✅ **Estados de validación** con mensajes de error y ayuda
- ✅ **Reactive Forms** compatible con ControlValueAccessor
- ✅ **Accesibilidad completa** con ARIA labels
- ✅ **Responsive** optimizado para móviles
- ✅ **Animaciones fluidas** con transiciones suaves

## Uso Básico

```html
<!-- Input simple -->
<app-input label="Nombre completo" placeholder="Ingresa tu nombre" [(value)]="userName"></app-input>

<!-- Input con icono -->
<app-input type="email" label="Correo electrónico" placeholder="usuario@ejemplo.com" iconLeft="email" [(value)]="userEmail"></app-input>

<!-- Textarea -->
<app-input [isTextarea]="true" label="Descripción" placeholder="Describe tu experiencia..." [rows]="4" [(value)]="description"></app-input>
```

## Variantes

### Default (Borde estándar)

```html
<app-input variant="default" label="Input estándar"></app-input>
```

### Filled (Fondo relleno)

```html
<app-input variant="filled" label="Input relleno"></app-input>
```

### Outlined (Borde doble)

```html
<app-input variant="outlined" label="Input con contorno"></app-input>
```

### Minimal (Solo línea inferior)

```html
<app-input variant="minimal" label="Input minimalista"></app-input>
```

## Tamaños

```html
<!-- Extra pequeño -->
<app-input size="xs" label="Muy pequeño"></app-input>

<!-- Pequeño -->
<app-input size="sm" label="Pequeño"></app-input>

<!-- Mediano (default) -->
<app-input size="md" label="Mediano"></app-input>

<!-- Grande -->
<app-input size="lg" label="Grande"></app-input>

<!-- Extra grande -->
<app-input size="xl" label="Muy grande"></app-input>
```

## Tipos de Input

```html
<!-- Texto -->
<app-input type="text" label="Texto"></app-input>

<!-- Email -->
<app-input type="email" label="Email"></app-input>

<!-- Contraseña -->
<app-input type="password" label="Contraseña"></app-input>

<!-- Búsqueda -->
<app-input type="search" label="Buscar" iconLeft="search"></app-input>

<!-- URL -->
<app-input type="url" label="Sitio web"></app-input>

<!-- Teléfono -->
<app-input type="tel" label="Teléfono"></app-input>
```

## Estados y Validación

### Con texto de ayuda

```html
<app-input label="Contraseña" type="password" helpText="Mínimo 8 caracteres con letras y números"></app-input>
```

### Con texto de error

```html
<app-input label="Email" type="email" errorText="Por favor ingresa un email válido"></app-input>
```

### Disabled

```html
<app-input label="Campo deshabilitado" [disabled]="true"></app-input>
```

### Readonly

```html
<app-input label="Solo lectura" [readonly]="true" value="Valor fijo"></app-input>
```

## Características Avanzadas

### Con iconos y botón de limpiar

```html
<app-input type="search" label="Búsqueda avanzada" placeholder="Buscar productos..." iconLeft="search" iconRight="tune" [clearable]="true" [(value)]="searchQuery"></app-input>
```

### Contador de caracteres

```html
<app-input [isTextarea]="true" label="Comentario" [maxLength]="280" [showCharacterCount]="true" [(value)]="comment"></app-input>
```

### Textarea con múltiples filas

```html
<app-input [isTextarea]="true" label="Mensaje" [rows]="6" placeholder="Escribe tu mensaje aquí..." [(value)]="message"></app-input>
```

## Reactive Forms

```typescript
// En el componente
form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
  description: ['', Validators.maxLength(500)]
});

get nameError() {
  const control = this.form.get('name');
  if (control?.errors?.['required']) return 'El nombre es requerido';
  if (control?.errors?.['minlength']) return 'Mínimo 2 caracteres';
  return '';
}
```

```html
<form [formGroup]="form">
  <app-input formControlName="name" label="Nombre" [errorText]="nameError"></app-input>

  <app-input formControlName="email" type="email" label="Email" iconLeft="email"></app-input>

  <app-input formControlName="description" [isTextarea]="true" label="Descripción" [maxLength]="500" [showCharacterCount]="true"></app-input>
</form>
```

## Eventos

```html
<app-input label="Input con eventos" (valueChange)="onValueChange($event)" (focusEvent)="onFocus($event)" (blurEvent)="onBlur($event)" (keydownEvent)="onKeyDown($event)"></app-input>
```

```typescript
onValueChange(value: string) {
  console.log('Nuevo valor:', value);
}

onFocus(event: FocusEvent) {
  console.log('Input enfocado');
}

onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    console.log('Enter presionado');
  }
}
```

## Propiedades

| Propiedad            | Tipo             | Default     | Descripción            |
| -------------------- | ---------------- | ----------- | ---------------------- |
| `type`               | `InputType`      | `'text'`    | Tipo de input          |
| `variant`            | `InputVariant`   | `'default'` | Variante visual        |
| `size`               | `InputSize`      | `'md'`      | Tamaño del input       |
| `label`              | `string`         | `''`        | Etiqueta del input     |
| `placeholder`        | `string`         | `''`        | Texto placeholder      |
| `helpText`           | `string`         | `''`        | Texto de ayuda         |
| `errorText`          | `string`         | `''`        | Texto de error         |
| `value`              | `string`         | `''`        | Valor del input        |
| `disabled`           | `boolean`        | `false`     | Estado disabled        |
| `readonly`           | `boolean`        | `false`     | Estado readonly        |
| `iconLeft`           | `string`         | `''`        | Icono izquierdo        |
| `iconRight`          | `string`         | `''`        | Icono derecho          |
| `clearable`          | `boolean`        | `false`     | Mostrar botón limpiar  |
| `maxLength`          | `number \| null` | `null`      | Máximo de caracteres   |
| `showCharacterCount` | `boolean`        | `false`     | Mostrar contador       |
| `isTextarea`         | `boolean`        | `false`     | Usar textarea          |
| `rows`               | `number`         | `3`         | Filas del textarea     |
| `inputId`            | `string`         | `auto`      | ID del input           |
| `ariaLabel`          | `string`         | `''`        | ARIA label             |
| `extraClasses`       | `string`         | `''`        | Clases CSS adicionales |

## Eventos

| Evento         | Tipo            | Descripción      |
| -------------- | --------------- | ---------------- |
| `valueChange`  | `string`        | Cambio de valor  |
| `focusEvent`   | `FocusEvent`    | Input enfocado   |
| `blurEvent`    | `FocusEvent`    | Input desenfocar |
| `keydownEvent` | `KeyboardEvent` | Tecla presionada |
| `keyupEvent`   | `KeyboardEvent` | Tecla liberada   |

## Métodos Públicos

```typescript
// Obtener referencia del componente
@ViewChild(InputComponent) inputComponent!: InputComponent;

// Enfocar el input
this.inputComponent.focus();

// Seleccionar todo el texto
this.inputComponent.selectAll();

// Limpiar el valor
this.inputComponent.clearValue();
```

## Personalización

El componente usa las variables CSS del sistema de diseño para mantener consistencia visual:

```css
/* Variables disponibles */
--color-surface-elevated
--color-border
--color-border-focus
--color-text-primary
--color-text-secondary
--color-text-muted
--color-error
--radius-md
--shadow-xs
--shadow-sm
--space-1, --space-2, etc.
```
