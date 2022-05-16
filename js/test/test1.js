//Test1 Archivo JavaScript
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx=canvas.getContext("2d");
var w = canvas.width;
var h= canvas.height;

// Game Framework
var GF = function(){
   var mainLoop = function(time){
    // Tu código aquí
    var x = Math.random() * w;
    var y = Math.random() * h;
    ctx.beginPath();
    ctx.arc(x,y,5,0,2*Math.PI, true);
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'green';
    ctx.fill();
    ctx.stroke();
    requestAnimationFrame(mainLoop);
  };
  var start = function(){
    requestAnimationFrame(mainLoop);
  };
  return {
    start: start
  };
};

var game = new GF();
game.start();


test('Testeando colores', function(assert) {  

    var done = assert.async();
    var verde = 0;
   
//   ctx.fillStyle = 'red';
//   ctx.fillRect(15,15,4,4);    

  setTimeout(function() {
         var colores = [];
         
         colores.push(
         Array.prototype.slice.apply(canvas.getContext("2d").getImageData(15, 15, 1, 1).data), Array.prototype.slice.apply(canvas.getContext("2d").getImageData(45, 45, 1, 1).data), Array.prototype.slice.apply(canvas.getContext("2d").getImageData(75, 75, 1, 1).data), Array.prototype.slice.apply(canvas.getContext("2d").getImageData(105, 105, 1, 1).data),
 Array.prototype.slice.apply(canvas.getContext("2d").getImageData(135, 135, 1, 1).data)
         );
         
   for(var i=0; i< colores.length; i++)
      if (colores[i][1] == 128)
         verde++;
        

   assert.ok( verde >= 1, "Passed!");  
    done();
  }, 10000 );
    
});



