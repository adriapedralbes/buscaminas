/**
 * Implementación de Buscaminas en TypeScript
 * 
 * Una implementación limpia y moderna del clásico juego Buscaminas usando TypeScript.
 * Sigue principios de programación orientada a objetos con una clara separación
 * entre la lógica del juego y los componentes de la interfaz de usuario.
 */

// ================= ENUMS E INTERFACES =================

/**
 * Representa el estado de una celda en el tablero de juego
 */
enum CellState {
    Hidden,
    Revealed,
    Flagged
}

/**
 * Representa el estado actual del juego
 */
enum GameStatus {
    NotStarted,
    InProgress,
    Won,
    Lost
}

/**
 * Representa los niveles de dificultad disponibles en el juego
 */
enum GameDifficulty {
    Beginner,
    Intermediate,
    Expert
}

/**
 * Representa una posición en el tablero de juego
 */
interface Position {
    row: number;
    col: number;
}

/**
 * Configuración del tablero de juego
 */
interface GameConfig {
    rows: number;
    cols: number;
    mines: number;
}

/**
 * Estado del juego
 */
interface GameState {
    status: GameStatus;
    timeElapsed: number;
    flagsPlaced: number;
    remainingMines: number;
}

/**
 * Resultado de revelar una celda
 */
interface RevealResult {
    success: boolean;
    hitMine: boolean;
    cellsRevealed: Position[];
}

// ================= CLASE CELDA =================

/**
 * Representa una celda individual en el tablero de Buscaminas
 */
class Cell {
    private position: Position;
    private isMine: boolean;
    private adjacentMines: number;
    private state: CellState;

    /**
     * Crea una nueva celda en la posición especificada
     * 
     * @param position Posición de la celda en el tablero
     * @param isMine Indica si la celda contiene una mina
     */
    constructor(position: Position, isMine: boolean = false) {
        this.position = position;
        this.isMine = isMine;
        this.adjacentMines = 0;
        this.state = CellState.Hidden;
    }

    // Getters
    getPosition(): Position { return this.position; }
    isMineCell(): boolean { return this.isMine; }
    getAdjacentMines(): number { return this.adjacentMines; }
    getState(): CellState { return this.state; }

    // Setters
    setMine(value: boolean): void { this.isMine = value; }
    setAdjacentMines(count: number): void { this.adjacentMines = count; }

    /**
     * Revela la celda si no está marcada con bandera
     * @returns true si la celda fue revelada, false en caso contrario
     */
    reveal(): boolean {
        if (this.state === CellState.Flagged) return false;
        this.state = CellState.Revealed;
        return true;
    }

    /**
     * Cambia el estado de bandera de la celda si no está revelada
     * @returns El nuevo estado de la celda
     */
    toggleFlag(): CellState {
        if (this.state === CellState.Revealed) return this.state;
        this.state = this.state === CellState.Hidden ? CellState.Flagged : CellState.Hidden;
        return this.state;
    }

    /**
     * Reinicia la celda a su estado inicial
     */
    reset(): void {
        this.state = CellState.Hidden;
        this.isMine = false;
        this.adjacentMines = 0;
    }
}

// ================= CLASE TABLERO DE JUEGO =================

/**
 * Representa el tablero de juego del Buscaminas
 */
class GameBoard {
    private rows: number;
    private cols: number;
    private totalMines: number;
    private cells: Cell[][];
    private isFirstClick: boolean;

    /**
     * Crea un nuevo tablero de juego con la configuración especificada
     * 
     * @param config Configuración para el tablero de juego
     */
    constructor(config: GameConfig) {
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.isFirstClick = true;

        this.initializeBoard();
    }

