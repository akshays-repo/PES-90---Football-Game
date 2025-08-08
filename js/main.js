// Main game initialization
let gameEngine;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('PES 90 - Initializing...');
    
    // Create global game engine instance
    window.gameEngine = new GameEngine();
    gameEngine = window.gameEngine;
    
    // Set up mobile detection and controls
    setupMobileControls();
    
    // Set up window resize handling
    setupResizeHandler();
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    console.log('PES 90 - Ready to play!');
});

function setupMobileControls() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Show mobile controls
        document.getElementById('mobile-controls').style.display = 'flex';
        document.getElementById('desktop-controls').style.display = 'none';
        
        // Set up touch events for better mobile experience
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    } else {
        // Show desktop controls
        document.getElementById('mobile-controls').style.display = 'none';
        document.getElementById('desktop-controls').style.display = 'block';
    }
}

function setupResizeHandler() {
    window.addEventListener('resize', () => {
        // Handle window resize
        const canvas = gameEngine.canvas;
        const container = document.getElementById('game-container');
        
        // Maintain aspect ratio
        const maxWidth = Math.min(window.innerWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        // Calculate new dimensions
        const aspectRatio = 800 / 600;
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
        }
        
        // Update canvas size
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
        
        // Update mobile controls visibility
        setupMobileControls();
    });
    
    // Trigger initial resize
    window.dispatchEvent(new Event('resize'));
}

function setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    
    function updateFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // Log FPS in development
            if (fps < 50) {
                console.warn(`Low FPS detected: ${fps}`);
            }
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
}

// Global utility functions
window.gameUtils = {
    // Calculate distance between two points
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    // Calculate angle between two points
    angle: (x1, y1, x2, y2) => {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // Normalize vector
    normalize: (x, y) => {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },
    
    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },
    
    // Linear interpolation
    lerp: (a, b, t) => {
        return a + (b - a) * t;
    },
    
    // Random number between min and max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    // Random integer between min and max (inclusive)
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Check if point is inside rectangle
    pointInRect: (x, y, rect) => {
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    },
    
    // Format time as MM:SS
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

// Debug functions (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debug = {
        // Toggle debug mode
        enabled: false,
        
        // Toggle debug info
        toggle: () => {
            window.debug.enabled = !window.debug.enabled;
            console.log('Debug mode:', window.debug.enabled ? 'ON' : 'OFF');
        },
        
        // Log game state
        logState: () => {
            if (!gameEngine) return;
            console.log('Game State:', {
                currentScene: gameEngine.gameState,
                scores: gameEngine.scores,
                matchTime: gameEngine.matchTime,
                entities: gameEngine.currentScene?.entities?.length || 0
            });
        },
        
        // Reset game
        reset: () => {
            if (gameEngine) {
                gameEngine.startMatch();
            }
        }
    };
    
    // Add debug key bindings
    document.addEventListener('keydown', (e) => {
        if (e.code === 'F1') {
            e.preventDefault();
            window.debug.toggle();
        }
        if (e.code === 'F2') {
            e.preventDefault();
            window.debug.logState();
        }
        if (e.code === 'F3') {
            e.preventDefault();
            window.debug.reset();
        }
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Game Error:', e.error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <h3>Game Error</h3>
        <p>Something went wrong. Please refresh the page.</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Refresh Page
        </button>
    `;
    document.body.appendChild(errorDiv);
});

// Handle page visibility changes (pause when tab is not visible)
document.addEventListener('visibilitychange', () => {
    if (gameEngine && gameEngine.gameState === 'playing') {
        if (document.hidden) {
            gameEngine.pauseGame();
        }
    }
});

// Handle beforeunload (save game state if needed)
window.addEventListener('beforeunload', () => {
    // Could save game state to localStorage here
    console.log('Game session ending...');
});

console.log('PES 90 - Main script loaded'); 