The project files structure:
shower.html
shower_files/fallingJet.js	
shower_files/leverControl.js

shower.html:
One by one horizontally:
____ div id = jet1 - here located first fallingJet.js jet instance canvas 
____ div id = jet2 - here located second fallingJet.js jet instance canvas
____ div id = jet3 - here located thirdt fallingJet.js jet instance canvas
(если рациональнее их объединить - объедини их вместе)

under:
____<div id = 'colorController'></div> here located first leverControl.js to control color of rectangles animated in fallingJet.js
____<div id = 'widthController'></div> here located second leverControl.js to control width of rectangles animated in fallingJet.js
____<div id = 'speedController'></div> here located third leverControl.js to control falling speed of rectangles animated in fallingJet.js
____CheckBox isAnimated - when checkBox isSelected  fallingJet.js starts animet jet, when deseleted stops it

fallingJet.js - recieves chekbox and  return canvas with animated rectangle (rectangles width and color and speeds managed by controls:widthController, colorController speedController )
leverControl.js creates instances to control parameters:
colorController: from red to blue
widthController: 3..20
speedController 3..20px per second![alt text]  (image.png)

![image](https://github.com/user-attachments/assets/5bedea2f-e945-44ed-bd19-121d46a519f1)