    /**
     * Inicializa un tablero de juego vacío
     */
    private initializeBoard(): void {
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = new Cell({ row, col });
            }
        }
    }

    /**
     * Coloca minas aleatoriamente en el tablero, asegurando que la posición especificada sea segura
     * 
     * @param safePosition Posición que no debe contener una mina
     */
    placeMines(safePosition: Position): void {
        let minasColocadas = 0;

        while (minasColocadas < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // Saltar si es la posición segura o ya tiene mina
            if ((row === safePosition.row && col === safePosition.col) ||
                this.cells[row][col].isMineCell()) {
                continue;
            }

            this.cells[row][col].setMine(true);
            minasColocadas++;
        }

        // Calcular minas adyacentes para cada celda
        this.calculateAdjacentMines();
    }

    /**
     * Calcula el número de minas adyacentes para cada celda
     */
    private calculateAdjacentMines(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.cells[row][col].isMineCell()) {
                    const count = this.countAdjacentMines(row, col);
                    this.cells[row][col].setAdjacentMines(count);
                }
            }
        }
    }

    /**
     * Cuenta el número de minas adyacentes a la posición especificada
     * 
     * @param row Fila de la posición
     * @param col Columna de la posición
     * @returns Número de minas adyacentes
     */
    private countAdjacentMines(row: number, col: number): number {
        let count = 0;

        // Verificar las 8 celdas circundantes
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                // Saltar la celda actual
                if (r === row && c === col) continue;

                if (this.cells[r][c].isMineCell()) {
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * Revela la celda en la posición especificada
     * 
     * @param position Posición a revelar
     * @returns Resultado de la operación de revelar
     */
    revealCell(position: Position): RevealResult {
        const { row, col } = position;

        // Manejar primer clic
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(position);
        }

        const cell = this.cells[row][col];

        // Si la celda está marcada o ya revelada, no hacer nada
        if (cell.getState() !== CellState.Hidden) {
            return { success: false, hitMine: false, cellsRevealed: [] };
        }

        // Si es una mina, fin del juego
        if (cell.isMineCell()) {
            cell.reveal();
            return { success: true, hitMine: true, cellsRevealed: [position] };
        }

        // Revelar la celda y potencialmente sus vecinas
        const revealedCells: Position[] = [];
        this.revealCellRecursive(row, col, revealedCells);

        return { success: true, hitMine: false, cellsRevealed: revealedCells };
    }

    /**
     * Revela celdas recursivamente empezando desde la posición especificada
     * 
     * @param row Fila de la posición inicial
     * @param col Columna de la posición inicial
     * @param revealedCells Array para recolectar posiciones de celdas reveladas
     */
    private revealCellRecursive(row: number, col: number, revealedCells: Position[]): void {
        const cell = this.cells[row][col];

        // Saltar si la celda ya está revelada o marcada
        if (cell.getState() !== CellState.Hidden) return;

        // Revelar la celda actual
        cell.reveal();
        revealedCells.push({ row, col });

        // Si no tiene minas adyacentes, revelar todas las vecinas
        if (cell.getAdjacentMines() === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    // Saltar la celda actual
                    if (r === row && c === col) continue;

                    this.revealCellRecursive(r, c, revealedCells);
                }
            }
        }
    }

    /**
     * Cambia el estado de bandera de la celda en la posición especificada
     * 
     * @param position Posición a cambiar
     * @returns true si la celda ahora está marcada, false en caso contrario
     */
    toggleFlag(position: Position): boolean {
        const { row, col } = position;
        const cell = this.cells[row][col];

        const newState = cell.toggleFlag();
        return newState === CellState.Flagged;
    }

    /**
     * Verifica si el juego ha sido ganado
     * 
     * @returns true si todas las celdas sin minas están reveladas
     */
    checkWinCondition(): boolean {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];

                // Si una celda sin mina sigue oculta, el juego no se ha ganado
                if (!cell.isMineCell() && cell.getState() !== CellState.Revealed) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Revela todas las minas en el tablero
     */
    revealAllMines(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.isMineCell()) {
                    cell.reveal();
                }
            }
        }
    }

    /**
     * Obtiene la celda en la posición especificada
     * 
     * @param position Posición a obtener
     * @returns La celda en la posición especificada
     */
    getCell(position: Position): Cell {
        return this.cells[position.row][position.col];
    }

    /**
     * Obtiene todas las celdas del tablero
     * 
     * @returns Un array 2D con todas las celdas
     */
    getCells(): Cell[][] {
        return this.cells;
    }

    /**
     * Obtiene las dimensiones del tablero
     * 
     * @returns Filas y columnas del tablero
     */
    getDimensions(): { rows: number, cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    /**
     * Obtiene el número total de minas en el tablero
     * 
     * @returns Número de minas
     */
    getMineCount(): number {
        return this.totalMines;
    }

    /**
     * Reinicia el tablero con la configuración especificada
     * 
     * @param config Configuración para el tablero
     */
    reset(config: GameConfig): void {
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.isFirstClick = true;

        this.initializeBoard();
    }
}

