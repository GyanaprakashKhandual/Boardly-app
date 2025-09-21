class BoardlyGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0, draw: 0 };
        this.gameHistory = [];

        this.initializeGame();
        this.loadGameData();
        this.setupEventListeners();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.statusElement = document.getElementById('gameStatus');
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
    }

    setupEventListeners() {
        // Theme switcher
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const theme = e.target.dataset.theme;
                document.body.className = `theme-${theme}`;
                this.saveGameData();
            });
        });
    }

    makeMove(index) {
        if (this.board[index] !== '' || !this.gameActive) return;

        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());

        // Add move animation
        this.cells[index].style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            this.cells[index].style.animation = '';
        }, 300);

        if (this.checkWinner()) {
            this.gameActive = false;
            this.statusElement.textContent = `Player ${this.currentPlayer} Wins! 🎉`;
            this.scores[this.currentPlayer]++;
            this.updateScoreDisplay();
            this.highlightWinningCells();
            this.addToHistory(`Player ${this.currentPlayer} wins`, 'win');
            this.showWinAnimation();
        } else if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.statusElement.textContent = "It's a Draw! 🤝";
            this.scores.draw++;
            this.updateScoreDisplay();
            this.addToHistory("Draw", 'draw');
            this.showDrawAnimation();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.statusElement.textContent = `Player ${this.currentPlayer}'s Turn`;
        }

        this.saveGameData();
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
        }
        return false;
    }

    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
    }

    updateScoreDisplay() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('scoreDraw').textContent = this.scores.draw;
    }

    addToHistory(result, type) {
        const gameData = {
            result,
            type,
            timestamp: new Date().toLocaleString(),
            moves: [...this.board]
        };

        this.gameHistory.unshift(gameData);
        if (this.gameHistory.length > 50) {
            this.gameHistory = this.gameHistory.slice(0, 50);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        const historyCount = document.getElementById('historyCount');

        historyCount.textContent = `${this.gameHistory.length} game${this.gameHistory.length !== 1 ? 's' : ''}`;

        if (this.gameHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 50px;">No games played yet</p>';
            return;
        }

        historyList.innerHTML = this.gameHistory.map((game, index) => `
                    <div class="history-item">
                        <div class="history-game">
                            <span class="history-result ${game.type}">${game.result}</span>
                            <span>#${this.gameHistory.length - index}</span>
                        </div>
                        <div class="history-time">${game.timestamp}</div>
                    </div>
                `).join('');
    }

    showWinAnimation() {
        // Create a simple celebration animation using CSS
        const container = document.getElementById('animationContainer');
        container.innerHTML = '<div style="font-size: 4rem; animation: bounce 1s ease-in-out;">🎉</div>';

        setTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }

    showDrawAnimation() {
        const container = document.getElementById('animationContainer');
        container.innerHTML = '<div style="font-size: 4rem; animation: bounce 1s ease-in-out;">🤝</div>';

        setTimeout(() => {
            container.innerHTML = '';
        }, 2000);
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningPattern = null;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.statusElement.textContent = "Player X's Turn";
        this.saveGameData();
    }

    clearHistory() {
        this.gameHistory = [];
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScoreDisplay();
        this.updateHistoryDisplay();
        this.saveGameData();
    }

    saveGameData() {
        const gameData = {
            scores: this.scores,
            history: this.gameHistory,
            theme: document.body.className
        };

        // Using a simple object to store data in memory
        window.boardlyData = gameData;
    }

    loadGameData() {
        const data = window.boardlyData;
        if (data) {
            this.scores = data.scores || { X: 0, O: 0, draw: 0 };
            this.gameHistory = data.history || [];
            if (data.theme) {
                document.body.className = data.theme;
                const themeClass = data.theme.replace('theme-', '');
                document.querySelectorAll('.theme-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.theme === themeClass);
                });
            }
        }
        this.updateScoreDisplay();
        this.updateHistoryDisplay();
    }
}

// Initialize the game
let game;

// Global functions for buttons
function resetGame() {
    game.resetGame();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all game history and scores?')) {
        game.clearHistory();
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new BoardlyGame();
});

// Add bounce animation for celebrations
const style = document.createElement('style');
style.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
                40% { transform: translate(-50%, -50%) translateY(-30px); }
                60% { transform: translate(-50%, -50%) translateY(-15px); }
            }
        `;
document.head.appendChild(style);