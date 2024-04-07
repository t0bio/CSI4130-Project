var VSHADER_SOURCE = null
var FSHADER_SOURCE = null

function main() {
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('Failed to get rendering context for WebGL');
        return;
    }

    readShaderFile(gl, './shaders/bumpmap.vs', 'v');
    readShaderFile(gl, './shaders/bumpmap.fs', 'f');
}

function readShaderFile(gl, fileName, shader) {
   var request = new XMLHttpRequest();
   request.open('GET', fileName , true);
 
   request.onreadystatechange = function() {
   if (request.readyState == 4 && request.status !== 404) {
     onReadShader(gl, request.responseText, shader);
     }
   }
   // Create a request to acquire the file
 
   request.send();                      // Send the request
}
  
// The shader is loaded from file
function onReadShader(gl, fileString, shader) {
  if (shader == 'v') { // Vertex shader
    VSHADER_SOURCE = fileString;
  } else
  if (shader == 'f') { // Fragment shader
    FSHADER_SOURCE = fileString;
  }
  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
}