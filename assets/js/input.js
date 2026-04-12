class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isSpacePressed = false;
        this.isButtonClicked = false;

        const getPos = (cx, cy) => {
            const r = this.canvas.getBoundingClientRect();
            return {
                x: (cx - r.left) * (this.canvas.width / r.width),
                y: (cy - r.top) * (this.canvas.height / r.height)
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            const p = getPos(e.clientX, e.clientY);
            this.mouseX = p.x; this.mouseY = p.y;
        });

        this.canvas.addEventListener('mousedown', () => this.isButtonClicked = true);
        window.addEventListener('mouseup', () => this.isButtonClicked = false);

        const handleTouch = (e) => {
            this.isButtonClicked = false;
            for (let i = 0; i < e.touches.length; i++) {
                const p = getPos(e.touches[i].clientX, e.touches[i].clientY);
                const dist = Math.sqrt(Math.pow(p.x - (this.canvas.width - 100), 2) + Math.pow(p.y - (this.canvas.height - 100), 2));
                if (dist < 40) this.isButtonClicked = true;
                else { this.mouseX = p.x; this.mouseY = p.y; }
            }
            e.preventDefault();
        };

        this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
        this.canvas.addEventListener('touchmove', handleTouch, { passive: false });
        this.canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) this.isButtonClicked = false;
            else handleTouch(e);
        }, { passive: false });

        window.addEventListener('keydown', (e) => { if (e.code === 'Space') this.isSpacePressed = true; });
        window.addEventListener('keyup', (e) => { if (e.code === 'Space') this.isSpacePressed = false; });
    }
}