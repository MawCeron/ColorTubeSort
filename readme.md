# 🧪 Acomoda las Bolitas (Ball Sort Puzzle)

**Acomoda las Bolitas** es un juego de rompecabezas tipo *Ball Sort Puzzle*, hecho con puro HTML, CSS y JavaScript vanilla — sin frameworks ni librerías. Es una SPA ligera, rápida, jugable desde el navegador, y libre de anuncios. Diseñado para ser fácil de jugar pero con retos crecientes que te pican el orgullo.


## 🧠 ¿De qué va?

El juego reta al jugador a ordenar bolitas de colores dentro de tubos. Cada nivel presenta una combinación distinta, y las reglas son simples pero adictivas: solo puedes mover una bolita a la vez, y solo si encaja con el color de la que está encima.


## 📐 Arquitectura del Sistema

### 🖼 Frontend (todo corre en el navegador)
- **Vanilla JS con clases**: Modular, claro y mantenible.
- **SPA**: Una sola página, múltiples pantallas alternadas con CSS.
- **Diseño por componentes**: Clases separadas para cada sistema.
- **Arquitectura por eventos**: `addEventListener` a full, sin frameworks.

### 🧩 Componentes Clave

#### 🔧 Clases del Juego
- `script.js`: Orquesta todo, maneja navegación y estado general.
- `game.js`: Lógica pura del juego: tubos, reglas, movimientos y victorias.
- `levels.js`: Genera niveles con dificultad progresiva.
- `audio.js`: Efectos y música usando la Web Audio API.
- `storage.js`: Guarda progreso, configuración y estadísticas en `localStorage`.

#### 🎮 Mecánicas del Juego
- Sistema de tubos y bolitas por colores.
- Más de 20 niveles, cada vez más complicados.
- Contador de movimientos y cronómetro.
- Sistema de deshacer para corregir errores.



## 🔄 Flujo de Datos

1. **Inicio** → Se cargan sonidos y progreso guardado → Menú principal.
2. **Selección de nivel** → `LevelsManager` da el nivel → Inicia partida.
3. **Juego** → El jugador interactúa → Se validan movimientos → Se actualiza estado y sonido.
4. **Victoria** → Se guarda progreso → Se actualiza estadísticas → Nivel desbloqueado.


## 🌐 Dependencias Web

- **Web Audio API**: Para sonidos generados en tiempo real.
- **Local Storage API**: Guarda todo en el navegador del usuario.
- **(Opcional) Canvas API**: Puede usarse para mejorar gráficos (no esencial).
- **Google Fonts**: Tipografía *Poppins*.
- **CSS Gradients**: Estética sin imágenes.


## 💾 Estructura de Datos

### 🔐 `localStorage`
```js
{
  currentLevel: number,
  totalMoves: number,
  totalTime: number,
  levelsCompleted: { [nivel]: { moves, time, stars } },
  highScores: { [nivel]: { bestMoves, bestTime } },
  achievements: [],
  lastPlayed: timestamp
}
````

### 🧠 Configuración de Nivel

* Dificultad progresiva: de 4 a 7+ colores.
* Algunos tubos vacíos, otros revueltos.
* Máximo de 4 bolitas por tubo.


## 🚀 Despliegue

### 100% Frontend

* **Sin backend**: Todo se guarda local.
* **Sin build**: Solo sube los archivos a cualquier hosting estático.
* **Compatibilidad**: Corre en cualquier navegador moderno.

### 📁 Estructura de Archivos

```
/
├── index.html       # Estructura principal
├── styles.css       # Estilos y animaciones
├── script.js        # Controlador principal
├── game.js          # Lógica de juego
├── levels.js        # Niveles
├── audio.js         # Sonidos y música
└── storage.js       # Persistencia de datos
```


## 🧠 Decisiones Técnicas

### ¿Por qué Vanilla JS?

* **Sencillez**: Menos dependencias, menos peso.
* **Rendimiento**: DOM directo sin overhead.
* **Educativo**: Refuerza fundamentos del desarrollo web.

### ¿Por qué Web Audio API?

* **Efectos generativos** sin necesidad de archivos `.mp3`.
* **Control preciso** de tiempos y volúmenes.
* **Ligero**: No necesitas precargar audios grandes.

### ¿Por qué Local Storage?

* **Todo offline**: No dependes de internet ni servidores.
* **Instantáneo**: Carga al momento.
* **Privacidad**: Nada sale del navegador.

### ¿Por qué clases?

* **Separación de responsabilidades**: Cada parte hace lo suyo.
* **Mantenible**: Fácil de escalar o modificar.
* **Testeable**: Cada clase puede aislarse y probarse.


## 💬 ¿Comentarios, ideas o bugs?

¡Bienvenido sea todo lo que ayude a mejorar el juego!
Puedes abrir un issue o lanzar un PR.


## 🎁 Bonus: ¿Para quién es esto?

Este juego fue hecho con cariño, sin anuncios ni microtransacciones, para compartir algo bonito, relajado y divertido.


**¡Acomoda esas bolitas como se debe!**