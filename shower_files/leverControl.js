/**
* mouseDrag -> angle
* Wheell
* setValue()
*   
*   setAngle()
*      setValue()
*         draw()
*/

class LeverControl {
    static #scrollDelta = 2;   // in degrees
    static #counter = 0;
    #id = -1;
    
    #value = 0.0; // Initial value from 0.0 to 1.0
    #angle = 3.14; // initial angle (in radians)
    #onMouseMoveHandler;
    #onMouseUpHandler;
    #onMouseLeaveHandler;
    

    constructor(container, size = 150) {
        this.size = size;
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size / 1.5;
        this.ctx = this.canvas.getContext('2d');
        //Handle
        this.lineLength = this.size / 2.5;
        this.circleRadius = this.size / 15;    // handle circle
        this.x0 = this.size / 2;
        this.y0 = this.size / 2;
        this.dragging = false;
        this.listeners = [];

        this.#onMouseMoveHandler = this.#onMouseMove.bind(this);  // сохраняем привязанные функции
        this.#onMouseUpHandler = this.#onMouseUp.bind(this);
        this.#onMouseLeaveHandler = this.#onMouseLeave.bind(this);

        LeverControl.#counter++;
        this.#id = LeverControl.#counter;
        

        this.init();
    }

   #onMouseDown(e) {


        
        const { x0, y0, lineLength, circleRadius } = this;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        // Check if the mouse is within the small circle at the top of the line
        const distance = Math.sqrt((mouseX - endX) ** 2 + (mouseY - endY) ** 2);
        if (distance <= circleRadius) {
            this.dragging = true;
            // console.log("strat dragging");

            document.addEventListener('mousemove', this.#onMouseMove.bind(this));
            document.addEventListener('mouseup', this.#onMouseUp.bind(this)); // отслеживание на уровне документа
            document.addEventListener('mouseleave', this.#onMouseLeave.bind(this));
        }
    }

    #onMouseMove(e) {
        if (this.dragging) {

            const { x0, y0 } = this;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const lX = e.clientX - rect.left - x0;
            const lY = e.clientY - rect.top - y0;

            // this.theta = Math.round(  Math.atan2(lY, lX) * 180 / Math.PI  );
            // // //this.alpha = Math.atan2(e.clientY, e.clientX);
            // // // {e.clientX} : ${e.clientY}  - coordinates in web page
            // // // client ( ${rect.left} : ${rect.top}
            // console.log(`( ${e.clientX} : ${e.clientY} )` +
            // `R ( ${mouseX} : ${mouseY} )     L( ${lX} : ${lY} )   angle: ${this.theta}     0(${x0} : ${y0})`);

            const dx = mouseX - x0;
            const dy = y0 - mouseY;

            this.#setAngle( Math.atan2(dy, dx) );
        }
    }



    #onMouseWheel(e) {
        // Convert deltaY from the wheel event to an angle change in radians (2 degrees)
        const angleChange = (LeverControl.#scrollDelta * Math.PI) / 180;
        if (e.deltaY > 0) {
            this.#angle -= angleChange;
        } else {
            this.#angle += angleChange;
        }

        // Constrain the angle between 0 and Math.PI (0 to 180 degrees)
        //this.#angle = Math.max(0, Math.min(this.#angle, Math.PI));
        this.#setAngle(this.#angle);

        //this.value = this.angle / Math.PI; // Update value

    }

    #onMouseUp() {
        document.removeEventListener('mousemove', this.#onMouseMoveHandler);  // удаляем слушатели
        document.removeEventListener('mouseup', this.#onMouseUpHandler);
        document.removeEventListener('mouseleave', this.#onMouseLeaveHandler);
        this.dragging = false;
    }

    #onMouseLeave() {
        // Continue dragging even when the mouse leaves the canvas area
        // The dragging will only stop when the mouse is released (mouseup)
    }

    
    init() {
        this.container.appendChild(this.canvas);
        this.draw();

        // Mouse event listeners
        this.canvas.addEventListener('mousedown', this.#onMouseDown.bind(this));
        this.canvas.addEventListener('wheel', this.#onMouseWheel.bind(this));
    }

 

    // Returns the normalized value (0.0 to 1.0) representing the lever's position
    getValue() {
        return this.#value;
    }

    // Method to get the canvas element (for adding to any container)
    getCanvas() {
        return this.canvas;
    }

    // --------------------------------------------------Listener



    // Метод для добавления слушателей
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    // Уведомляем всех слушателей о изменении значения
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.#value));
    }

    #setAngle(angle){
        // if (this.#angle !== angle) {
            
            if(0 <= angle && angle <= Math.PI) {
            this.#angle = angle
            }
            else if(-Math.PI/2 < angle && angle < 0  ) {
                this.#angle = 0;
            }
            else 
                this.#angle = Math.PI;
            
            // Calculate value
            this.#setValueInternal(1 - this.#angle / Math.PI );
            console.log(`${this.#id}   a ${angle}  >>  ${this.#angle}     val: ${this.#value}`);
        // }
        
    }

    // #angleToValue(angle){
        
    // }
    // #valueToAngle(){
    //     this.#value
    // }
    
    // Метод для получения значения
      getValue() {
        return this.#value;
    }
    // Internal when angle alreay defined
    #setValueInternal(newValue){ 
        if (this.#value !== newValue) {
            this.#value = newValue;
            this.notifyListeners();
            this.draw();
        }
        
    }
    
    // Exteral  angle should calculated
    setValue(newValue) {
        //val is 0.0 .. 1.0
        this.#setAngle( (1-newValue)*Math.PI );

    }

    draw() {

        const { ctx, x0, y0, lineLength, circleRadius, size } = this;

        // Calculate value    (!)  should compy with setValue(angle) accordingly
        //this.setValue() ; // Normalize the angle to a value between 0.0 and 1.0
        // roud if needed
        // this.value = Math.round( this.value * 10000) / 10000;

        
        // Holder coordinates
        const endX = x0 + lineLength * Math.cos(this.#angle);
        const endY = y0 - lineLength * Math.sin(this.#angle);

        // Clear the canvas  
        ctx.clearRect(0, 0, size, size);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the small circle at the top of the line
        ctx.beginPath();
        ctx.arc(endX, endY, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.fillStyle = 'black'
        ctx.stroke();

        //Mark
        // Draw the small circle at the top of the line
        ctx.beginPath();
        ctx.arc(x0, y0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        

        // Display percentage
        const percentage = Math.round(100 -(this.#angle / Math.PI) * 100); // проценты от 180 градусов
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        //Procent
        ctx.fillText(`${percentage}%`, x0, y0 /2 + 16/2); // выводим проценты в центре
        // Show Value
        ctx.fillText(`val = ${Math.abs(this.#value*10000)/10000}`, x0, y0/2 - 18); 
    }

}
