# Implementación de Buscaminas en TypeScript

## Visión General

Esta es una implementación pura en TypeScript del clásico juego Buscaminas, siguiendo principios de programación orientada a objetos con una clara separación de responsabilidades. El juego está diseñado para ejecutarse en un entorno de navegador sin necesidad de bibliotecas o frameworks externos.

## Detalles de la Implementación

### Arquitectura

La aplicación sigue un patrón Modelo-Vista-Controlador (MVC) con los siguientes componentes:

1. **Modelo**
   - `Cell`: Representa una celda individual con propiedades y estado
   - `GameBoard`: Gestiona el estado del juego y la lógica del tablero

2. **Controlador**
   - `GameController`: Maneja las interacciones del usuario y el flujo del juego

3. **Vista**
   - `UIRenderer`: Gestiona la visualización y renderización del juego

### Clases y Responsabilidades

#### Cell
- Encapsula el estado de una celda (oculta, revelada o marcada)
- Almacena información sobre minas y conteo de minas adyacentes
- Proporciona métodos para revelar, marcar y reiniciar la celda

#### GameBoard
- Crea y gestiona la cuadrícula 2D de celdas
- Coloca minas aleatoriamente, asegurando que el primer clic sea seguro
- Maneja la revelación de celdas, incluyendo la expansión recursiva para celdas vacías
- Mantiene el estado del juego y verifica las condiciones de victoria

#### GameController
- Maneja el flujo del juego y las interacciones del usuario
- Gestiona el temporizador y el contador de minas
- Responde a clics y marcas en las celdas
- Determina las condiciones de fin de juego y victoria

#### UIRenderer
- Crea y actualiza los elementos del DOM
- Renderiza el tablero de juego y las celdas individuales
- Actualiza la interfaz de usuario según los cambios en el estado del juego
- Configura los listeners de eventos para las interacciones del usuario

### Características

1. **Múltiples Niveles de Dificultad**
   - Principiante: Tablero 9x9 con 10 minas
   - Intermedio: Tablero 16x16 con 40 minas
   - Experto: Tablero 30x16 con 99 minas

2. **Mecánicas del Juego**
   - El primer clic siempre es seguro (nunca una mina)
   - Revelar una celda vacía expande la revelación a celdas vacías adyacentes
   - Clic derecho para marcar minas potenciales
   - El temporizador comienza en el primer clic
   - El contador de minas muestra las minas restantes sin marcar

3. **Accesibilidad**
   - Soporte completo para navegación con teclado
   - Atributos ARIA para lectores de pantalla
   - Retroalimentación visual para estados de enfoque y hover

4. **Pruebas**
   - Pruebas unitarias exhaustivas para la lógica principal del juego
   - Pruebas para la funcionalidad de celdas, inicialización del tablero, generación de minas y condiciones de victoria

## Construcción y Ejecución

### Requisitos Previos
- Un navegador web moderno
- Compilador de TypeScript (si se modifica el código fuente)

### Configuración
1. Clona o descarga el repositorio
2. Compila el archivo TypeScript si es necesario:
3. Abre `index.html` en un navegador web

## Decisiones de Diseño

### Uso de TypeScript
- Se utiliza tipado estricto para una mayor confiabilidad del código
- Las interfaces definen contratos claros entre componentes
- Los enums proporcionan seguridad de tipos para estados del juego y niveles de dificultad

### Separación de Responsabilidades
- La lógica del juego está completamente separada de la renderización de la interfaz
- El controlador actúa como mediador entre el modelo y la vista
- Cada clase tiene una única responsabilidad

### Accesibilidad
- El juego es completamente jugable solo con el teclado
- Los atributos ARIA proporcionan contexto para lectores de pantalla
- Colores de alto contraste para los números de las celdas

### Organización del Código
- Estructura modular para un mantenimiento sencillo
- Convenciones de nombres claras
- Comentarios y documentación completos

## Mejoras Futuras

- Puntuaciones máximas persistentes
- Configuración personalizada de dificultad
- Opciones de marcado más avanzadas (signos de interrogación)
- Temas y apariencia personalizable
- Optimización para dispositivos móviles
- Animaciones y efectos de sonido

## Licencia

Este proyecto está disponible para uso personal y educativo.