class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        this.touch = { x: 0, y: 0, pressed: false };
        this.joystick = { x: 0, y: 0, active: false };
        
        // Input state
        this.inputX = 0;
        this.inputY = 0;
        this.inputShoot = false;
        this.inputPass = false;
        this.inputSprint = false;
        this.inputPause = false;
        
        // Mobile joystick
        this.joystickBase = null;
        this.joystickThumb = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 40;
        
        this.init();
    }
    
    // Return the canvas element safely without needing window.gameEngine at init time
    getCanvas() {
        return document.getElementById('game-canvas') || (window.gameEngine && window.gameEngine.canvas) || null;
    }
    
    init() {
        this.setupKeyboardInput();
        this.setupMouseInput();
        this.setupTouchInput();
        this.setupJoystick();
        this.setupMenuInput();
    }
    
    setupKeyboardInput() {
        // Key down events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyDown(e);
        });
        
        // Key up events
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.handleKeyUp(e);
        });
        
        // Prevent default for game keys
        document.addEventListener('keydown', (e) => {
            if (this.isGameKey(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    setupMouseInput() {
        const canvas = this.getCanvas();
        if (!canvas) return;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', () => {
            this.mouse.pressed = true;
        });
        
        canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
    }
    
    setupTouchInput() {
        const canvas = this.getCanvas();
        if (!canvas) return;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
            this.touch.pressed = true;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.pressed = false;
        }, { passive: false });
    }
    
    setupJoystick() {
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickThumb = document.getElementById('joystick-thumb');
        
        if (this.joystickBase && this.joystickThumb) {
            const recalcCenter = () => {
                const rect = this.joystickBase.getBoundingClientRect();
                this.joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            };
            recalcCenter();
            
            this.joystickBase.addEventListener('mousedown', (e) => {
                recalcCenter();
                this.handleJoystickStart(e);
            });
            
            this.joystickBase.addEventListener('touchstart', (e) => {
                e.preventDefault();
                recalcCenter();
                this.handleJoystickStart(e.touches[0]);
            }, { passive: false });
            
            document.addEventListener('mousemove', (e) => {
                this.handleJoystickMove(e);
            });
            
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.handleJoystickMove(e.touches[0]);
            }, { passive: false });
            
            document.addEventListener('mouseup', () => {
                this.handleJoystickEnd();
            });
            
            document.addEventListener('touchend', () => {
                this.handleJoystickEnd();
            });
        }
    }
    
    setupMenuInput() {
        // Menu button handlers
        document.getElementById('start-game')?.addEventListener('click', () => {
            window.gameEngine?.startMatch();
        });
        
        document.getElementById('resume-game')?.addEventListener('click', () => {
            window.gameEngine?.resumeGame();
        });
        
        document.getElementById('restart-game')?.addEventListener('click', () => {
            window.gameEngine?.startMatch();
        });
        
        document.getElementById('quit-game')?.addEventListener('click', () => {
            window.gameEngine?.switchScene('menu');
        });
        
        document.getElementById('play-again')?.addEventListener('click', () => {
            window.gameEngine?.hideGameOver();
            window.gameEngine?.startMatch();
        });
        
        document.getElementById('back-to-menu')?.addEventListener('click', () => {
            window.gameEngine?.hideGameOver();
            window.gameEngine?.switchScene('menu');
        });
        
        // Mobile action buttons
        document.getElementById('shoot-btn')?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.inputShoot = true;
        }, { passive: false });
        
        document.getElementById('shoot-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.inputShoot = false;
        }, { passive: false });
        
        document.getElementById('sprint-btn')?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.inputSprint = true;
        }, { passive: false });
        
        document.getElementById('sprint-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.inputSprint = false;
        }, { passive: false });
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'Enter':
                this.inputPause = true;
                if (window.gameEngine?.gameState === 'playing') {
                    window.gameEngine.pauseGame();
                } else if (window.gameEngine?.gameState === 'paused') {
                    window.gameEngine.resumeGame();
                }
                break;
        }
    }
    
    handleKeyUp(e) {
        switch (e.code) {
            case 'Enter':
                this.inputPause = false;
                break;
        }
    }
    
    handleJoystickStart(e) {
        this.joystick.active = true;
        this.updateJoystickPosition(e);
    }
    
    handleJoystickMove(e) {
        if (this.joystick.active) {
            this.updateJoystickPosition(e);
        }
    }
    
    handleJoystickEnd() {
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        
        if (this.joystickThumb) {
            this.joystickThumb.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    updateJoystickPosition(e) {
        const dx = e.clientX - this.joystickCenter.x;
        const dy = e.clientY - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.joystickRadius) {
            this.joystick.x = dx / this.joystickRadius;
            this.joystick.y = dy / this.joystickRadius;
        } else {
            this.joystick.x = (dx / distance);
            this.joystick.y = (dy / distance);
        }
        
        if (this.joystickThumb) {
            const percentX = this.joystick.x * this.joystickRadius;
            const percentY = this.joystick.y * this.joystickRadius;
            // Position relative to base center
            this.joystickThumb.style.left = '50%';
            this.joystickThumb.style.top = '50%';
            this.joystickThumb.style.transform = `translate(calc(-50% + ${percentX}px), calc(-50% + ${percentY}px))`;
        }
    }
    
    update() {
        this.updateKeyboardInput();
        this.updateMobileInput();
    }
    
    updateKeyboardInput() {
        // Movement input
        this.inputX = 0;
        this.inputY = 0;
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.inputX -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.inputX += 1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.inputY -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.inputY += 1;
        
        // Normalize diagonal movement
        if (this.inputX !== 0 && this.inputY !== 0) {
            this.inputX *= 0.707; // 1/√2
            this.inputY *= 0.707;
        }
        
        // Action input
        this.inputShoot = this.keys['Space'];
        this.inputPass = this.keys['KeyP'];
        this.inputSprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    }
    
    updateMobileInput() {
        if (window.innerWidth <= 768) {
            // Use joystick input for mobile
            this.inputX = this.joystick.x;
            this.inputY = this.joystick.y;
        }
    }
    
    getInputState() {
        return {
            x: this.inputX,
            y: this.inputY,
            shoot: this.inputShoot,
            pass: this.inputPass,
            sprint: this.inputSprint
        };
    }
    
    isGameKey(code) {
        const gameKeys = [
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'KeyA', 'KeyD', 'KeyW', 'KeyS',
            'Space', 'KeyP', 'ShiftLeft', 'ShiftRight',
            'Enter'
        ];
        return gameKeys.includes(code);
    }
    
    // Utility methods
    isKeyPressed(code) {
        return this.keys[code] || false;
    }
    
    isAnyKeyPressed() {
        return Object.values(this.keys).some(pressed => pressed);
    }
    
    clearInput() {
        this.inputX = 0;
        this.inputY = 0;
        this.inputShoot = false;
        this.inputPass = false;
        this.inputSprint = false;
        this.inputPause = false;
    }
} 