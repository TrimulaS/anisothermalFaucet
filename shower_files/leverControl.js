class LeverControl {
    constructor(container, size = 100) {
        this.size = size;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');
        this.lineLength = this.size / 2.5;
        this.circleRadius = this.size / 10;
        this.baseX = this.size / 2;
        this.baseY = this.size / 2;
        this.angle = 0; // initial angle (in radians)
        this.dragging = false;
        this.value = 0.0; // Initial value from 0.0 to 1.0

        this.init();
    }

    init() {
        this.container.appendChild(this.canvas);
        this.drawLineWithCircle();

        // Mouse event listeners
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    drawLineWithCircle() {
        const { ctx, baseX, baseY, lineLength, circleRadius, size, angle } = this;

        const endX = baseX + lineLength * Math.cos(angle);
        const endY = baseY - lineLength * Math.sin(angle);

        // Clear the canvas
        ctx.clearRect(0, 0, size, size);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the small circle at the top of the line
        ctx.beginPath();
        ctx.arc(endX, endY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
    }

    onMouseDown(e) {
        const { baseX, baseY, lineLength, circleRadius, angle } = this;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const endX = baseX + lineLength * Math.cos(angle);
        const endY = baseY - lineLength * Math.sin(angle);

        // Check if the mouse is within the small circle at the top of the line
        const distance = Math.sqrt((mouseX - endX) ** 2 + (mouseY - endY) ** 2);
        if (distance <= circleRadius) {
            this.dragging = true;
        }
    }

    onMouseMove(e) {
        if (this.dragging) {
            const { baseX, baseY } = this;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dx = mouseX - baseX;
            const dy = baseY - mouseY;
            this.angle = Math.atan2(dy, dx);

            // Constrain the angle between 0 and Math.PI (0 to 180 degrees)
            if (this.angle < 0 && this.angle >-1)this.angle = 0;            //(this.angle < 0) 
            if (this.angle < -1) this.angle = Math.PI;                      //(this.angle > Math.PI)

            this.value = this.angle / Math.PI; // Normalize the angle to a value between 0.0 and 1.0

            this.drawLineWithCircle();
        }
    }

    onMouseUp() {
        this.dragging = false;
    }

    onMouseLeave() {
        this.dragging = false;
    }

    // Returns the normalized value (0.0 to 1.0) representing the lever's position
    getValue() {
        return this.value;
    }

    // Method to get the canvas element (for adding to any container)
    getCanvas() {
        return this.canvas;
    }
}

