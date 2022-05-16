//Test10 Archivo JavaScript
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

    const TILE_WIDTH=24, TILE_HEIGHT=24;

    var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost


	// hold ghost objects
	var ghosts = {};

    var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.draw = function(){
			// Pintar cuerpo de fantasma
			// Pintar ojos 
			this.ctx.beginPath();

		    this.ctx.moveTo(this.x,this.y+TILE_HEIGHT);
		    this.ctx.quadraticCurveTo(this.x+(TILE_WIDTH/2),this.y/1.05,this.x+TILE_WIDTH,this.y+TILE_HEIGHT);
		    this.ctx.fillStyle = ghostcolor[this.id];
		    this.ctx.closePath();
		    this.ctx.fill();

		    this.ctx.beginPath();
		    this.ctx.fillStyle = '#fff';
			this.ctx.arc(this.x+(TILE_WIDTH/4),this.y+(TILE_WIDTH/2),3,0,2*Math.PI,true);
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.arc(this.x+(3*TILE_WIDTH/4),this.y+(TILE_WIDTH/2),3,0,2*Math.PI,true);
			this.ctx.fill();
		}; // draw

		this.move = function() {
			this.nearestRow = parseInt((this.y + thisGame.TILE_HEIGHT/2)/thisGame.TILE_HEIGHT);
			this.nearestCol = parseInt((this.x + thisGame.TILE_WIDTH/2)/thisGame.TILE_WIDTH);
			
			var posiblesMovimientos = [[0,-this.speed],[this.speed,0],[0,this.speed],[-this.speed,0]];
			var soluciones = [];

			for (var i = 0; i < posiblesMovimientos.length; i++) {
				if(!thisLevel.checkIfHitWall(this.x+posiblesMovimientos[i][0], this.y+posiblesMovimientos[i][1],this.nearestRow,this.nearestCol))
					soluciones.push(posiblesMovimientos[i]);
			}

			if(thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velY, this.nearestRow, this.nearestCol)|| soluciones.length == 3) {
				var pos = Math.round(Math.random()*(soluciones.length-1));
				this.velX = soluciones[pos][0];
            	this.velY = soluciones[pos][1];
			} else
				thisLevel.checkIfHitSomething(this,this.x, this.y, this.nearestRow, this.nearestCol);
			this.x += this.velX;
        	this.y += this.velY;
		};

	};

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

	this.loadLevel = function(){
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
						    	if(fila[j] == 2) thisLevel.pellets++;
						    }
						}
	            		row++;
	            	}

	            }
	        }
		});
	};

	this.drawMap = function(){

		var TILE_WIDTH = thisGame.TILE_WIDTH;
		var TILE_HEIGHT = thisGame.TILE_HEIGHT;

		var tileID = {
			'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
		};

		if(this.powerPelletBlinkTimer == 60) this.powerPelletBlinkTimer = 0;
		for (var row = 0; row < thisGame.screenTileSize[0]; row++) {
			for (var col = 0; col < thisGame.screenTileSize[1]; col++) {
				var tipo = thisLevel.getMapTile(row,col);
				if(tipo == 4) { // pacman
					player.homeX = col*TILE_WIDTH;
					player.homeY = row*TILE_HEIGHT;
				// } else if(tipo == 0) { // vacía
				} else if(tipo == 2) { // pildora
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12);
				    ctx.arc(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12,5,0,2*Math.PI,false);
				    ctx.fillStyle = 'rgba(255,255,255,255)';
				    ctx.closePath();
				    ctx.fill();
				} else if(tipo == 3 && this.powerPelletBlinkTimer < 30) { // pildora poder
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12);
				    ctx.arc(col*TILE_WIDTH + 12,row*TILE_HEIGHT + 12,4,0,2*Math.PI,false);
				    ctx.fillStyle = 'rgba(255,0,0,255)';
				    ctx.closePath();
				    ctx.fill();
				} else if(tipo >=100 && tipo <=199) { // pared
					ctx.beginPath();
				    ctx.moveTo(col*TILE_WIDTH,row*TILE_HEIGHT);
				    ctx.rect(col*TILE_WIDTH,row*TILE_WIDTH,TILE_WIDTH,TILE_HEIGHT);
				    ctx.fillStyle = 'rgba(0,0,255,255)';
				    ctx.closePath();
				    ctx.fill();
				} else if(tipo >=10 && tipo <=13) { // fantasmas, de momento no los mostramos
					ghosts[tipo-10].homeX = col*TILE_WIDTH;
					ghosts[tipo-10].homeY = row*TILE_HEIGHT;
				}
			}
		}
		this.powerPelletBlinkTimer++;
	};


		this.isWall = function(row, col) {
			var pos = thisLevel.getMapTile(row, col);
			if(pos >=100 && pos <=199) return true;
			else return false;
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			var numCollisions = 0;
			for (var r = row-1; r < row+2; r++) {
				for (var c = col-1; c < col+2; c++) {

					if((Math.abs(possiblePlayerX - (c * thisGame.TILE_WIDTH)) < thisGame.TILE_WIDTH) && (Math.abs(possiblePlayerY - (r * thisGame.TILE_HEIGHT)) < thisGame.TILE_HEIGHT)) {
						if(this.isWall(r,c)) numCollisions++;
					}
				}
			}
			if(numCollisions > 0) return true;
			else return false;
		};

		this.checkIfHitSomething = function(instancia, playerX, playerY, row, col){
			var tileID = {
	    			'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};
			//  Gestiona la recogida de píldoras
			if(instancia instanceof Pacman) {
				for (var r = row-1; r < row+2; r++) {
					for (var c = col-1; c < col+2; c++) {
						if((Math.abs(playerX - (c * thisGame.TILE_WIDTH)) < 4) && (Math.abs(playerY - (r * thisGame.TILE_HEIGHT)) < 4)) {
							pos = thisLevel.getMapTile(r, c);
							if (pos == tileID.pellet) {
								thisLevel.setMapTile(r, c, 0);
								thisLevel.pellets--;
								if(thisLevel.pellets == 0) console.log("Next level!");
							}
						}
					}
				}
			}
			//  Gestiona las puertas teletransportadoras
			for (var r = row-1; r < row+2; r++) {
				for (var c = col-1; c < col+2; c++) {
					if((Math.abs(playerX - (c * thisGame.TILE_WIDTH)) < 8) && (Math.abs(playerY - (r * thisGame.TILE_HEIGHT)) < 8)) {
						pos = thisLevel.getMapTile(r, c);
						if(pos == 20) {
							if(instancia.velX > 0) instancia.x -= (thisGame.screenTileSize[1]-2)*thisGame.TILE_WIDTH;
							else instancia.x += (thisGame.screenTileSize[1]-2)*thisGame.TILE_WIDTH;

						} else if(pos == 21) {
							if(instancia.velY > 0) instancia.y -= (thisGame.screenTileSize[0]-2)*thisGame.TILE_HEIGHT;
							else instancia.y += (thisGame.screenTileSize[0]-2)*thisGame.TILE_HEIGHT;
						}
					}
				}
			}
		};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.homeX = 0;
		this.homeY = 0;
		this.nearestRow = 0;
        this.nearestCol = 0;
	};
	Pacman.prototype.move = function() {
		this.nearestRow = parseInt((this.y + this.radius) / thisGame.TILE_HEIGHT);
		this.nearestCol = parseInt((this.x + this.radius) / thisGame.TILE_WIDTH);

		if(!thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velXY, this.nearestRow, this.nearestCol)) {
			thisLevel.checkIfHitSomething(this,this.x, this.y, this.nearestRow, this.nearestCol);
			this.x += this.velX;
            this.y += this.velY;
		} else {
			this.velX = 0;
            this.velY = 0;
		}
	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
        if(this.velX > 0) {
    		this.angle1 = 0.25;
	        this.angle2 = 1.75;
    	} else if(this.velX < 0) {
    		this.angle1 = 1.25;
			this.angle2 = 0.75;
    	} else if(this.velY > 0) {
    		this.angle1 = 0.75;
			this.angle2 = 0.25;
    	} else if(this.velY < 0) {
    		this.angle1 = 1.75;
			this.angle2 = 1.25;
    	}
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
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}


	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [25, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );

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
		if(inputStates.left) {
  		  if (!thisLevel.checkIfHitWall(player.x - player.speed, player.y, player.nearestRow, player.nearestCol)) {
		      player.velY = 0;
		      player.velX = -player.speed;
		      inputStates.up = inputStates.down = inputStates.right = false;
		  } else {
		  	inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
		  }
	    } else if(inputStates.up) {
	      if (!thisLevel.checkIfHitWall(player.x, player.y - player.speed, player.nearestRow, player.nearestCol)) {
		      player.velY = -player.speed;
		      player.velX = 0;
		      inputStates.left = inputStates.down = inputStates.right = false;
		  } else {
		  	inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
		  }
	    } else if(inputStates.down) {
	    	if (!thisLevel.checkIfHitWall(player.x, player.y + player.speed, player.nearestRow, player.nearestCol)) {
	          player.velY = player.speed;
	      	  player.velX = 0;
	      	  inputStates.up = inputStates.left = inputStates.right = false;
	      	} else {
		  	inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
		  }
	    } else if(inputStates.right) {
	      if (!thisLevel.checkIfHitWall(player.x + player.speed, player.y, player.nearestRow, player.nearestCol)) {
	      	player.velY = 0;
		    player.velX = player.speed;
		    inputStates.up = inputStates.down = inputStates.left = false;
	      } else {
	      	inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
	      }
	    } else {
	      player.velX = player.velY = 0;
	      inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
	    }
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
		checkInputs();

	    // Mover fantasmas
		for (var i=0; i< numGhosts; i++){
			ghosts[i].move();
		}
		player.move();
		// Clear the canvas
        clearCanvas();
   
		thisLevel.drawMap();

	    // Pintar fantasmas
		for (var i=0; i< numGhosts; i++){
			ghosts[i].draw();
		}

		player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
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

    var reset = function(){
		inputStates.right = true;
		player.velY = 0;
		player.velX = player.speed;
		
		player.x = player.homeX;
		player.y = player.homeY;
		player.nearestCol = parseInt(player.x / thisGame.TILE_WIDTH);
		player.nearestRow = parseInt(player.y / thisGame.TILE_HEIGHT);

		for (var i=0; i< numGhosts; i++){
			ghosts[i].x = ghosts[i].homeX;
			ghosts[i].y = ghosts[i].homeY;
			ghosts[i].velY = 0;
			ghosts[i].velX = -ghosts[i].speed;
		}
    };

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
		addListeners();
		thisLevel.drawMap();
		reset();

        // start the animation
        requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start,
		ghost: Ghost // exportando Ghost para poder probarla
    };
};



  var game = new GF();
  $(document).ajaxStop(function() { game.start(); });