// ================= CLASE CONTROLADOR DEL JUEGO =================

/**
 * Controla el flujo del juego y maneja las interacciones del usuario
 */
class GameController {
    private gameBoard: GameBoard;
    private gameState: GameState;
    private timer: number | null;
    private startTime: number;
    private uiRenderer: UIRenderer;

    /**
     * Crea un nuevo controlador de juego
     * 
     * @param uiRenderer El renderizador de UI a utilizar
     */
    constructor(uiRenderer: UIRenderer) {
        this.uiRenderer = uiRenderer;
        this.gameState = {
            status: GameStatus.NotStarted,
            timeElapsed: 0,
            flagsPlaced: 0,
            remainingMines: 0
        };
        this.timer = null;
        this.startTime = 0;

        // Inicializar con dificultad principiante por defecto
        this.setDifficulty(GameDifficulty.Beginner);
    }

    /**
     * Establece la dificultad del juego
     * 
     * @param difficulty Dificultad a establecer
     */
    setDifficulty(difficulty: GameDifficulty): void {
        let config: GameConfig;

        switch (difficulty) {
            case GameDifficulty.Beginner:
                config = { rows: 9, cols: 9, mines: 10 };
                break;
            case GameDifficulty.Intermediate:
                config = { rows: 16, cols: 16, mines: 40 };
                break;
            case GameDifficulty.Expert:
                config = { rows: 16, cols: 30, mines: 99 };
                break;
            default:
                config = { rows: 9, cols: 9, mines: 10 };
        }

        if (this.gameBoard) {
            this.gameBoard.reset(config);
        } else {
            this.gameBoard = new GameBoard(config);
        }

        this.resetGame();
        this.uiRenderer.renderBoard(this.gameBoard);
        this.updateGameState();
    }

    /**
     * Reinicia el juego a su estado inicial
     */
    resetGame(): void {
        this.stopTimer();

        this.gameState = {
            status: GameStatus.NotStarted,
            timeElapsed: 0,
            flagsPlaced: 0,
            remainingMines: this.gameBoard.getMineCount()
        };

        this.updateGameState();
    }

    /**
     * Maneja un clic izquierdo en una celda
     * 
     * @param position Posición clickeada
     */
    handleCellClick(position: Position): void {
        // Ignorar clics si el juego terminó
        if (this.gameState.status === GameStatus.Won || this.gameState.status === GameStatus.Lost) {
            return;
        }

        // Iniciar temporizador en el primer clic
        if (this.gameState.status === GameStatus.NotStarted) {
            this.startTimer();
            this.gameState.status = GameStatus.InProgress;
        }

        const result = this.gameBoard.revealCell(position);

        if (result.success) {
            if (result.hitMine) {
                this.gameOver(false);
            } else {
                // Actualizar UI para celdas reveladas
                for (const pos of result.cellsRevealed) {
                    this.uiRenderer.updateCell(this.gameBoard.getCell(pos));
                }

                // Verificar condición de victoria
                if (this.gameBoard.checkWinCondition()) {
                    this.gameOver(true);
                }
            }
        }

        this.updateGameState();
    }

