/**
 * TypeScript Minesweeper Implementation
 * 
 * A clean, modern implementation of the classic Minesweeper game using TypeScript.
 * This implementation follows object-oriented principles with a clear separation of
 * concerns between game logic and UI components.
 */

// ================= ENUMS AND INTERFACES =================

/**
 * Represents the state of a cell on the game board
 */
enum CellState {
    Hidden,
    Revealed,
    Flagged
}

/**
 * Represents the current status of the game
 */
enum GameStatus {
    NotStarted,
    InProgress,
    Won,
    Lost
}

/**
 * Represents the difficulty levels available in the game
 */
enum GameDifficulty {
    Beginner,
    Intermediate,
    Expert
}

/**
 * Represents a position on the game board
 */
interface Position {
    row: number;
    col: number;
}

/**
 * Configuration for the game board
 */
interface GameConfig {
    rows: number;
    cols: number;
    mines: number;
}

/**
 * State of the game
 */
interface GameState {
    status: GameStatus;
    timeElapsed: number;
    flagsPlaced: number;
    remainingMines: number;
}

/**
 * Result of revealing a cell
 */
interface RevealResult {
    success: boolean;
    hitMine: boolean;
    cellsRevealed: Position[];
}

// ================= CELL CLASS =================

/**
 * Represents a single cell on the Minesweeper game board
 */
class Cell {
    private position: Position;
    private isMine: boolean;
    private adjacentMines: number;
    private state: CellState;

    /**
     * Creates a new cell at the specified position
     * 
     * @param position The position of the cell on the board
     * @param isMine Whether the cell contains a mine
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
     * Reveals the cell if it's not flagged
     * @returns true if the cell was revealed, false otherwise
     */
    reveal(): boolean {
        if (this.state === CellState.Flagged) return false;
        this.state = CellState.Revealed;
        return true;
    }

    /**
     * Toggles the flag state of the cell if it's not revealed
     * @returns The new state of the cell
     */
    toggleFlag(): CellState {
        if (this.state === CellState.Revealed) return this.state;
        this.state = this.state === CellState.Hidden ? CellState.Flagged : CellState.Hidden;
        return this.state;
    }

    /**
     * Resets the cell to its initial state
     */
    reset(): void {
        this.state = CellState.Hidden;
        this.isMine = false;
        this.adjacentMines = 0;
    }
}

// ================= GAME BOARD CLASS =================

/**
 * Represents the Minesweeper game board
 */
class GameBoard {
    private rows: number;
    private cols: number;
    private totalMines: number;
    private cells: Cell[][];
    private isFirstClick: boolean;

    /**
     * Creates a new game board with the specified configuration
     * 
     * @param config The configuration for the game board
     */
    constructor(config: GameConfig) {
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.isFirstClick = true;

        this.initializeBoard();
    }

    /**
     * Initializes an empty game board
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
     * Places mines randomly on the board, ensuring the specified position is safe
     * 
     * @param safePosition The position that should not contain a mine
     */
    placeMines(safePosition: Position): void {
        let minesPlaced = 0;

        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);

            // Skip if it's the safe position or already has a mine
            if ((row === safePosition.row && col === safePosition.col) ||
                this.cells[row][col].isMineCell()) {
                continue;
            }

