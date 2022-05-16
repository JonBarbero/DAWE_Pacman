//Test4 Archivo JavaScript
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;


// GAME FRAMEWORK 
var GF = function(){

  // variables para contar frames/s, usadas por measureFPS
  var frameCount = 0;
  var lastTime;
  var fpsContainer;
  var fps; 
 
  // variable global temporalmente para poder testear el ejercicio
  inputStates = { left: false, up: false, right: false, down: false, space: false };

	var Pacman = function() {
		this.radius = 15;
		this.x = 0;
		this.y = 0;
		this.speed = 5;
    this.velX = 0;
    this.velY = 0;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	
  Pacman.prototype.move = function() {
    if(this.velX == this.speed) {
      if(this.x + this.radius*2 + this.velX <= w) {
        this.x += this.velX;
        this.angle1 = 0.25;
        this.angle2 = 1.75;
      }
    }if(this.velX == -this.speed) {
      if(this.x + this.velX >= 0) {
        this.x += this.velX;
        this.angle1 = 1.25;
        this.angle2 = 0.75;
      }
    } else if(this.velY == this.speed) {
      if(this.y + this.radius*2 + this.velY <= h) {
        this.y += this.velY;
        this.angle1 = 0.75;
        this.angle2 = 0.25;
      }
    } else if(this.velY == -this.speed) {
      if(this.y + this.velY >= 0) {
        this.y += this.velY;
        this.angle1 = 1.75;
        this.angle2 = 1.25;
      }
    }
	};

  // Función para pintar el Pacman
  Pacman.prototype.draw = function(x, y) {
    ctx.beginPath();
    ctx.moveTo(this.x + this.radius,this.y + this.radius);
    ctx.arc(this.x + this.radius,this.y + this.radius,this.radius,this.angle1*Math.PI,this.angle2*Math.PI,false);
    ctx.fillStyle = 'rgba(255,255,0,255)';
    ctx.strokeStyle = 'black';
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
	// OJO, esto hace a pacman una variable global	
	player = new Pacman();

	var measureFPS = function(newTime) {
    // la primera ejecución tiene una condición especial
     
    if(lastTime === undefined) {
      lastTime = newTime; 
      return;
    }
        
    // calcular el delta entre el frame actual y el anterior
    var diffTime = newTime - lastTime; 

    if (diffTime >= 1000) {
      fps = frameCount;    
      frameCount = 0;
      lastTime = newTime;
    }

    // mostrar los FPS en una capa del documento
    // que hemos construído en la función start()
    fpsContainer.innerHTML = 'FPS: ' + fps; 
    frameCount++;
  };
  
  // clears the canvas content
  var clearCanvas = function() {
    ctx.clearRect(0, 0, w, h);
  };

	var checkInputs = function(){
		if(inputStates.right) {
      player.velY = 0;
      player.velX = player.speed;
    } else if(inputStates.left) {
      player.velY = 0;
      player.velX = -player.speed;
    } else if(inputStates.up) {
      player.velY = -player.speed;
      player.velX = 0;
    } else if(inputStates.down) {
      player.velY = player.speed;
      player.velX = 0;
    } else {
      player.velX = player.velY = 0;
    }
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
        checkInputs();
 
        // Clear the canvas
        clearCanvas();
    
      	player.move();
       
      	player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
      //add the listener to the main, window object, and update the states
      window.onkeydown = function (e) {
        // http://keycode.info/
        switch(e.which || e.keyCode) {
          case 32: //space
            inputStates.space = true;
            break;
          case 37: case 65: // left || A
            inputStates.left = true;
            break;
          case 38: case 87: // up || W
            inputStates.up = true;
            break;
          case 39: case 68: // right || D
            inputStates.right = true;
            break;
          case 40: case 83: // down || S
            inputStates.down = true;
            break;
          default: return;
        }
        e.preventDefault(); // evitar scroll
      };
      window.onkeyup = function (e) {
        switch(e.which || e.keyCode) {
          case 32:
            inputStates.space = false;
            console.log("Se ha pulsado espacio");
            break;
          case 37: case 65:
            inputStates.left = false;
            break;
          case 38: case 87:
            inputStates.up = false;
            break;
          case 39: case 68:
            inputStates.right = false;
            break;
          case 40: case 83:
            inputStates.down = false;
            break;
          default: return;
        }
        e.preventDefault(); // evitar scroll
      };
    };


    var start = function(){
      // adds a div for displaying the fps value
      fpsContainer = document.createElement('div');
      document.body.appendChild(fpsContainer);

      addListeners();

      player.x = 0;
      player.y = 0; 
      player.velY = 0;
      player.velX = player.speed;

      // start the animation
      requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};



  var game = new GF();
  game.start();

 test('Testeando pos. inicial', function(assert) {  

	     	assert.pixelEqual( canvas, player.x+10, player.y+10, 255, 255,0,255,"Passed!"); 
});

	
test('Movimiento hacia derecha OK', function(assert) {

  	var done = assert.async();
	inputStates.right = true;
  	setTimeout(function() {
			// console.log(player.x);
 		   assert.ok(player.x > 110 && player.x < w, "Passed!");

			inputStates.right = false;
			inputStates.down = true;
    		   done();
			test2();
  }, 1000);

});


var test2 = function(){
test('Movimiento hacia abajo OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.y);
   		        assert.ok(player.y > 110 && player.y < h, "Passed!");
			inputStates.down = false;
			inputStates.left = true;
    		   done();
			test3();
  }, 1000);

});
};

var test3 = function(){
test('Movimiento hacia izquierda OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.x);
   		        assert.ok(player.x == 0 , "Passed!");
			inputStates.left = false;
			inputStates.up = true;
    		   done();
		test4();
  }, 1000);

}); };



var test4 = function(){
test('Movimiento hacia arriba OK', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.y);
   		        assert.ok(player.y < 10 , "Passed!");
			inputStates.up = false;
    		   done();
  }, 1000);

}); };