test('Clase Ghost bien implementada', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		var ghost = new game.ghost(4, canvas.getContext("2d"));
		assert.ok( typeof(ghost)!= "undefined" , "El fantasma existe" );

		ghost.x = 250;
		ghost.y = 240;
		ghost.velX = 3;
		ghost.velY = 0;
		ghost.draw(); // no se va a ver, porque no está en el mainloop, pero queremos verificar que no da errores
		ghost.move();
		assert.ok( ghost.x > 250 , "El fantasma se mueve hacia la derecha cuando es posible" );

    		ghost.x = 240;
		ghost.y = 242;
		ghost.velX = 0;
		ghost.velY = 3;
		ghost.draw(); // no se va a ver, porque no está en el mainloop....
		ghost.move();
		assert.ok( ghost.y > 240 , "El fantasma se mueve hacia abajo cuando es posible" );
    	
		ghost.x = 240;
		ghost.y = 240;
		ghost.draw(); // no se va a ver, porque no está en el mainloop....
		ghost.move(); // lo movemos dos veces
		ghost.move();
		ghost.velX = 3;
		ghost.velY = 3;
		assert.ok( (ghost.x != 240 && ghost.y == 240) || (ghost.x == 240 && ghost.y != 240) , "El fantasma elige una direccio'n al azar cuando encuentra una bifurcacio'n " );
    	
		done();
  }, 1000);

});