            this.cells[row][col].setMine(true);
            minesPlaced++;
        }

        // Calculate adjacent mines for each cell
        this.calculateAdjacentMines();
    }

    /**
     * Calculates the number of adjacent mines for each cell
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
     * Counts the number of mines adjacent to the specified position
     * 
     * @param row The row of the position
     * @param col The column of the position
     * @returns The number of adjacent mines
     */
    private countAdjacentMines(row: number, col: number): number {
        let count = 0;

        // Check all 8 surrounding cells
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                // Skip the current cell
                if (r === row && c === col) continue;

                if (this.cells[r][c].isMineCell()) {
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * Reveals the cell at the specified position
     * 
     * @param position The position to reveal
     * @returns The result of the reveal operation
     */
    revealCell(position: Position): RevealResult {
        const { row, col } = position;

        // Handle first click
        if (this.isFirstClick) {
            this.isFirstClick = false;
            this.placeMines(position);
        }

        const cell = this.cells[row][col];

        // If the cell is flagged or already revealed, do nothing
        if (cell.getState() !== CellState.Hidden) {
            return { success: false, hitMine: false, cellsRevealed: [] };
        }

        // If it's a mine, game over
        if (cell.isMineCell()) {
            cell.reveal();
            return { success: true, hitMine: true, cellsRevealed: [position] };
        }

        // Otherwise, reveal the cell and potentially its neighbors
        const revealedCells: Position[] = [];
        this.revealCellRecursive(row, col, revealedCells);

        return { success: true, hitMine: false, cellsRevealed: revealedCells };
    }

    /**
     * Recursively reveals cells, starting from the specified position
     * 
     * @param row The row of the starting position
     * @param col The column of the starting position
     * @param revealedCells Array to collect revealed cell positions
     */
    private revealCellRecursive(row: number, col: number, revealedCells: Position[]): void {
        const cell = this.cells[row][col];

        // Skip if cell is already revealed or flagged
        if (cell.getState() !== CellState.Hidden) return;

        // Reveal the current cell
        cell.reveal();
        revealedCells.push({ row, col });

        // If it has no adjacent mines, reveal all neighboring cells
        if (cell.getAdjacentMines() === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    // Skip the current cell
                    if (r === row && c === col) continue;

                    this.revealCellRecursive(r, c, revealedCells);
                }
            }
        }
    }

    /**
     * Toggles the flag state of the cell at the specified position
     * 
     * @param position The position to toggle
     * @returns true if the cell is now flagged, false otherwise
     */
    toggleFlag(position: Position): boolean {
        const { row, col } = position;
        const cell = this.cells[row][col];

        const newState = cell.toggleFlag();
        return newState === CellState.Flagged;
    }

    /**
     * Checks if the game has been won
     * 
     * @returns true if all non-mine cells are revealed
     */
    checkWinCondition(): boolean {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];

                // If a non-mine cell is still hidden, the game is not won
                if (!cell.isMineCell() && cell.getState() !== CellState.Revealed) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Reveals all mines on the board
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
     * Gets the cell at the specified position
     * 
     * @param position The position to get
     * @returns The cell at the specified position
     */
    getCell(position: Position): Cell {
        return this.cells[position.row][position.col];
    }

    /**
     * Gets all cells on the board
     * 
     * @returns A 2D array of all cells
     */
    getCells(): Cell[][] {
        return this.cells;
    }

    /**
     * Gets the dimensions of the board
     * 
     * @returns The rows and columns of the board
     */
    getDimensions(): { rows: number, cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    /**
     * Gets the total number of mines on the board
     * 
     * @returns The number of mines
     */
    getMineCount(): number {
        return this.totalMines;
    }

    /**
     * Resets the game board with the specified configuration
     * 
     * @param config The configuration for the game board
     */
    reset(config: GameConfig): void {
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.isFirstClick = true;

        this.initializeBoard();
    }
}

// ================= GAME CONTROLLER CLASS =================

/**
 * Controls the game flow and handles user interactions
 */
class GameController {
    private gameBoard: GameBoard;
    private gameState: GameState;
    private timer: number | null;
    private startTime: number;
    private uiRenderer: UIRenderer;

    /**
     * Creates a new game controller
     * 
     * @param uiRenderer The UI renderer to use
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

        // Initialize with beginner difficulty by default
        this.setDifficulty(GameDifficulty.Beginner);
    }

    /**
     * Sets the difficulty of the game
     * 
     * @param difficulty The difficulty to set
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
     * Resets the game to its initial state
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
     * Handles a left-click on a cell
     * 
     * @param position The position that was clicked
     */
    handleCellClick(position: Position): void {
        // Ignore clicks if game is over
        if (this.gameState.status === GameStatus.Won || this.gameState.status === GameStatus.Lost) {
            return;
        }

        // Start timer on first click
        if (this.gameState.status === GameStatus.NotStarted) {
            this.startTimer();
            this.gameState.status = GameStatus.InProgress;
        }

        const result = this.gameBoard.revealCell(position);

        if (result.success) {
            if (result.hitMine) {
                this.gameOver(false);
            } else {
                // Update UI for all revealed cells
                for (const pos of result.cellsRevealed) {
                    this.uiRenderer.updateCell(this.gameBoard.getCell(pos));
                }

                // Check for win condition
                if (this.gameBoard.checkWinCondition()) {
                    this.gameOver(true);
                }
            }
        }

        this.updateGameState();
    }

