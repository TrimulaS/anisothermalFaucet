// draw initial value

class LeverControl {
    static #scrollDelta = 2;   // in degrees
    static #counter = 0;
    #id = -1;
    
    #value = 0.0; // Initial value from 0.0 to 1.0
    #angle = Math.PI; // initial angle (in radians)
    #onMouseMoveHandler;
    #onMouseUpHandler;
    #onMouseLeaveHandler;
    


    // Приватный метод для обработки нажатия мыши
    #onMouseDown(e) {
        const { x0, y0, lineLength, circleRadius } = this;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        const distance = Math.sqrt((mouseX - endX) ** 2 + (mouseY - endY) ** 2);
        if (distance <= circleRadius) {
            this.dragging = true;

            document.addEventListener('mousemove', this.#onMouseMoveHandler);
            document.addEventListener('mouseup', this.#onMouseUpHandler); // отслеживание на уровне документа
            document.addEventListener('mouseleave', this.#onMouseLeaveHandler);
        }
    }

    // Приватный метод для обработки перемещения мыши
    #onMouseMove(e) {
        if (this.dragging) {
            const { x0, y0 } = this;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const dx = mouseX - x0;
            const dy = y0 - mouseY;

            this.#setAngle(Math.atan2(dy, dx));
        }
    }

    // Обработка колеса мыши
    #onMouseWheel(e) {
        const angleChange = (LeverControl.#scrollDelta * Math.PI) / 180;
        this.#setAngle(e.deltaY > 0 ? this.#angle - angleChange : this.#angle + angleChange);
    }

    // Приватный метод для завершения перемещения
    #onMouseUp() {
        document.removeEventListener('mousemove', this.#onMouseMoveHandler);
        document.removeEventListener('mouseup', this.#onMouseUpHandler);
        document.removeEventListener('mouseleave', this.#onMouseLeaveHandler);
        this.dragging = false;
    }
    #onMouseLeave(){
    
    }
    
    
    constructor (container, value, title = "" , size = 150) {
        this.title = title;
        //this.value = value;
        this.size = size;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size / 1.5;
        this.ctx = this.canvas.getContext('2d');
        // Handle
        this.lineLength = this.size / 2.5;
        this.circleRadius = this.size / 15;    // handle circle
        this.x0 = this.size / 2;
        this.y0 = this.size / 2;
        this.dragging = false;
        this.listeners = [];
        this.isListenerOn = false;

        // Привязанные функции сохраняем сразу, чтобы избежать повторного `bind`
        this.#onMouseMoveHandler = this.#onMouseMove.bind(this);
        this.#onMouseUpHandler = this.#onMouseUp.bind(this);
        this.#onMouseLeaveHandler = this.#onMouseLeave.bind(this);

        LeverControl.#counter++;
        this.#id = LeverControl.#counter;

        this.init();
        this.setValue(value);
    }
    // Инициализация события
    init() {
        this.container.appendChild(this.canvas);
        this.draw();

        this.canvas.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.canvas.addEventListener('wheel', this.#onMouseWheel.bind(this));
    }

    // Добавление слушателей
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    // Уведомление слушателей
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.#value));
    }

    // Приватный метод для установки угла
    #setAngle(angle) {
        if(0 <= angle && angle <= Math.PI) {
            this.#angle = angle
            }
            else if(-Math.PI/2 < angle && angle < 0  ) {
                this.#angle = 0;
            }
            else 
                this.#angle = Math.PI;
        this.#setValueInternal(1 - this.#angle / Math.PI);

    }

    // Приватный метод для обновления значения
    #setValueInternal(newValue) {
        if (this.#value !== newValue) {
            this.#value = newValue;
            if(this.isListenerOn){
                this.notifyListeners();
            }
            else{
                this.isListenerOn = true;
            }
            this.draw();
        }
    }

    // Публичный метод для установки значения
    setValue(newValue) {
        this.#setAngle( (1 - newValue) * Math.PI );
    }
    //Assign valuew  avoiding ping pong 
    setValueBypassingListener(newValue){
        this.isListenerOn = false;
        this.setValue(newValue);
    }

    // Получение значения
    getValue() {
        return this.#value;
    }

    // Рендеринг элемента управления
    draw() {
        const { ctx, x0, y0, lineLength, circleRadius, size } = this;

        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        ctx.clearRect(0, 0, size, size);

        // Линия
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Малый круг в верхней точке линии
        ctx.beginPath();
        ctx.arc(endX, endY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.stroke();

        // Центральный круг
        ctx.beginPath();
        ctx.arc(x0, y0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();

        // Процентное значение
        const percentage = Math.round(100 - (this.#angle / Math.PI) * 100);
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        if(this.title != "") { 
            ctx.fillText(`${this.title}` , x0, y0 / 2 - 18);
            ctx.fillText(`${percentage}%`, x0, y0 / 2 + 16 / 2);
        }
        else {
            ctx.fillText(`${percentage}%`, x0, y0 / 2 - 18);
            ctx.fillText(`val = ${Math.round(this.#value * 10000) / 10000}`, x0, y0 / 2 + 16 / 2);
            
        }
        
        
        
    }
}