    /**
     * Maneja un clic derecho en una celda
     * 
     * @param position Posición clickeada
     */
    handleCellRightClick(position: Position): void {
        // Ignorar si el juego no está en progreso
        if (this.gameState.status !== GameStatus.InProgress &&
            this.gameState.status !== GameStatus.NotStarted) {
            return;
        }

        // Iniciar temporizador en primera acción
        if (this.gameState.status === GameStatus.NotStarted) {
            this.startTimer();
            this.gameState.status = GameStatus.InProgress;
        }

        const isFlagged = this.gameBoard.toggleFlag(position);

        // Actualizar contador de banderas
        if (isFlagged) {
            this.gameState.flagsPlaced++;
        } else {
            this.gameState.flagsPlaced--;
        }

        this.gameState.remainingMines = this.gameBoard.getMineCount() - this.gameState.flagsPlaced;

        // Actualizar UI de la celda
        this.uiRenderer.updateCell(this.gameBoard.getCell(position));
        this.updateGameState();
    }

    /**
     * Finaliza el juego
     * 
     * @param isWin Indica si el juego fue ganado
     */
    private gameOver(isWin: boolean): void {
        this.stopTimer();

        if (isWin) {
            this.gameState.status = GameStatus.Won;
            // Marcar todas las minas al ganar
            const cells = this.gameBoard.getCells();
            for (let row = 0; row < cells.length; row++) {
                for (let col = 0; col < cells[row].length; col++) {
                    const cell = cells[row][col];
                    if (cell.isMineCell() && cell.getState() !== CellState.Flagged) {
                        this.gameBoard.toggleFlag({ row, col });
                        this.gameState.flagsPlaced++;
                        this.uiRenderer.updateCell(cell);
                    }
                }
            }
            this.gameState.remainingMines = 0;
        } else {
            this.gameState.status = GameStatus.Lost;
            this.gameBoard.revealAllMines();

            // Actualizar UI para mostrar todas las minas
            const cells = this.gameBoard.getCells();
            for (let row = 0; row < cells.length; row++) {
                for (let col = 0; col < cells[row].length; col++) {
                    const cell = cells[row][col];
                    if (cell.isMineCell()) {
                        this.uiRenderer.updateCell(cell);
                    }
                }
            }
        }
    }

    /**
     * Inicia el temporizador del juego
     */
    private startTimer(): void {
        this.startTime = Date.now();
        this.timer = window.setInterval(() => {
            this.gameState.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateGameState();
        }, 1000);
    }

    /**
     * Detiene el temporizador del juego
     */
    private stopTimer(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Actualiza el estado del juego en la UI
     */
    private updateGameState(): void {
        this.uiRenderer.updateGameState(this.gameState);
    }

    /**
     * Inicia un nuevo juego con la dificultad actual
     */
    newGame(): void {
        const { rows, cols } = this.gameBoard.getDimensions();
        const mines = this.gameBoard.getMineCount();
        this.gameBoard.reset({ rows, cols, mines });
        this.resetGame();
        this.uiRenderer.renderBoard(this.gameBoard);
    }
}

// ================= CLASE RENDERIZADOR DE UI =================

/**
 * Renderiza la interfaz de usuario y maneja interacciones con el DOM
 */
class UIRenderer {
    private boardElement: HTMLElement;
    private statusElement: HTMLElement;
    private timerElement: HTMLElement;
    private mineCounterElement: HTMLElement;
    private newGameButton: HTMLElement;
    private difficultySelect: HTMLSelectElement;

    /**
     * Crea un nuevo renderizador de UI
     */
    constructor() {
        this.boardElement = document.getElementById('game-board') as HTMLElement;
        this.statusElement = document.getElementById('game-status') as HTMLElement;
        this.timerElement = document.getElementById('timer') as HTMLElement;
        this.mineCounterElement = document.getElementById('mine-counter') as HTMLElement;
        this.newGameButton = document.getElementById('new-game-button') as HTMLElement;
        this.difficultySelect = document.getElementById('difficulty-select') as HTMLSelectElement;

        if (!this.boardElement || !this.statusElement || !this.timerElement ||
            !this.mineCounterElement || !this.newGameButton || !this.difficultySelect) {
            throw new Error('¡Elementos de UI requeridos no encontrados!');
        }
    }