    /**
     * Handles a right-click on a cell
     * 
     * @param position The position that was right-clicked
     */
    handleCellRightClick(position: Position): void {
        // Ignore right-clicks if game is not in progress
        if (this.gameState.status !== GameStatus.InProgress &&
            this.gameState.status !== GameStatus.NotStarted) {
            return;
        }

        // Start timer on first action
        if (this.gameState.status === GameStatus.NotStarted) {
            this.startTimer();
            this.gameState.status = GameStatus.InProgress;
        }

        const isFlagged = this.gameBoard.toggleFlag(position);

        // Update flag count
        if (isFlagged) {
            this.gameState.flagsPlaced++;
        } else {
            this.gameState.flagsPlaced--;
        }

        this.gameState.remainingMines = this.gameBoard.getMineCount() - this.gameState.flagsPlaced;

        // Update UI for the cell
        this.uiRenderer.updateCell(this.gameBoard.getCell(position));
        this.updateGameState();
    }

    /**
     * Ends the game
     * 
     * @param isWin Whether the game was won
     */
    private gameOver(isWin: boolean): void {
        this.stopTimer();

        if (isWin) {
            this.gameState.status = GameStatus.Won;
            // Set flags on all mines when game is won
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

            // Update UI to show all mines
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
     * Starts the game timer
     */
    private startTimer(): void {
        this.startTime = Date.now();
        this.timer = window.setInterval(() => {
            this.gameState.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateGameState();
        }, 1000);
    }

    /**
     * Stops the game timer
     */
    private stopTimer(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Updates the game state in the UI
     */
    private updateGameState(): void {
        this.uiRenderer.updateGameState(this.gameState);
    }

    /**
     * Starts a new game with the current difficulty
     */
    newGame(): void {
        const { rows, cols } = this.gameBoard.getDimensions();
        const mines = this.gameBoard.getMineCount();
        this.gameBoard.reset({ rows, cols, mines });
        this.resetGame();
        this.uiRenderer.renderBoard(this.gameBoard);
    }
}

// ================= UI RENDERER CLASS =================

/**
 * Renders the game UI and handles DOM interactions
 */
class UIRenderer {
    private boardElement: HTMLElement;
    private statusElement: HTMLElement;
    private timerElement: HTMLElement;
    private mineCounterElement: HTMLElement;
    private newGameButton: HTMLElement;
    private difficultySelect: HTMLSelectElement;

    /**
     * Creates a new UI renderer
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
            throw new Error('Required UI elements not found!');
        }
    }

    /**
     * Renders the game board
     * 
     * @param gameBoard The game board to render
     */
    renderBoard(gameBoard: GameBoard): void {
        // Clear existing board
        this.boardElement.innerHTML = '';

        const { rows, cols } = gameBoard.getDimensions();

        // Set CSS grid properties
        this.boardElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

        // Create cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = gameBoard.getCell({ row, col });
                const cellElement = this.createCellElement(cell);

                this.boardElement.appendChild(cellElement);
            }
        }
    }

    /**
     * Creates a DOM element for a cell
     * 
     * @param cell The cell to create an element for
     * @returns The created element
     */
    private createCellElement(cell: Cell): HTMLElement {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.dataset.row = cell.getPosition().row.toString();
        cellElement.dataset.col = cell.getPosition().col.toString();

        // Ensure proper accessibility attributes
        cellElement.setAttribute('role', 'button');
        cellElement.setAttribute('tabindex', '0');
        cellElement.setAttribute('aria-label', `Cell at row ${cell.getPosition().row + 1}, column ${cell.getPosition().col + 1}`);

        this.updateCellElement(cellElement, cell);

        return cellElement;
    }

    /**
     * Updates the UI for a cell
     * 
     * @param cell The cell to update
     */
    updateCell(cell: Cell): void {
        const position = cell.getPosition();
        const cellElement = this.boardElement.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`) as HTMLElement;

        if (cellElement) {
            this.updateCellElement(cellElement, cell);
        }
    }

    /**
     * Updates a cell element to match the state of a cell
     * 
     * @param cellElement The element to update
     * @param cell The cell to match
     */
    private updateCellElement(cellElement: HTMLElement, cell: Cell): void {
        // Reset classes
        cellElement.className = 'cell';
        cellElement.textContent = '';

        // Set state-based classes and content
        switch (cell.getState()) {
            case CellState.Hidden:
                cellElement.classList.add('hidden');
                break;

            case CellState.Flagged:
                cellElement.classList.add('flagged');
                cellElement.textContent = '🚩';
                cellElement.setAttribute('aria-label', 'Flagged cell');
                break;

            case CellState.Revealed:
                cellElement.classList.add('revealed');

                if (cell.isMineCell()) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '💣';
                    cellElement.setAttribute('aria-label', 'Mine');
                } else {
                    const adjacentMines = cell.getAdjacentMines();
                    if (adjacentMines > 0) {
                        cellElement.textContent = adjacentMines.toString();
                        cellElement.classList.add(`adjacent-${adjacentMines}`);
                        cellElement.setAttribute('aria-label', `${adjacentMines} adjacent mines`);
                    } else {
                        cellElement.setAttribute('aria-label', 'Empty cell');
                    }
                }
                break;
        }
    }

    /**
     * Updates the game state in the UI
     * 
     * @param gameState The game state to display
     */
    updateGameState(gameState: GameState): void {
        // Update status
        switch (gameState.status) {
            case GameStatus.NotStarted:
                this.statusElement.textContent = 'Click to start';
                this.statusElement.className = '';
                break;

            case GameStatus.InProgress:
                this.statusElement.textContent = 'Game in progress';
                this.statusElement.className = 'in-progress';
                break;

            case GameStatus.Won:
                this.statusElement.textContent = 'You Won! 🎉';
                this.statusElement.className = 'won';
                break;

            case GameStatus.Lost:
                this.statusElement.textContent = 'Game Over 💥';
                this.statusElement.className = 'lost';
                break;
        }

        // Update timer
        this.timerElement.textContent = gameState.timeElapsed.toString().padStart(3, '0');

        // Update mine counter
        this.mineCounterElement.textContent = Math.max(0, gameState.remainingMines).toString().padStart(3, '0');
    }

    /**
     * Sets up event listeners for user interactions
     * 
     * @param controller The game controller to use
     */
    setupEventListeners(controller: GameController): void {
        // Board cell click events
        this.boardElement.addEventListener('click', (event) => {
            const cellElement = (event.target as HTMLElement).closest('.cell') as HTMLElement;
            if (cellElement) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);
                controller.handleCellClick({ row, col });
            }
        });

        // Board cell right-click events
        this.boardElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const cellElement = (event.target as HTMLElement).closest('.cell') as HTMLElement;
            if (cellElement) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);
                controller.handleCellRightClick({ row, col });
            }
        });

        // Keyboard support for cells
        this.boardElement.addEventListener('keydown', (event) => {
            const cellElement = event.target as HTMLElement;
            if (cellElement.classList.contains('cell')) {
                const row = parseInt(cellElement.dataset.row || '0', 10);
                const col = parseInt(cellElement.dataset.col || '0', 10);

                // Enter or Space to reveal cell
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    controller.handleCellClick({ row, col });
                }

                // F key to flag cell
                if (event.key === 'f' || event.key === 'F') {
                    event.preventDefault();
                    controller.handleCellRightClick({ row, col });
                }
            }
        });

        // New game button
        this.newGameButton.addEventListener('click', () => {
            controller.newGame();
        });

        // Difficulty selection
        this.difficultySelect.addEventListener('change', () => {
            const difficulty = parseInt(this.difficultySelect.value, 10) as GameDifficulty;
            controller.setDifficulty(difficulty);
        });
    }
}

// ================= UNIT TESTS =================

/**
 * Runs unit tests for the Minesweeper game
 */
class TestRunner {
    runTests(): void {
        this.testCellFunctionality();
        this.testBoardInitialization();
        this.testMineGeneration();
        this.testRevealCell();
        this.testWinCondition();

        console.log('All tests completed successfully.');
    }

    private testCellFunctionality(): void {
        console.log('Testing Cell functionality...');

        // Create a cell
        const cell = new Cell({ row: 0, col: 0 }, false);

        // Test initial state
        this.assert(cell.getState() === CellState.Hidden, 'Cell should be hidden initially');
        this.assert(!cell.isMineCell(), 'Cell should not be a mine initially');

        // Test toggling flag
        cell.toggleFlag();
        this.assert(cell.getState() === CellState.Flagged, 'Cell should be flagged after toggle');

        cell.toggleFlag();
        this.assert(cell.getState() === CellState.Hidden, 'Cell should be hidden after second toggle');

        // Test revealing
        cell.reveal();
        this.assert(cell.getState() === CellState.Revealed, 'Cell should be revealed after reveal()');

        // Test reset
        cell.reset();
        this.assert(cell.getState() === CellState.Hidden, 'Cell should be hidden after reset');
        this.assert(!cell.isMineCell(), 'Cell should not be a mine after reset');

        console.log('Cell functionality tests passed.');
    }

    private testBoardInitialization(): void {
        console.log('Testing Board initialization...');

        // Create a 5x5 board with 5 mines
        const board = new GameBoard({ rows: 5, cols: 5, mines: 5 });

        const { rows, cols } = board.getDimensions();
        this.assert(rows === 5 && cols === 5, 'Board dimensions should be 5x5');
        this.assert(board.getMineCount() === 5, 'Board should have 5 mines');

        // Check that all cells are hidden initially
        const cells = board.getCells();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.assert(cells[r][c].getState() === CellState.Hidden, `Cell at (${r}, ${c}) should be hidden`);
            }
        }

        console.log('Board initialization tests passed.');
    }

    private testMineGeneration(): void {
        console.log('Testing mine generation...');

        // Create a 5x5 board with 5 mines
        const board = new GameBoard({ rows: 5, cols: 5, mines: 5 });

        // Place mines with a safe position at (0, 0)
        board.placeMines({ row: 0, col: 0 });

        // Count the number of mines
        let mineCount = 0;
        const cells = board.getCells();
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (cells[r][c].isMineCell()) {
                    mineCount++;
                }
            }
        }

        this.assert(mineCount === 5, `Board should have 5 mines, found ${mineCount}`);
        this.assert(!cells[0][0].isMineCell(), 'Safe position should not have a mine');

        console.log('Mine generation tests passed.');
    }

    private testRevealCell(): void {
        console.log('Testing reveal cell functionality...');

        // Create a 3x3 board with 1 mine at (1, 1)
        const board = new GameBoard({ rows: 3, cols: 3, mines: 1 });

        // Manually place a mine at (1, 1)
        const cells = board.getCells();
        cells[1][1].setMine(true);

        // Calculate adjacent mines
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

        // Test first click (should be safe)
        const result1 = board.revealCell({ row: 0, col: 0 });
        this.assert(result1.success, 'Reveal should be successful');
        this.assert(!result1.hitMine, 'Should not hit a mine');
        this.assert(result1.cellsRevealed.length === 1, 'Should reveal exactly 1 cell');
        this.assert(cells[0][0].getState() === CellState.Revealed, 'Cell (0, 0) should be revealed');

        // Test revealing a mine
        const result2 = board.revealCell({ row: 1, col: 1 });
        this.assert(result2.success, 'Reveal should be successful');
        this.assert(result2.hitMine, 'Should hit a mine');
        this.assert(cells[1][1].getState() === CellState.Revealed, 'Mine cell should be revealed');

        console.log('Reveal cell tests passed.');
    }

    private testWinCondition(): void {
        console.log('Testing win condition...');

        // Create a 3x3 board with 1 mine at (1, 1)
        const board = new GameBoard({ rows: 3, cols: 3, mines: 1 });

        // Manually place a mine at (1, 1)
        const cells = board.getCells();
        cells[1][1].setMine(true);

        // Reveal all non-mine cells
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (!cells[r][c].isMineCell()) {
                    cells[r][c].reveal();
                }
            }
        }

        // Check win condition
        this.assert(board.checkWinCondition(), 'Win condition should be true when all non-mine cells are revealed');

        // Reset a cell to hidden
        cells[0][0].reset();

        // Check win condition again
        this.assert(!board.checkWinCondition(), 'Win condition should be false when not all non-mine cells are revealed');

        console.log('Win condition tests passed.');
    }

    private assert(condition: boolean, message: string): void {
        if (!condition) {
            console.error(`Assertion failed: ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
    }
}

// ================= APPLICATION ENTRY POINT =================

/**
 * Initializes the Minesweeper game when the DOM is ready
 */
window.addEventListener('DOMContentLoaded', () => {
    const uiRenderer = new UIRenderer();
    const gameController = new GameController(uiRenderer);

    uiRenderer.setupEventListeners(gameController);

    // Run tests in non-production environments if needed
    // const testRunner = new TestRunner();
    // testRunner.runTests();
});