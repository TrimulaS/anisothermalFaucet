class fallingJet {
        constructor(container, size = 100) {
                // Константы
        this.speed = 20; // скорость движения вниз в пикселях/секунду
        this.minHeight = 10;
        this.maxHeight = 50;
        this.minGap = 2;
        this.maxGap = 10;
        this.minLevel = 20;
        this.maxLevel = 200;
        this.rectWidth = 50; // ширина прямоугольника

            
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
}



const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const checkbox = document.getElementById('startAnimation');

    let isAnimating = false;
    let rectangles = [];

    // Константы
    const speed = 20; // скорость движения вниз в пикселях/секунду
    const minHeight = 10;
    const maxHeight = 50;
    const minGap = 2;
    const maxGap = 10;
    const minLevel = 20;
    const maxLevel = 200;
    const rectWidth = 50; // ширина прямоугольника

    // Центр по оси X
    const centerX = canvas.width / 2 - rectWidth / 2;

    // Функция создания нового прямоугольника
    function createRectangle() {
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const gap = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
        const lastY = rectangles.length > 0 ? rectangles[rectangles.length - 1].y + rectangles[rectangles.length - 1].height + gap : minLevel - 100;

        // Добавляем новый прямоугольник выше уровня minLevel, чтобы он "въезжал" вниз
        rectangles.push({
            x: centerX, // центрируем по оси X
            y: lastY,   // y начинается выше уровня minLevel
            width: rectWidth,
            height: height
        });
    }

    // Функция для обновления позиции прямоугольников
    function updateRectangles() {
        // Движение прямоугольников вниз
        rectangles.forEach(rect => {
            rect.y += speed / 60; // Движение со скоростью 5px/сек
        });

        // Удаляем прямоугольники, которые вышли за пределы
        rectangles = rectangles.filter(rect => rect.y + rect.height < canvas.height);

        // Создаем новый прямоугольник, когда последний проходит за пределы maxLevel
        if (rectangles.length === 0 || rectangles[rectangles.length - 1].y + rectangles[rectangles.length - 1].height + minGap < maxLevel) {
            createRectangle();
        }
    }

    // Функция рисования прямоугольников
    function drawRectangles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем canvas

        // Рисуем каждый прямоугольник
        rectangles.forEach(rect => {
            if (rect.y + rect.height > minLevel && rect.y < maxLevel) {
                // Прямоугольник попадает в область 20..200
                const visibleY = Math.max(minLevel, rect.y);
                const visibleHeight = Math.min(maxLevel, rect.y + rect.height) - visibleY;
                ctx.fillStyle = 'blue';
                ctx.fillRect(rect.x, visibleY, rect.width, visibleHeight);
            }
        });
    }

    // Функция для анимации
    function animate() {
        if (isAnimating) {
            updateRectangles();
            drawRectangles();
            requestAnimationFrame(animate); // Запуск следующего кадра анимации
        }
    }

    // Обработчик для чекбокса
    checkbox.addEventListener('change', (e) => {
        isAnimating = e.target.checked;
        if (isAnimating) {
            rectangles = []; // Очистить существующие прямоугольники
            createRectangle(); // Создать первый прямоугольник
            animate(); // Запустить анимацию
        }
    });