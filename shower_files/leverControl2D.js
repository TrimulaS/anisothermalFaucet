// draw initial value

/**
 *  Value - is related to the angle
 *  Value2 - is related to absoulute (positoin)
 * 
 *  Event chain:
 * 
 *  mouseDown -> add 'mousemove'
 *					 'mouseup', 
 *					 'mouseleave
 *
 * 
 *  mouseMove() ->   			#setAngle()
 *                  			this.position 
 * 
 *  #onMouseWheel(e) ->        #setAngle()
 *                             this.position 
 * 
 *  #setAngle(angle)    ->     #setValueInternal(newValue) 
 *  Check angle values      	
 * 
 *	 #setValueInternal(newValue) -> 	 notifyListeners();
 *										draw();
 *
 *	 
 *	 setValue(newValue)	-> #setAngle()
 *	setValue2(newValue2) -> 
 *
 */


class LeverControl2D {
    static #scrollDeltaAngle = 2;   // in degrees
    static #scrollDeltaRadius = 0.02;   
    static #counter = 0;
    #id = -1;
    #progressPadding = 2;
    
    #value = 0.0; // Initial value from 0.0 to 1.0   -  related to angle
    #angle = Math.PI; // initial angle (in radians)

    #value2 = 0.0; // Initial value from 0.0 to 1.0     - related to radius-vector
    #radius = 1.0;
    #handleX = 0;
    #handleY = 0;

    #onMouseMoveHandler;
    #onMouseUpHandler;
    #onMouseLeaveHandler;


    // Приватный метод для обработки нажатия мыши
    #onMouseDown(e) {
        const { x0, y0, lineLength, circleRadius } = this;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;


        // const endX = x0 + lineLength * Math.cos(this.#angle);
        // const endY = y0 - lineLength * Math.sin(this.#angle);

        const distance = Math.sqrt((mouseX - this.#handleX) ** 2 + (mouseY - this.#handleY) ** 2);
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

            this.#setRadius ( Math.sqrt(dx*dx + dy*dy) );
            this.#setAngle  (Math.atan2(dy, dx));
        }
    }

    // Обработка колеса мыши
    #onMouseWheel(e) {
        e.preventDefault();
        if (e.ctrlKey) {
            //Changeing radius vector
            this.setValue2(this.#value2 + LeverControl2D.#scrollDeltaRadius * Math.sign(e.deltaY));

        }else{
            // Changeing angle
            const angleChange = (LeverControl2D.#scrollDeltaAngle * Math.PI) / 180;
            this.#setAngle(e.deltaY > 0 ? this.#angle - angleChange : this.#angle + angleChange);
        }

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
    

    //----------------------------------------------------------------------------------------------------Constructor

    constructor (container, value = -1, value2 = -1, title = "", progressColor = "", size = 150) {
        this.title = title;
        //this.value = value;
        this.progressColor = progressColor;
        this.size = size;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size / 1.7;
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

        LeverControl2D.#counter++;
        this.#id = LeverControl2D.#counter;

        this.init();
        if(value ==-1){
            this.value = 0;
        } else{
            this.setValue(value);
            
        }

        //TO DO: Define setValue
        if(value2 ==-1){
            this.value2 = 0;
        } else{
            this.setValue2(value2);
        }
        
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
        this.listeners.forEach(listener => listener(this.#value, this.#value2));
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
    #setRadius(radius){
        if(radius > this.lineLength || !radius  ) radius = this.lineLength;

        this.#radius = radius;
        const value = radius/this.lineLength;
        this.#setValue2Internal(value);
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
    #setValue2Internal(newValue2) {
        if (this.#value2 !== newValue2) {
            this.#radius = this.lineLength * newValue2;
            this.#value2 = newValue2;
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
    setValue2(newValue2) {
        // Check if the new value is in ranges
        if(newValue2 >= 0 && newValue2 <= 1){
            this.#setValue2Internal(newValue2)
        }

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
        const { ctx, x0, y0, lineLength, circleRadius, size, canvas, left } = this;

        this.#handleX = x0 + this.#radius * Math.cos(this.#angle);
        this.#handleY = y0 - this.#radius * Math.sin(this.#angle);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw progress inside if color defined
        // const progressHeight = this.#value;
        // const progressWidth  = this.#value2;
        const progressHeight = this.#value2;
        const progressWidth  = 1;

        if(this.progressColor!=""){
            const p = this.#progressPadding;

            ctx.fillStyle = this.progressColor;
            // Расчет высоты прямоугольника
            const height = canvas.height * progressHeight;

            //Calculating narowing progress rectongle proportianllay to radius-vector value
            const width = size * progressWidth;
            const leftShift = size * (1 - progressWidth) / 2;
            // console.log(`${width}  shift: ${leftShift}`);
            ctx.fillRect(0 + p +leftShift, canvas.height - height + p, width - 2*p, height - 2*p);
        }

        // Линия
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(this.#handleX, this.#handleY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Малый круг в верхней точке линии
        ctx.beginPath();
        ctx.arc(this.#handleX, this.#handleY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.stroke();

        // Центральный круг (axis)
        ctx.beginPath();
        ctx.arc(x0, y0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();

        // Texts: Title and procent of progress
        //const rect = this.canvas.getBoundingClientRect();
        const percentage = Math.round(100 - (this.#angle / Math.PI) * 100);
        const rad  = Math.round(this.#radius * 100) / 100;
        const val  = Math.round(this.#value  * 100) / 100;
        const val2 = Math.round(this.#value2 * 100);

        
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        // ctx.shadowColor = 'white';
        // ctx.shadowBlur = 40;
        // ctx.shadowOffsetX = 0;
        // ctx.shadowOffsetY = 0;

        // ctx.webkit.text.stroke = '1px #FFFFFF'; /* Толщина и цвет обводки */
        // ctx.text.stroke = '1px #FFFFFF'; /* Толщина и цвет обводки (стандартное свойство) */

        ctx.strokeStyle = 'white';  // Цвет обводки
        ctx.lineWidth = 3;          // Толщина обводки



        if(this.title != "") {                               //If no title - than procent will be as title 

            ctx.strokeText(`${this.title}`      , x0, y0 / 2 - 18);
            ctx.fillText  (`${this.title}`      , x0, y0 / 2 - 18);

            ctx.strokeText(`α : ${percentage}%` , x0, y0 / 2);
            ctx.fillText  (`α : ${percentage}%` , x0, y0 / 2);

            ctx.strokeText(`r : ${val2}%`       , x0, y0 / 2 + 18);
            ctx.fillText  (`r : ${val2}%`       , x0, y0 / 2 + 18);

            // ctx.strokeText(`radius = ${rad}`    , x0, y0 / 2 + 18 * 2);
            // ctx.fillText  (`radius = ${rad}`    , x0, y0 / 2 + 18 * 2);
        }
        else {
            ctx.fillText(`α : ${percentage}%` , x0, y0 / 2 - 18);
            ctx.fillText(`r : ${val2}%`       , x0, y0 / 2 + 16 * 2);
            // ctx.fillText(`val = ${val}`    , x0, y0 / 2 + 16 / 2);
            // ctx.fillText(`val2 = ${val2}`  , x0, y0 / 2 + 16 * 2);
            // ctx.fillText(`radius = ${rad}` , x0, y0 / 2 + 16 * 3);
            
        }
        
        
        
    }
}