    /**
     * Renderiza el tablero de juego
     * 
     * @param gameBoard Tablero de juego a renderizar
     */
    renderBoard(gameBoard: GameBoard): void {
        // Limpiar tablero existente
        this.boardElement.innerHTML = '';

        const { rows, cols } = gameBoard.getDimensions();

        // Establecer propiedades de grid CSS
        this.boardElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

        // Crear celdas
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = gameBoard.getCell({ row, col });
                const cellElement = this.createCellElement(cell);

                this.boardElement.appendChild(cellElement);
            }
        }
    }

    /**
     * Crea un elemento DOM para una celda
     * 
     * @param cell Celda para crear el elemento
     * @returns El elemento creado
     */
    private createCellElement(cell: Cell): HTMLElement {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.dataset.row = cell.getPosition().row.toString();
        cellElement.dataset.col = cell.getPosition().col.toString();

        // Atributos de accesibilidad
        cellElement.setAttribute('role', 'button');
        cellElement.setAttribute('tabindex', '0');
        cellElement.setAttribute('aria-label', `Celda en fila ${cell.getPosition().row + 1}, columna ${cell.getPosition().col + 1}`);

        this.updateCellElement(cellElement, cell);

        return cellElement;
    }

    /**
     * Actualiza la UI de una celda
     * 
     * @param cell Celda a actualizar
     */
    updateCell(cell: Cell): void {
        const position = cell.getPosition();
        const cellElement = this.boardElement.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`) as HTMLElement;

        if (cellElement) {
            this.updateCellElement(cellElement, cell);
        }
    }

    /**
     * Actualiza un elemento de celda para igualar el estado de una celda
     * 
     * @param cellElement Elemento a actualizar
     * @param cell Celda de referencia
     */
    private updateCellElement(cellElement: HTMLElement, cell: Cell): void {
        // Reiniciar clases
        cellElement.className = 'cell';
        cellElement.textContent = '';

        // Establecer clases y contenido según estado
        switch (cell.getState()) {
            case CellState.Hidden:
                cellElement.classList.add('hidden');
                break;

            case CellState.Flagged:
                cellElement.classList.add('flagged');
                cellElement.textContent = '🚩';
                cellElement.setAttribute('aria-label', 'Celda marcada');
                break;

            case CellState.Revealed:
                cellElement.classList.add('revealed');

                if (cell.isMineCell()) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '💣';
                    cellElement.setAttribute('aria-label', 'Mina');
                } else {
                    const adjacentMines = cell.getAdjacentMines();
                    if (adjacentMines > 0) {
                        cellElement.textContent = adjacentMines.toString();
                        cellElement.classList.add(`adjacent-${adjacentMines}`);
                        cellElement.setAttribute('aria-label', `${adjacentMines} minas adyacentes`);
                    } else {
                        cellElement.setAttribute('aria-label', 'Celda vacía');
                    }
                }
                break;
        }
    }

    /**
     * Actualiza el estado del juego en la UI
     * 
     * @param gameState Estado del juego a mostrar
     */
    updateGameState(gameState: GameState): void {
        // Actualizar estado
        switch (gameState.status) {
            case GameStatus.NotStarted:
                this.statusElement.textContent = 'Haz clic para comenzar';
                this.statusElement.className = '';
                break;

            case GameStatus.InProgress:
                this.statusElement.textContent = 'Juego en progreso';
                this.statusElement.className = 'in-progress';
                break;

            case GameStatus.Won:
                this.statusElement.textContent = '¡Ganaste! 🎉';
                this.statusElement.className = 'won';
                break;

            case GameStatus.Lost:
                this.statusElement.textContent = 'Juego Perdido 💥';
                this.statusElement.className = 'lost';
                break;
        }

        // Actualizar temporizador
        this.timerElement.textContent = gameState.timeElapsed.toString().padStart(3, '0');

        // Actualizar contador de minas
        this.mineCounterElement.textContent = Math.max(0, gameState.remainingMines).toString().padStart(3, '0');
    }

    /**
     * Configura los event listeners para interacciones del usuario
     * 
     * @param controller Controlador de juego a utilizar
     */
    setupEventListeners(controller: GameController): void {
        // Eventos de clic en celdas
        this.boardElement.addEventListener('click', (event) => {
            const cellElement = (event.target as HTMLElement).closest('.cell') as HTMLElement;
            if (cellElement) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);
                controller.handleCellClick({ row, col });
            }
        });

        // Eventos de clic derecho en celdas
        this.boardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const cellElement = (event.target as HTMLElement).closest('.cell') as HTMLElement;
            if (cellElement) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);
                controller.handleCellRightClick({ row, col });
            }
        });

        // Soporte para teclado en celdas
        this.boardElement.addEventListener('keydown', (event) => {
            const cellElement = event.target as HTMLElement;
            if (cellElement.classList.contains('cell')) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);

                // Enter o Espacio para revelar celda
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    controller.handleCellClick({ row, col });
                }

                // Tecla F para marcar celda
                if (event.key === 'f' || event.key === 'F') {
                    event.preventDefault();
                    controller.handleCellRightClick({ row, col });
                }
            }
        });

        // Botón de nuevo juego
        this.newGameButton.addEventListener('click', () => {
            controller.newGame();
        });

        // Selección de dificultad
        this.difficultySelect.addEventListener('change', () => {
            const difficulty = parseInt(this.difficultySelect.value, 10) as GameDifficulty;
            controller.setDifficulty(difficulty);
        });
    }
}

// ================= PRUEBAS UNITARIAS =================

/**
 * Ejecuta pruebas unitarias para el juego Buscaminas
 */
class TestRunner {
    runTests(): void {
        this.testCellFunctionality();
        this.testBoardInitialization();
        this.testMineGeneration();
        this.testRevealCell();
        this.testWinCondition();

        console.log('Todas las pruebas completadas exitosamente.');
    }

    private testCellFunctionality(): void {
        console.log('Probando funcionalidad de la celda...');

        // Crear una celda
        const cell = new Cell({ row: 0, col: 0 }, false);

        // Probar estado inicial
        this.assert(cell.getState() === CellState.Hidden, 'La celda debería estar oculta inicialmente');
        this.assert(!cell.isMineCell(), 'La celda no debería ser una mina inicialmente');

        // Probar cambio de bandera
        cell.toggleFlag();
        this.assert(cell.getState() === CellState.Flagged, 'La celda debería estar marcada después de cambiar');

        cell.toggleFlag();
        this.assert(cell.getState() === CellState.Hidden, 'La celda debería estar oculta después del segundo cambio');

        // Probar revelado
        cell.reveal();
        this.assert(cell.getState() === CellState.Revealed, 'La celda debería estar revelada después de reveal()');

        // Probar reinicio
        cell.reset();
        this.assert(cell.getState() === CellState.Hidden, 'La celda debería estar oculta después de reset');
        this.assert(!cell.isMineCell(), 'La celda no debería ser una mina después de reset');

        console.log('Pruebas de funcionalidad de celda pasadas.');
    }

    private testBoardInitialization(): void {
        console.log('Probando inicialización del tablero...');

        // Crear tablero 5x5 con 5 minas
        const board = new GameBoard({ rows: 5, cols: 5, mines: 5 });

        const { rows, cols } = board.getDimensions();
        this.assert(rows === 5 && cols === 5, 'Las dimensiones del tablero deberían ser 5x5');
        this.assert(board.getMineCount() === 5, 'El tablero debería tener 5 minas');

        // Verificar que todas las celdas están ocultas inicialmente
        const cells = board.getCells();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.assert(cells[r][c].getState() === CellState.Hidden, `Celda en (${r}, ${c}) debería estar oculta`);
            }
        }

        console.log('Pruebas de inicialización del tablero pasadas.');
    }

    private testMineGeneration(): void {
        console.log('Probando generación de minas...');

        // Crear tablero 5x5 con 5 minas
        const board = new GameBoard({ rows: 5, cols: 5, mines: 5 });

        // Colocar minas con posición segura en (0, 0)
        board.placeMines({ row: 0, col: 0 });

        // Contar número de minas
        let mineCount = 0;
        const cells = board.getCells();
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (cells[r][c].isMineCell()) {
                    mineCount++;
                }
            }
        }

        this.assert(mineCount === 5, `El tablero debería tener 5 minas, encontradas ${mineCount}`);
        this.assert(!cells[0][0].isMineCell(), 'La posición segura no debería tener una mina');

        console.log('Pruebas de generación de minas pasadas.');
    }

    private testRevealCell(): void {
        console.log('Probando funcionalidad de revelar celdas...');

        // Crear tablero 3x3 con 1 mina en (1, 1)
        const board = new GameBoard({ rows: 3, cols: 3, mines: 1 });

        // Colocar mina manualmente en (1, 1)
        const cells = board.getCells();
        cells[1][1].setMine(true);

        // Calcular minas adyacentes
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (!cells[r][c].isMineCell()) {
                    let adjacentMines = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3 && cells[nr][nc].isMineCell()) {
                                adjacentMines++;
                            }
                        }
                    }
                    cells[r][c].setAdjacentMines(adjacentMines);
                }
            }
        }

        // Probar primer clic (debería ser seguro)
        const result1 = board.revealCell({ row: 0, col: 0 });
        this.assert(result1.success, 'Revelado debería ser exitoso');
        this.assert(!result1.hitMine, 'No debería encontrar una mina');
        this.assert(result1.cellsRevealed.length === 1, 'Debería revelar exactamente 1 celda');
        this.assert(cells[0][0].getState() === CellState.Revealed, 'Celda (0, 0) debería estar revelada');

        // Probar revelar una mina
        const result2 = board.revealCell({ row: 1, col: 1 });
        this.assert(result2.success, 'Revelado debería ser exitoso');
        this.assert(result2.hitMine, 'Debería encontrar una mina');
        this.assert(cells[1][1].getState() === CellState.Revealed, 'Celda mina debería estar revelada');

        console.log('Pruebas de revelado de celdas pasadas.');
    }

    private testWinCondition(): void {
        console.log('Probando condición de victoria...');

        // Crear tablero 3x3 con 1 mina en (1, 1)
        const board = new GameBoard({ rows: 3, cols: 3, mines: 1 });

        // Colocar mina manualmente en (1, 1)
        const cells = board.getCells();
        cells[1][1].setMine(true);

        // Revelar todas las celdas sin minas
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (!cells[r][c].isMineCell()) {
                    cells[r][c].reveal();
                }
            }
        }

        // Verificar condición de victoria
        this.assert(board.checkWinCondition(), 'Condición de victoria debería ser cierta cuando todas las celdas sin minas están reveladas');

        // Reiniciar una celda
        cells[0][0].reset();

        // Verificar condición de victoria de nuevo
        this.assert(!board.checkWinCondition(), 'Condición de victoria debería ser falsa cuando no todas las celdas sin minas están reveladas');

        console.log('Pruebas de condición de victoria pasadas.');
    }

    private assert(condition: boolean, message: string): void {
        if (!condition) {
            console.error(`Error en la prueba: ${message}`);
            throw new Error(`Error en la prueba: ${message}`);
        }
    }
}

// ================= PUNTO DE ENTRADA DE LA APLICACIÓN =================

/**
 * Inicializa el juego Buscaminas cuando el DOM está listo
 */
window.addEventListener('DOMContentLoaded', () => {
    const uiRenderer = new UIRenderer();
    const gameController = new GameController(uiRenderer);

    uiRenderer.setupEventListeners(gameController);

    // Ejecutar pruebas en entornos no productivos si es necesario
    // const testRunner = new TestRunner();
    // testRunner.runTests();
});