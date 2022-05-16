// >=test1
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

// >=test1
// GAME FRAMEWORK
var GF = function() {

	// >=test2
	// variables para contar frames/s, usadas por measureFPS
	var frameCount = 0;
	var lastTime;
	var fpsContainer;
	var fps, delta, oldTime = 0;

	// >=test4
	//  variable global temporalmente para poder testear el ejercicio
	inputStates = {left: false, up: false, right: false, down: false, space: false};

	// >=test10
	const TILE_WIDTH = 24, TILE_HEIGHT = 24;

	var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost

	// >=test10
	// hold ghost objects
	var ghosts = {};

	// >=test10
	var Ghost = function (id, ctx) {

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
		this.state = Ghost.NORMAL;
		this.stateBlinkTimer = 0;

		this.sprite = [
			new Sprite('../res/img/sprites.png', [456, 16 * this.id + 65], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/img/sprites.png', [584, 65], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/img/sprites.png', [616, 65], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/img/sprites.png', [584, 81], [16, 16], 0.005, [0, 1])
		];

		this.draw = function () {
			// test10
			// Tu código aquí
			// Pintar cuerpo de fantasma
			// Pintar ojos


			// test12
			// Tu código aquí
			// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
			// siguiendo el enunciado

			// test13
			// Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

			ctx.save();
			ctx.translate(this.x,this.y);

			if(this.state === Ghost.NORMAL) {
				this.sprite[0].render(ctx);
			} else if(this.state === Ghost.VULNERABLE) {
				if(thisGame.ghostTimer > 100) this.sprite[1].render(ctx);
				else {
					if(this.stateBlinkTimer == 20)
						this.stateBlinkTimer = 0;
					if(this.stateBlinkTimer < 10)
						this.sprite[2].render(ctx);
					else
						this.sprite[1].render(ctx);
					this.stateBlinkTimer++;
				}
			} else if(this.state === Ghost.SPECTACLES) {
				this.sprite[3].render(ctx);
			}

			ctx.restore();

		}; // draw

		this.move = function () {
			// test10
			// Tu código aquí


			// test13
			// Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida

			if (this.state === Ghost.NORMAL)
				this.sprite[0].update(delta);
			else if (this.state === Ghost.SPECTACLES)
				this.sprite[3].update(delta);
			else if (this.state === Ghost.VULNERABLE && !this.stateBlinkTimer < 10)
				this.sprite[1].update(delta);
			else
				this.sprite[2].update(delta);

			this.nearestRow = parseInt((this.y + thisGame.TILE_HEIGHT / 2) / thisGame.TILE_HEIGHT);
			this.nearestCol = parseInt((this.x + thisGame.TILE_WIDTH / 2) / thisGame.TILE_WIDTH);

			if (this.state !== Ghost.SPECTACLES) {
				var posiblesMovimientos = [[0, -this.speed], [this.speed, 0], [0, this.speed], [-this.speed, 0]];
				var soluciones = [];

				for (var i = 0; i < posiblesMovimientos.length; i++) {
					if (!thisLevel.checkIfHitWall(this.x + posiblesMovimientos[i][0], this.y + posiblesMovimientos[i][1], this.nearestRow, this.nearestCol))
						soluciones.push(posiblesMovimientos[i]);
				}

				if (thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velY, this.nearestRow, this.nearestCol) || soluciones.length == 3) {
					var pos = Math.round(Math.random() * (soluciones.length - 1));
					if (soluciones.length > 0) {
						this.velX = soluciones[pos][0];
						this.velY = soluciones[pos][1];
					}
				} else
					thisLevel.checkIfHitSomething(this, this.x, this.y, this.nearestRow, this.nearestCol);
				this.x += this.velX;
				this.y += this.velY;
			} else {
				if (this.x < this.homeX) this.x += this.speed;
				if (this.x > this.homeX) this.x -= this.speed;
				if (this.y < this.homeY) this.y += this.speed;
				if (this.y > this.homeY) this.y -= this.speed;

				if (this.x == this.homeX && this.y == this.homeY) {
					ghostEaten.play();
					this.state = Ghost.NORMAL;
					this.velY = 0;
					this.velX = -this.speed;
				}
			}
		};

	}; // fin clase Ghost

	// >=test12
	// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;

	// >=test5
	var Level = function (ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;

		this.map = [];

		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.setMapTile = function (row, col, newValue) {
			// test5
			// Tu código aquí
			this.map[row][col] = newValue;
		};

		this.getMapTile = function (row, col) {
			// test5
			// Tu código aquí
			return this.map[row][col];
		};

		this.printMap = function () {
			// test5
			// Tu código aquí
			for (var i = 0; i < thisLevel.lvlHeight; i++) {
				var current = '';
				for (var j = 0; j < thisLevel.lvlWidth; j++) {
					current += thisLevel.getMapTile(i, j) + ' ';
				}
				console.log(current)
			}
		};

		this.loadLevel = function () {
			// test5
			// Tu código aquí
			// leer res/levels/1.txt y guardarlo en el atributo map
			// haciendo uso de setMapTile

			// test10
			// Tu código aquí
			jQuery.ajax({
				url: "../res/levels/1.txt",
				dataType: "text",
				success: function (data) {
					var lineas = data.split("\n");
					var inicio = fin = false;
					var row = 0;
					for (var i = 0; i < lineas.length; i++) {
						if (lineas[i].includes("lvlwidth"))
							thisLevel.lvlWidth = lineas[i].split(" ").slice(-1).pop();

						else if (lineas[i].includes("lvlheight"))
							thisLevel.lvlHeight = lineas[i].split(" ").slice(-1).pop();

						else if (lineas[i].includes("startleveldata"))
							inicio = true;

						else if (lineas[i].includes("endleveldata"))
							fin = true;

						else if (inicio && !fin) {
							var fila = lineas[i].split(" ");
							for (var j = 0; j < fila.length; j++) {
								if (fila[j] != "") {
									if (thisLevel.map[row] === undefined)
										thisLevel.map[row] = [];
									thisLevel.setMapTile(row, j, fila[j]);
									if (fila[j] == 2) thisLevel.pellets++;
								}
							}
							row++;
						}

					}
				}
			});
			var pts = localStorage.getItem("maxptspacman");
			if(pts!=null){
				thisGame.highscore=pts;
			} else {
				localStorage.setItem("maxptspacman", 0);
				thisGame.highscore=0;
			}
		};
		this.displayGameOver = function () {
			ctx.beginPath();
			ctx.font = "60px Arial";
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.fillText("GAME OVER", w / 2 - 50, h / 2);
			ctx.closePath();
		};
		this.displayVictoria = function () {
			ctx.beginPath();
			ctx.font = "60px Arial";
			ctx.fillStyle = "green";
			ctx.textAlign = "center";
			ctx.fillText("VICTORIA", w / 2 - 50, h / 2);
			ctx.closePath();

			if(thisGame.points > thisGame.highscore){
				localStorage.setItem("maxptspacman", thisGame.points);
			}
		};

		this.displayScore = function () {
			ctx.beginPath();
			ctx.font = "18px Arial";
			ctx.fillStyle = "red";
			ctx.fillText("1UP ", TILE_WIDTH, TILE_HEIGHT - 5);
			ctx.closePath();
			ctx.beginPath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText(thisGame.points, TILE_WIDTH * 4, TILE_HEIGHT - 5);
			ctx.closePath();
			ctx.fillStyle = "red";
			ctx.fillText("HIGH SCORE", TILE_WIDTH * 12, TILE_HEIGHT - 5);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText(thisGame.highscore, TILE_WIDTH * 19, TILE_HEIGHT - 5);
			ctx.closePath();
			ctx.beginPath();
			ctx.fillStyle = "#fff";
			ctx.fillText("Lifes: " + thisGame.lifes, TILE_WIDTH, TILE_HEIGHT * 25 - 5);
			ctx.closePath();
		};

		// >=test6
		this.drawMap = function () {

			var TILE_WIDTH = thisGame.TILE_WIDTH;
			var TILE_HEIGHT = thisGame.TILE_HEIGHT;

			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3
			};

			// test6
			// Tu código aquí
			if (this.powerPelletBlinkTimer == 60) this.powerPelletBlinkTimer = 0;
			for (var row = 0; row < thisGame.screenTileSize[0]; row++) {
				for (var col = 0; col < thisGame.screenTileSize[1]; col++) {
					var tipo = thisLevel.getMapTile(row, col);
					if (tipo == 4) { // pacman
						player.homeX = col * TILE_WIDTH;
						player.homeY = row * TILE_HEIGHT;
						// } else if(tipo == 0) { // vacía
					} else if (tipo == 2) { // pildora
						ctx.beginPath();
						ctx.moveTo(col * TILE_WIDTH + 12, row * TILE_HEIGHT + 12);
						ctx.arc(col * TILE_WIDTH + 12, row * TILE_HEIGHT + 12, 5, 0, 2 * Math.PI, false);
						ctx.fillStyle = 'rgba(255,255,255,255)';
						ctx.closePath();
						ctx.fill();
					} else if (tipo == 3 && this.powerPelletBlinkTimer < 30) { // pildora poder
						ctx.beginPath();
						ctx.moveTo(col * TILE_WIDTH + 12, row * TILE_HEIGHT + 12);
						ctx.arc(col * TILE_WIDTH + 12, row * TILE_HEIGHT + 12, 4, 0, 2 * Math.PI, false);
						ctx.fillStyle = 'rgba(255,0,0,255)';
						ctx.closePath();
						ctx.fill();
					} else if (tipo >= 100 && tipo <= 199) { // pared
						ctx.beginPath();
						ctx.moveTo(col * TILE_WIDTH, row * TILE_HEIGHT);
						ctx.rect(col * TILE_WIDTH, row * TILE_WIDTH, TILE_WIDTH, TILE_HEIGHT);
						ctx.fillStyle = 'rgba(0,0,255,255)';
						ctx.closePath();
						ctx.fill();
					} else if (tipo >= 10 && tipo <= 13) { // fantasmas, de momento no los mostramos
						ghosts[tipo - 10].homeX = col * TILE_WIDTH;
						ghosts[tipo - 10].homeY = row * TILE_HEIGHT;
					}
				}
			}
			this.powerPelletBlinkTimer++;

		};

		// >=test7
		this.isWall = function (row, col) {
			// test7
			// Tu código aquí
			if (row < 0 || row > thisGame.screenTileSize[0]) return true;
			if (col < 0 || col > thisGame.screenTileSize[1]) return true;
			var pos = thisLevel.getMapTile(row, col);
			if (pos >= 100 && pos <= 199) return true;
			else return false;
		};

		// >=test7
		this.checkIfHitWall = function (possiblePlayerX, possiblePlayerY, row, col) {
			// test7
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared
			// Hacer uso de isWall
			var numCollisions = 0;
			for (var r = row - 1; r < row + 2; r++) {
				for (var c = col - 1; c < col + 2; c++) {

					if ((Math.abs(possiblePlayerX - (c * thisGame.TILE_WIDTH)) < thisGame.TILE_WIDTH) && (Math.abs(possiblePlayerY - (r * thisGame.TILE_HEIGHT)) < thisGame.TILE_HEIGHT)) {
						if (this.isWall(r, c)) numCollisions++;
					}
				}
			}
			if (numCollisions > 0) return true;
			else return false;
		};

		// >=test11
		this.checkIfHit = function (playerX, playerY, x, y, holgura) {
			// Test11
			// Tu código aquí
			var chocan = false;
			if (Math.abs(playerX - x) < holgura && Math.abs(playerY - y) < holgura) chocan = true;
			return chocan;
		};

		// >=test8
		this.checkIfHitSomething = function (instancia, playerX, playerY, row, col) {
			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3,
				'pellet': 2
			};

			// test8
			// Tu código aquí
			// Gestiona la recogida de píldoras

			// test9
			// Tu código aquí
			// Gestiona las puertas teletransportadoras

			// test12
			// Tu código aquí
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)

			//  Gestiona la recogida de píldoras
			if(instancia instanceof Pacman) {
				for (var r = row-1; r < row+2; r++) {
					for (var c = col-1; c < col+2; c++) {
						if((Math.abs(playerX - (c * thisGame.TILE_WIDTH)) < 4) && (Math.abs(playerY - (r * thisGame.TILE_HEIGHT)) < 4)) {
							pos = thisLevel.getMapTile(r, c);
							if (pos == tileID.pellet) {
								eating.play();
								thisLevel.setMapTile(r, c, 0);
								thisLevel.pellets--;
								thisGame.addToScore(tileID.pellet);
								if(thisLevel.pellets == 0) this.displayVictoria();
							}
							else if (pos == 3) {
								eatPill.stop();
								eatPill.play();
								thisLevel.setMapTile(r, c, 0);
								for (var i=0; i< numGhosts; i++){
									ghosts[i].state = Ghost.VULNERABLE;
								}
								waza.stop();
								waza.play();
								thisGame.ghostTimer = 360;
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

	// >=test2
	var Pacman = function () {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.homeX = 0;
		this.homeY = 0;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.sprite = [
			new Sprite('../res/img/sprites.png', [454, 0], [16, 16], 0.005, [0, 1, 2]),
			new Sprite('../res/img/sprites.png', [470, 0], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/img/sprites.png', [486, 0], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/img/sprites.png', [502, 0], [16, 16], 0.005, [0, 1])
		];
	};

	// >=test3
	Pacman.prototype.move = function () {

		// test3 / test4 / test7
		// Tu código aquí

		// >=test8: introduce esta instrucción
		// dentro del código implementado en el test7:
		// tras actualizar this.x  y  this.y...
		// check for collisions with other tiles (pellets, etc)
		//  thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);

		// test11
		// Tu código aquí
		// check for collisions with the ghosts

		// test13
		// Tu código aquí
		// Si chocamos contra un fantasma y su estado es Ghost.VULNERABLE
		// cambiar velocidad del fantasma y pasarlo a modo Ghost.SPECTACLES

		// test14
		// Tu código aquí.
		// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST

		if(this.velX > 0)
			this.sprite[0].update(delta);
		else if(this.velX < 0)
			this.sprite[1].update(delta);
		else if(this.velY < 0)
			this.sprite[2].update(delta);
		else if(this.velY > 0)
			this.sprite[3].update(delta);

		this.nearestRow = parseInt((this.y + thisGame.TILE_HEIGHT/2)/thisGame.TILE_HEIGHT);
		this.nearestCol = parseInt((this.x + thisGame.TILE_WIDTH/2)/thisGame.TILE_WIDTH);

		if(!thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velXY, this.nearestRow, this.nearestCol)) {
			thisLevel.checkIfHitSomething(this,this.x, this.y, this.nearestRow, this.nearestCol);
			for (var i=0; i< numGhosts; i++){
				if(thisLevel.checkIfHit(this.x, this.y, ghosts[i].x, ghosts[i].y, thisGame.TILE_WIDTH/2)) {
					if(ghosts[i].state == Ghost.NORMAL) {
						die.play();
						thisGame.setMode(thisGame.HIT_GHOST);
					} else if(ghosts[i].state == Ghost.VULNERABLE) {
						eatGhost.play();
						ghosts[i].state = Ghost.SPECTACLES;
						ghosts[i].velX = 0;
						ghosts[i].velY = 0;
					}
				}
			}
			this.x += this.velX;
			this.y += this.velY;
		} else {
			this.velX = 0;
			this.velY = 0;
		}
	};

	// >=test2
	// Función para pintar el Pacman
	// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function (x, y) {

		// Pac Man
		// test2
		// Tu código aquí
		// ojo: en el test2 esta función se llama drawPacman(x,y))
		ctx.save();
		ctx.translate(this.x,this.y);

		if(this.velX > 0)
			this.sprite[0].render(ctx);
		else if(this.velX < 0)
			this.sprite[1].render(ctx);
		else if(this.velY < 0)
			this.sprite[2].render(ctx);
		else if(this.velY > 0)
			this.sprite[3].render(ctx);
		else
			this.sprite[0].render(ctx);

		ctx.restore();
	};

	// >=test5
	var player = new Pacman();

	// >=test10
	for (var i = 0; i < numGhosts; i++) {
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}

	// >=test5
	var thisGame = {
		getLevelNum: function () {
			return 0;
		},

		// >=test14
		setMode: function (mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},
		addToScore : function(points) {
			this.points += points;
		},
		// >=test6
		screenTileSize: [24, 21],

		// >=test5
		TILE_WIDTH: 24,
		TILE_HEIGHT: 24,

		// >=test12
		ghostTimer: 0,

		// >=test14
		NORMAL: 1,
		HIT_GHOST: 2,
		GAME_OVER: 3,
		WAIT_TO_START: 4,
		modeTimer: 0,
		lifes: 3,
		points: 0,
		highscore: 0
	};

	// >=test5
	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel(thisGame.getLevelNum());
	// thisLevel.printMap();

	// >=test2
	var measureFPS = function (newTime) {
		// la primera ejecución tiene una condición especial

		if (lastTime === undefined) {
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

	// >=test3
	// clears the canvas content
	var clearCanvas = function () {
		ctx.clearRect(0, 0, w, h);
	};

	// >=test4
	var checkInputs = function () {

		// test4
		// Tu código aquí (reestructúralo para el test7)

		// test7
		// Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
		if (inputStates.left) {
			if (!thisLevel.checkIfHitWall(player.x - player.speed, player.y, player.nearestRow, player.nearestCol)) {
				player.velY = 0;
				player.velX = -player.speed;
				inputStates.up = inputStates.down = inputStates.right = false;
			} else {
				player.velX = player.velY = 0;
				inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		}
		if (inputStates.up) {
			if (!thisLevel.checkIfHitWall(player.x, player.y - player.speed, player.nearestRow, player.nearestCol)) {
				player.velY = -player.speed;
				player.velX = 0;
				inputStates.left = inputStates.down = inputStates.right = false;
			} else {
				player.velX = player.velY = 0;
				inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		}
		if (inputStates.down) {
			if (!thisLevel.checkIfHitWall(player.x, player.y + player.speed, player.nearestRow, player.nearestCol)) {
				player.velY = player.speed;
				player.velX = 0;
				inputStates.up = inputStates.left = inputStates.right = false;
			} else {
				player.velX = player.velY = 0;
				inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		}
		if (inputStates.right) {
			if (!thisLevel.checkIfHitWall(player.x + player.speed, player.y, player.nearestRow, player.nearestCol)) {
				player.velY = 0;
				player.velX = player.speed;
				inputStates.up = inputStates.down = inputStates.left = false;
			} else {
				player.velX = player.velY = 0;
				inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
			// } else {
			//   player.velX = player.velY = 0;
			//   inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
		}
	};

	// >=test12
	var updateTimers = function () {
		// test12
		// Tu código aquí
		// Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)

		// test14
		// Tu código aquí
		// actualiza modeTimer...
		var vulnerables = false
		for (var i = 0; i < numGhosts; i++) {
			if (ghosts[i].state == Ghost.VULNERABLE) vulnerables = true;
		}

		if (vulnerables) {
			if (thisGame.ghostTimer > 0) thisGame.ghostTimer--;
			else {
				for (var i = 0; i < numGhosts; i++) {
					if (ghosts[i].state !== Ghost.SPECTACLES)
						ghosts[i].state = Ghost.NORMAL;
				}
				waza.stop();
			}
		}

		if (thisGame.mode == thisGame.WAIT_TO_START) {
			thisGame.modeTimer++;
			if (thisGame.modeTimer >= 30) {
				thisGame.setMode(thisGame.NORMAL);
			}
		}

		if (thisGame.mode == thisGame.HIT_GHOST) {
			thisGame.modeTimer++;
			if (thisGame.modeTimer >= 90) {
				thisGame.lifes--;
				if (thisGame.lifes == 0)
					thisGame.setMode(thisGame.GAME_OVER);
				else {
					thisGame.setMode(thisGame.WAIT_TO_START);
					reset();
				}
			}
		}

	};

	var timer = function (currentTime) {
		if (oldTime === undefined) {
			oldTime = currentTime;
			return;
		}

		var aux = currentTime - oldTime;
		oldTime = currentTime;
		return aux;
	};
	// >=test1
	var mainLoop = function (time) {
		//main function, called each frame
		measureFPS(time);
		delta = timer(time);

		if (thisGame.mode == thisGame.GAME_OVER) {
			siren.stop();
			thisLevel.displayGameOver();
		} else {
			if (thisGame.mode == thisGame.NORMAL) {
				checkInputs();

				// Mover fantasmas
				for (var i = 0; i < numGhosts; i++) {
					ghosts[i].move();
				}
				player.move();
			}

			// Clear the canvas
			clearCanvas();

			thisLevel.drawMap();
			thisLevel.displayScore();

			// Pintar fantasmas
			for (var i = 0; i < numGhosts; i++) {
				ghosts[i].draw();
			}

			player.draw();


			// call the animation loop every 1/60th of second
			updateTimers();
			requestAnimationFrame(mainLoop);
		}
	};
	// >=test4
	var addListeners = function () {

		// add the listener to the main, window object, and update the states
		// test4
		// Tu código aquí
		window.onkeydown = function (e) {
			// http://keycode.info/
			// https://github.com/ilyanep/3333360/blob/master/Milestone/src/pacman.pyw
			switch(e.which || e.keyCode) {
				case 32: //space
					inputStates.space = true;
					console.log("Se ha pulsado espacio");
					break;
				case 37: case 65: // left || A
					if (!thisLevel.checkIfHitWall(player.x - player.speed, player.y, player.nearestRow, player.nearestCol)) {
						inputStates.left = true;
						inputStates.down = inputStates.right = inputStates.up = false;
					}
					break;
				case 38: case 87: // up || W
					if (!thisLevel.checkIfHitWall(player.x, player.y - player.speed, player.nearestRow, player.nearestCol)) {
						inputStates.up = true;
						inputStates.left = inputStates.down = inputStates.right = false;
					}
					break;
				case 39: case 68: // right || D
					if (!thisLevel.checkIfHitWall(player.x + player.speed, player.y, player.nearestRow, player.nearestCol)) {
						inputStates.right = true;
						inputStates.left = inputStates.down = inputStates.up = false;
					}
					break;
				case 40: case 83: // down || S
					if (!thisLevel.checkIfHitWall(player.x, player.y + player.speed, player.nearestRow, player.nearestCol)) {
						inputStates.down = true;
						inputStates.left = inputStates.right = inputStates.up = false;
					}
					break;
				default: return;
			}
			e.preventDefault(); // evitar scroll
		};
	};


	//>=test7
	var reset = function () {

		// test12
		// Tu código aquí
		// probablemente necesites inicializar los atributos de los fantasmas
		// (x,y,velX,velY,state, speed)

		// test7
		// Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado

		// test10
		// Tu código aquí
		// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente

		// >=test14
		inputStates.left = inputStates.down = inputStates.up = false;
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

		thisGame.setMode(thisGame.NORMAL);
	};

	function init() {
		loadAssets();
	}

	function loadAssets() {
		eatPill = new Howl({
			src: ['../res/sounds/eat-pill.mp3'],
			volume: 1,
			onload: function () {
				eating = new Howl({
					src: ['../res/sounds/eating.mp3'],
					volume: 1,
					onload: function () {
						siren = new Howl({
							src: ['../res/sounds/siren.mp3'],
							volume: 1,
							loop: true,
							onload: function () {
								waza = new Howl({
									src: ['../res/sounds/waza.mp3'],
									volume: 1,
									loop: true,
									onload: function () {
										eatGhost = new Howl({
											src: ['../res/sounds/eat-ghost.mp3'],
											volume: 1,
											onload: function () {
												ghostEaten = new Howl({
													src: ['../res/sounds/ghost-eaten.mp3'],
													volume: 1,
													onload: function () {
														die = new Howl({
															src: ['../res/sounds/die.mp3'],
															volume: 1,
															onload: function () {
																ready = new Howl({
																	src: ['../res/sounds/ready.mp3'],
																	volume: 1,
																	autoplay: true,
																	onload: function () {
																		requestAnimationFrame(mainLoop); // comenzar animación
																	},
																	onend: function () {
																		siren.play();
																	}
																});
															}
														});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}

	// >=test1
	var start = function () {

		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer);

		// >=test4
		addListeners();
		thisLevel.drawMap();

		// >=test7
		reset();

		// start the animation
		resources.load([
			'../res/img/sprites.png'
		]);
		resources.onReady(init);
	};

	// >=test1
	//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,
		thisGame: thisGame
	};
};

// >=test1
var game = new GF();
$(document).ajaxStop(function() { game.start(); });