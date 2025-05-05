# Manual Técnico - MazeBot 3D
# IA1 - G21

## Descripción General
MazeBot es una aplicación web en JavaScript que permite cargar un laberinto en formato JSON y resolverlo utilizando algoritmos de búsqueda, visualizándolo en 3D con Three.js. La aplicación está orientada al aprendizaje de Inteligencia Artificial y estructuras de datos.

---

## Guía de Instalación
1. Clona o descarga el repositorio.
2. Abre `index.html` en cualquier navegador moderno (preferiblemente Chrome o Edge).
3. No se requiere instalación adicional, ya que todas las dependencias (Three.js, GLTFLoader, SweetAlert2) se cargan vía CDN.

---

## Estructura del Proyecto

/assets
/css
- laberinto.css → Estilo general de la aplicación
- admin.css → Estilo del panel de administración
/images
- cesped.jpg → Textura de suelo
/scripts
- index.js → Controlador principal de MazeBot
- robot.js → Clase Robot con animaciones y movimiento
- algoritmos.js → Implementación de algoritmos BFS, DFS, A*
facil.json, medio.json → Archivos JSON de ejemplo
index.html → Interfaz principal del laberinto

---

## Arquitectura del Sistema

- **Capa de Presentación**: HTML + CSS estilizado como una aventura clásica.
- **Capa de Control**: `index.js` maneja eventos y lógica de interacción.
- **Capa de Renderizado**: `Renderer` (en `index.js`) genera y mantiene la escena en Three.js.
- **Capa de IA**: Algoritmos implementados en `algoritmos.js`.

---

## Flujo del Sistema

1. El usuario carga un archivo `.json`.
2. El sistema valida la estructura (`ancho`, `alto`, `inicio`, `fin`, `paredes`).
3. Se construye el laberinto en 3D con texturas y banderas animadas.
4. El usuario selecciona un algoritmo y MazeBot encuentra la solución.
5. El robot se anima automáticamente siguiendo el camino resuelto.

---

## Algoritmos de Búsqueda

### 🔹 BFS (Breadth-First Search)
- Explora en anchura.
- Garantiza el camino más corto.
- Ideal para laberintos con muchos caminos posibles.

### 🔹 DFS (Depth-First Search)
- Explora en profundidad.
- Puede encontrar una solución más rápido, pero no siempre es la más corta.
- Útil en espacios grandes donde el objetivo está lejos.

### 🔹 A* (A-Star)
- Usa heurística (distancia de Manhattan).
- Balancea eficiencia y precisión.
- Es el más completo y recomendado si se conoce la meta.

**Justificación de uso**: Se eligieron estos tres algoritmos por ser clásicos en IA, comparar su eficiencia y observar visualmente cómo difieren en exploración y rendimiento.

---

## Herramientas Utilizadas

- **Three.js**: Motor de gráficos 3D.
- **GLTFLoader**: Carga modelos 3D (robot).
- **SweetAlert2**: Diálogos modales.
- **JavaScript ES6**: Lógica de aplicación.
- **HTML/CSS**: Diseño responsivo.

---

## Validación
Los archivos JSON se validan antes de renderizar:
- `ancho` y `alto`: deben ser enteros.
- `inicio`, `fin`: arreglos de dos enteros.
- `paredes`: arreglo de coordenadas `[x, y]`.

---

## JSON de Ejemplo

### fácil.json
```json
{
  "ancho": 5,
  "alto": 5,
  "inicio": [0, 0],
  "fin": [4, 4],
  "paredes": [[1,0], [1,1], [1,2], ...]
}


