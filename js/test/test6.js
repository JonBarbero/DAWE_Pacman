//Test6 Archivo JavaScript
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
 
    //  variable global temporalmente para poder testear el ejercicio
    inputStates = { left: false, up: false, right: false, down: false, space: false };


	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

	this.setMapTile = function(row, col, newValue){
		this.map[row][col] = newValue;
	};

	this.getMapTile = function(row, col){
		return this.map[row][col];
	};

	this.printMap = function(){
		for (var i = 0; i < thisLevel.lvlHeight; i++) {
			var current = '';
			for (var j = 0; j < thisLevel.lvlWidth; j++) {
				current += thisLevel.getMapTile(i,j) + ' ';
			}
			console.log(current)
		}
	};

	this.loadLevel = function() {
		// leer res/levels/1.txt y guardarlo en el atributo map	
		// haciendo uso de setMapTile
		jQuery.ajax({
	        url : "../res/levels/1.txt",
	        dataType: "text",
	        success : function (data) {
	            var lineas = data.split("\n");
	            var inicio = fin = false;
	            var row = 0;
	            for (var i = 0; i < lineas.length; i++) {
	            	if(lineas[i].includes("lvlwidth"))
	            		thisLevel.lvlWidth = lineas[i].split(" ").slice(-1).pop();

	            	else if(lineas[i].includes("lvlheight"))
	            		thisLevel.lvlHeight = lineas[i].split(" ").slice(-1).pop();

	            	else if(lineas[i].includes("startleveldata"))
	            		inicio = true;

	            	else if(lineas[i].includes("endleveldata"))
	            		fin = true;

	            	else if(inicio && !fin) {
	            		var fila = lineas[i].split(" ");
	            		for (var j = 0; j < fila.length; j++) {
						    if(fila[j] != "") {
						    	if(thisLevel.map[row] === undefined)
						    		thisLevel.map[row] = [];
						    	thisLevel.setMapTile(row,j,fila[j]);
						    }
						}
	            		row++;
	            	}

	            }
	        }
		});
	};

	this.drawMap = function() {
		var TILE_WIDTH = thisGame.TILE_WIDTH;
		var TILE_HEIGHT = thisGame.TILE_HEIGHT;

		var tileID = {
			'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
		};

		for (var row = 0; row <= thisGame.screenTileSize[0]; row++) {
			for (var col = 0; col < thisGame.screenTileSize[1]; col++) {
				var tipo = thisLevel.getMapTile(row,col);
				// if(tipo == 4) { // pacman 
				// } else if(tipo == 0) { // vacía
				// } else 
				if(tipo == 2) { // pildora
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12);
				    ctx.arc(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12,5,0,2*Math.PI,false);
				    ctx.fillStyle = 'rgba(255,255,255,255)';
				    // ctx.strokeStyle = 'rgba(255,255,255,255)';
				    ctx.closePath();
				    ctx.fill();
				    // ctx.stroke();
				} else if(tipo == 3) { // pildora poder
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12);
				    ctx.arc(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12,4,0,2*Math.PI,false);
				    ctx.fillStyle = 'rgba(255,0,0,255)';
				    // ctx.strokeStyle = 'rgba(255,0,0,255)';
				    ctx.closePath();
				    ctx.fill();
				    // ctx.stroke();
				} else if(tipo >=100 && tipo <=199) { // pared
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH,row*TILE_HEIGHT);
				    ctx.rect(col*TILE_WIDTH,row*TILE_WIDTH,TILE_WIDTH,TILE_HEIGHT);
				    ctx.fillStyle = 'rgba(0,0,255,255)';
				    // ctx.strokeStyle = 'rgba(0,0,255,255)';
				    ctx.closePath();
				    ctx.fill();
				    // ctx.stroke();
				} else if(tipo >=10 && tipo <=13) { // fantasmas, de momento no los mostramos
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH+1,row*TILE_HEIGHT+1);
				    ctx.rect(col*TILE_WIDTH+1,row*TILE_WIDTH+1,TILE_WIDTH-1,TILE_HEIGHT-1);
				    ctx.fillStyle = 'rgba(0,0,0,255)';
				    // ctx.strokeStyle = 'rgba(0,0,0,255)';
				    ctx.closePath();
				    ctx.fill();
				    // ctx.stroke();
				}
			}
		}
	};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
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
    };

	var player = new Pacman();

	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	// thisLevel global para poder realizar las pruebas unitarias
	thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap();


	var measureFPS = function(newTime){
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
   
		thisLevel.drawMap();

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
		inputStates.right = true;
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
// Comenzamos cuando el mapa termine su carga
$(document).ajaxStop(function() { game.start(); });

	test('Mapa correctamente dibujado en pantalla', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
	     	   assert.pixelEqual( canvas,  35,35, 0, 0, 255, 255,"esquina superior izquierda azul"); 
	     	   assert.pixelEqual( canvas, 250,35, 0, 0, 0, 0,"puerta superior negra");
	     	   assert.pixelEqual( canvas, 465,35, 0, 0, 255, 255,"esquina superior derecha azul");
	     	   assert.pixelEqual( canvas, 58,58, 255, 255, 255,255,"primera pi'ldora esquina superior izquierda blanca");
	     	   assert.pixelEqual( canvas, 58,82, 255, 0,0,255,"pi'ldora de poder esquina superior izquierda roja");
	     	   assert.pixelEqual( canvas, 442,82, 255, 0,0,255,"pi'ldora de poder esquina superior derecha roja");

	     	   assert.pixelEqual( canvas, 35,300, 0, 0,0,0 ,"puerta lateral izquierda negra");
	     	   assert.pixelEqual( canvas, 252,300, 0, 0,0, 255,"centro de casa de los fantasmas negro");
	     	   assert.pixelEqual( canvas, 482, 300, 0, 0,0, 0,"puerta lateral derecha negra");
		
		   assert.pixelEqual( canvas, 12, 585, 0, 0,255,255,"esquina inferior izquierda azul"); 
	     	   assert.pixelEqual( canvas, 60, 538, 0, 0,255,255,"cuadrado interior esquina inferior izquierda azul");
	     	   assert.pixelEqual( canvas, 250,538, 255, 255,255,255,"pi'ldora central lateral inferior blanca");
	     	   assert.pixelEqual( canvas, 442,538, 0, 0,255,255,"cuadrado interior esquina inferior derecha azul");
		   assert.pixelEqual( canvas, 488,582, 0, 0,255,255,"esquina inferior derecha azul"); 

    		   done();
  }, 1000);

});

