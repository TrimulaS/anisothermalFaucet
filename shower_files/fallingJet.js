// Save max width to clear rect



class WaterJet {
    constructor(canvas, left, top, levelUp = 20, levelDown = 400, speed = 2, color = 'blue', width = 5) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.left = left;
        this.top = top;
        this.levelUp = levelUp;
        this.levelDown = levelDown;
        this.speed = speed;
        this.color = color;
        this.width = width;
        this.isAnimated = false;
        this.rectangles = [];
        this.lastTime = null;
    }

    // Запуск анимации
    start() {
        this.isAnimated = true;
        if (this.rectangles.length === 0) {
            this.rectangles.push(this.createRectangle());
        }
        this.lastTime = performance.now();
        this.animate();
    }

    // Остановка анимации
    stop() {
        this.isAnimated = false;
    }

    // Метод для создания нового прямоугольника
    createRectangle() {
        const jetLength = Math.random() * 20 + 10;  // Случайная длина 10..30px
        return {
            x: this.left,
            y: this.levelUp - jetLength,
            length: jetLength
        };
    }

    // Обновление анимации
    animate() {
        if (!this.isAnimated) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;  // Перевод времени в секунды
        this.lastTime = currentTime;

        // Обновление позиции прямоугольников
        this.rectangles.forEach(rect => {
            rect.y += this.speed * deltaTime * 60;  // Скорость 2px/sec
        });

        // Удаление вышедших за пределы прямоугольников
        if (this.rectangles[0].y > this.levelDown) {
            this.rectangles.shift();
        }

        // Добавление нового прямоугольника, если последний на экране
        const lastRect = this.rectangles[this.rectangles.length - 1];
        if (lastRect.y > this.levelUp + lastRect.length + Math.random() * 6 + 2) {
            this.rectangles.push(this.createRectangle());
        }

        this.draw();

        // Запуск следующего кадра
        requestAnimationFrame(this.animate.bind(this));
    }

    // Рисование текущего состояния
    draw() {
        const { ctx, rectangles, levelUp, levelDown, width, color } = this;
        ctx.clearRect(this.left, levelUp, width, levelDown - levelUp);  // Очищаем только видимую область
        //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        rectangles.forEach(rect => {
            const visibleTop = Math.max(rect.y, levelUp);  // Видимая верхняя граница
            const visibleBottom = Math.min(rect.y + rect.length, levelDown);  // Видимая нижняя граница

            if (visibleBottom > visibleTop) {
                ctx.fillStyle = color;
                ctx.fillRect(rect.x, visibleTop, width, visibleBottom - visibleTop);
            }
        });
    }

    // Метод для изменения параметров во время работы
    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    setWidth(newWidth) {
        // If thinkness decreases, clear cetor to do not leave traces
        if(newWidth < this.width){
            const { ctx,left, levelUp, levelDown, width } = this;
            ctx.clearRect(left, levelUp, width, levelDown - levelUp);  // Очищаем только видимую область
        }
        this.width = newWidth;
    }

    setColor(newColor) {
        this.color = newColor;
    }
}