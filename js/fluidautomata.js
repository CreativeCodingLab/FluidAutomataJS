


var nc = 14; //num vertices
var numCellsPerSide = nc - 1; //not num vertices! i.e., 5 cells = 6 vertices
var ncsq = nc * nc;
var csx = csy = (2.0 / nc);




var scaleVal = 1.0;

var ptsA;
var ptsB, ptsB_L, ptsB_R;

var os;
var ms;

var oL = Math.PI / 8;
var oR = -Math.PI / 8;
var oM = 0.25; //percentage of forward energy that goes to the side

var lines, linesL, linesR;
var g_pA, g_pB, g_pB_L, g_pB_R;

var tmpHolder;

var isPressing = false;
var isDragging = false;
var currentMouseIdx = -1;
var currentMouseTheta = 0.0;

var flag = 0;
var fluidsOn = true;
var debugOn = false;

var canvas, scene, renderer;

var FBO_a, meshA, textureA;
var FBO_b, meshB, textureB;

var camera, fullscreenQuadGeometry;

var fullscreenQuadMesh; //fullscreen quad mesh

var loader; 
var baseTexture;

var isInitialized = false;
var needToLoadFBOs = true;

var stats = new Stats();

var magVal; 
var energyVal;
var blendVal;
var contrastVal;
var saturateVal;
var brightnessVal;
var dissipationVal;

var gui = new dat.GUI();


init(); 


function keypress(event) {

  var keyVal = '?';

  if (event.which != 0 && event.charCode != 0) {
    keyVal = String.fromCharCode(event.which)
      console.log("key press = " + keyVal);
  } 

  if (keyVal == 's') {  //swap textures )
  }
}




function initializeDebugVectors() {

   lines = new Array(ncsq); 
   linesL = new Array(ncsq); 
   linesR = new Array(ncsq); 
   g_pA = new Array(ncsq); 
   g_pB = new Array(ncsq); 
   g_pB_L = new Array(ncsq); 
   g_pB_R = new Array(ncsq); 

  for (var i = 0; i < ncsq; i++) {

  var material_p = new THREE.PointsMaterial({
       color: 0xff0000,
         size: 0.1, 
     });

     var gA = new THREE.Geometry();
     gA.vertices.push(
         new THREE.Vector3( ptsA[i].x, ptsA[i].y, 0 )
         );

     g_pA[i] = new THREE.Points( gA, material_p );


     material_p = new THREE.PointsMaterial({
       color: 0x00ff00,
                size: 0.05, 
     });

     var gB = new THREE.Geometry();
     gB.vertices.push(
         new THREE.Vector3( ptsB[i].x, ptsB[i].y, 0 )
         );

     g_pB[i] = new THREE.Points( gB, material_p );

     var gB_L = new THREE.Geometry();
     gB_L.vertices.push(
         new THREE.Vector3( ptsB_L[i].x, ptsB_L[i].y, 0 )
         );

     g_pB_L[i] = new THREE.Points( gB_L, material_p );

      var gB_R = new THREE.Geometry();
     gB_R.vertices.push(
         new THREE.Vector3( ptsB_R[i].x, ptsB_R[i].y, 0 )
         );

     g_pB_R[i] = new THREE.Points( gB_R, material_p );



    scene.add( g_pA[i] );
    scene.add( g_pB[i] );
    scene.add( g_pB_L[i] );
    scene.add( g_pB_R[i] );



    var material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 0.1
        
    });

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3( ptsA[i].x, ptsA[i].y, 0 ),
        new THREE.Vector3( ptsB[i].x, ptsB[i].y, 0 )
        );

    var line = new THREE.Line( geometry, material );
    lines[i] = line;

    var geometryL = new THREE.Geometry();
    geometryL.vertices.push(
        new THREE.Vector3( ptsA[i].x, ptsA[i].y, 0 ),
        new THREE.Vector3( ptsB_L[i].x, ptsB_L[i].y, 0 )
        );

    var lineL = new THREE.Line( geometryL, material );
    linesL[i] = lineL;

    var geometryR = new THREE.Geometry();
    geometryR.vertices.push(
        new THREE.Vector3( ptsA[i].x, ptsA[i].y, 0 ),
        new THREE.Vector3( ptsB_R[i].x, ptsB_R[i].y, 0 )
        );

    var lineR = new THREE.Line( geometryR, material );
    linesR[i] = lineR;




    scene.add( line );
    scene.add( lineL );
    scene.add( lineR );
  }
}



function initializeFluidCells() {

  //initialize cells
  ptsA = new Array(ncsq);
  ptsB = new Array(ncsq); 
  ptsB_L = new Array(ncsq); 
  ptsB_R = new Array(ncsq); 
  os = new Array(ncsq);
  ms = new Array(ncsq);

  var sx = -1 + csx/2.0;  
  var sy = -1 + csy/2.0;  

  for (var i = 0; i < ncsq; i++) {

    //set initial magnitude and orientation for cell
    //os[i] = (Math.PI/2) - (Math.PI/32) + (Math.random() * (Math.PI/16));
    //ms[i] = 0.1; //1.0 / 9.0; //Math.random();
    os[i] = 0.0;
    ms[i] = 0.0;

    ptsA[i] = new THREE.Vector2();
    ptsA[i].x = sx + (csx * (i % nc));
    ptsA[i].y = - (  sy + (csy * Math.floor((i / nc)))  );

    ptsB[i] = new THREE.Vector2();
    ptsB[i].x = ptsA[i].x + ( (ms[i] * csx) * Math.cos(os[i]));
    ptsB[i].y = - (  ptsA[i].y - ( (ms[i] * csy) * Math.sin(os[i]))  );

    ptsB_L[i] = new THREE.Vector2();
    ptsB_L[i].x = ptsA[i].x + ( (ms[i] * oM * csx) * Math.cos(os[i] + oL));
    ptsB_L[i].y = - (  ptsA[i].y - ( (ms[i] * oM * csy) * Math.sin(os[i] + oL)) );

    ptsB_R[i] = new THREE.Vector2();
    ptsB_R[i].x = ptsA[i].x + ( (ms[i] * csx) * Math.cos(os[i] + oR));
    ptsB_R[i].y = - (  ptsA[i].y - ( (ms[i] * csy) * Math.sin(os[i] + oR)) );


  }

  //tmp holder - holds an array of flux vectors for each cell in the holder
  tmpHolder = new Array(ncsq);
  for (var i = 0; i < ncsq; i++) {
    tmpHolder[i] = new Array();
  }


}

var video;
var videoStream;
var videoTrack;
var videoImage;
var videoImageContext;
var videoTexture;
var videoIsReady = false;
var isVideoTexture = 0;

var webcamIsOn = false;
var videoIsOn = false;


function getMetadataForWebcam() {

  if (webcamIsOn && videoStream.active) {
    console.log("videoStream is active");
    console.log("videoTrack = " + videoTrack);
    // do something with the stream
  }
  //videoTrack = videoStream.getTracks[0];

  videoImage.width = this.videoWidth;
  videoImage.height = this.videoHeight;

  isVideoTexture = 1;

  videoIsReady = true;
  webcamIsOn = true;
}

function getMetadataForVideo() {

  videoImage.width = this.videoWidth;
  videoImage.height = this.videoHeight;

  isVideoTexture = 0;

  videoIsReady = true;
  videoIsOn = true;
}


function turnOffVideo() {

    console.log("turning off video...");

    isVideoTexture = 0;

    video.pause();

    if (webcamIsOn == true) { // && videoStream != null) {
      videoStream.getVideoTracks()[0].stop();
   }

    if (videoIsOn == true) {
      //console.log("video.audioTracks " + video.audioTracks );
      
      //if (video.audioTracks.length == 1) {
      //   video.audioTracks()[0].stop();
     // }

         //video.getVideoTracks()[0].stop();
         //video.getAudioTracks()[0].stop();
    }

    webcamIsOn = false;
    videoIsOn = false;
}



function toggleVideoTexture(path) { //either will be a video file or 'webcam')

 
  if (path == "webcam") { //is the webcam

    if (webcamIsOn == true) {
      //turnOffVideo();
      console.log("webcam is already on!");
      return;
    }

    if (videoIsOn == true) {
      turnOffVideo();
    } 


    video = document.createElement('video');

    navigator.getUserMedia = navigator.getUserMedia 
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({
        video: true
      }, function (stream) {
        videoStream = stream;
        video.src = window.URL.createObjectURL(stream);
        video.onloadedmetadata = function(e) {
          video.play();
        };

      }, function (err) {
        alert('Request camera failed');
      });
    } else {
      alert('getUserMedia not supported');
    }

    videoImage = document.createElement('canvas');
    video.addEventListener("loadedmetadata", getMetadataForWebcam);


  } else { //is a video

    if (videoIsOn == true || webcamIsOn == true) {
      turnOffVideo();
    } 


    video = document.createElement('video'); //recreate this everytime?


    video.src = path; 
    //videoStream = null; //simplifies functionality w/webcam... (I think...)
    video.load(); // must call after setting/changing source
    video.play(); //may want to put this in the getMetadataForVideo func?

    videoImage = document.createElement('canvas');
    video.addEventListener("loadedmetadata", getMetadataForVideo);
  }

  videoImageContext = videoImage.getContext('2d');

  videoImageContext.fillStyle = '#000000';
  videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

  videoTexture = new THREE.Texture(videoImage);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  baseTexture = videoTexture;

}


//THREE.DataTexture = function ( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

function callMe() {
  setTimeout( function() {

    var i = Math.floor(Math.random() * ncsq);
    os[i] = (Math.random() * (Math.PI * 2));

    ms[i] = Math.random() * 0.5;

    console.log("here...");    

    // callMe();
  }, 250 );
}

var splashOn = true;
function removeSplash() {

   dat.GUI.toggleHide();

    baseTexture = genTexture;

    var image_x = document.getElementById('splash');
    image_x.parentNode.removeChild(image_x);

    var text1_x = document.getElementById('text1');
    text1_x.parentNode.removeChild(text1_x);

    /*
       var val = 0.0;
       for (var i = 0; i < ncsq; i++) {

    //set initial magnitude and orientation for cell
    os[i] = val + (Math.random() * (Math.PI));

    if (Math.random() > 0.8) {
    ms[i] = 0.6;

    } else {
    ms[i] = Math.random() * 0.2;
    }
    val = os[i];
    //os[i] = 0.0;
    //ms[i] = 0.0;
    }
    */

    splashOn = false;

    //callMe();
   
}

function loadHiResBWNoiseTexture() {
  if (videoIsOn || webcamIsOn) {
    turnOffVideo();
  }
  baseTexture = createBlackAndWhiteTexture(window.innerWidth, window.innerHeight);
}

function loadLoResBWNoiseTexture() {
  if (videoIsOn || webcamIsOn) {
    turnOffVideo();
  }
  baseTexture = createBlackAndWhiteTexture(Math.floor(window.innerWidth / 8) , Math.floor(window.innerHeight / 8));
}

function loadHiResRGBNoiseTexture() {
   if (videoIsOn || webcamIsOn) {
   turnOffVideo();
  }
  baseTexture = createRGBTexture(window.innerWidth, window.innerHeight);
}

function loadLoResRGBNoiseTexture() {
   if (videoIsOn || webcamIsOn) {
    turnOffVideo();
  }

  baseTexture = createRGBTexture(Math.floor(window.innerWidth / 8) , Math.floor(window.innerHeight / 8));
}


function init() {

  canvas = document.getElementById('canvas');
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  //stats = initStats();

  //load in our noise texture
  loader = new THREE.TextureLoader();

  splashTexture = loader.load('images/splash.jpg');
  genTexture = createRGBTexture(window.innerWidth * 1, window.innerHeight * 1);


  //genTexture = createRGBTexture(4096, 4096);
  //genTexture = createBlackAndWhiteTexture(window.innerWidth / 16, window.innerHeight / 16);
  //genTexture = createGrayscaleTexture(500,500);
  //genTexture = createPastelTexture(8,8);



  baseTexture = splashTexture;


  


  setTimeout( function(){
    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
    camera.position.z = 10;


    initializeFluidCells();



    var cameraFBO = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientWidth, 1, 1000);
    createFBO();//creating FBOs



    initializeDebugVectors(); //if you actually want to see the vectors

    document.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('touchstart', touchdown);
    document.addEventListener('touchend', touchdown);
    document.addEventListener('touchmove', touchdown);
    window.addEventListener( 'resize', onWindowResize, false );

    isInitialized = true;

  },500);
}

function onWindowResize() {
  renderer.setSize( window.innerWidth, window.innerHeight );
}


var needToUpdateGridSize = false;
var newCols;
var newRows;

function updateGridSize(cols, rows) {

  //remove exisiting debug geometry, then re-add new debug info based on correct grid size

  for (var i = 0; i < ncsq; i++) {
    scene.remove(lines[i]);
    scene.remove(linesL[i]);
    scene.remove(linesR[i]);
    scene.remove(g_pA[i]);
    scene.remove(g_pB[i]);
    scene.remove(g_pB_L[i]);
    scene.remove(g_pB_R[i]);

    //also call mesh.geometry.dispose(), mesh.material.dispose() and mesh.texture.dispose() 
  }

  console.log("removing lines: lines.length = " + lines.length);

  numCellsPerSide = cols; //right now cols and rows are equal
   
nc = numCellsPerSide + 1; //num vertices
ncsq = nc * nc;
csx = csy = (2.0 / nc);

  
 

 var bufferGeom = new THREE.PlaneBufferGeometry(2, 2, numCellsPerSide, numCellsPerSide);
  fillInUVs(bufferGeom);


  //Off screen mesh A

  console.log("meshA = " + meshA);
  
  meshA.geometry = bufferGeom;
  meshA.geometry.verticesNeedUpdate = true;
  
  meshB.geometry = bufferGeom;
  meshB.geometry.verticesNeedUpdate = true;

  initializeFluidCells();

 initializeDebugVectors();

 console.log("removing lines: lines.length = " + lines.length);
 

     
}

function fillInUVs(geom) {

  var orientation = new Float32Array( geom.attributes.uv.count * 1 );
  var magnitude = new Float32Array( geom.attributes.uv.count * 1 );

  for (var i = 0; i < geom.attributes.uv.count * 1; i++) {
    orientation[i] = 0.0;
    magnitude[i] = 0.0;
  }

  geom.addAttribute( 'orientation', new THREE.BufferAttribute( orientation, 1 ) );
  geom.addAttribute( 'magnitude', new THREE.BufferAttribute( magnitude, 1 ) );
}

function createFBO(){

  FBO_a = new THREE.Scene();
  FBO_b = new THREE.Scene();

  var filter = THREE.LinearFilter;
  var tw = window.innerWidth ;
  var th = window.innerHeight ;

  //Creating TextureA
  textureA = new THREE.WebGLRenderTarget(tw, th, {
    minFilter:filter,
           magFilter:filter,
           generateMipmaps:false,

  });

  //Creating TextureB
  textureB = new THREE.WebGLRenderTarget(tw, th, {
    minFilter:THREE.filter,
           magFilter:filter,
           generateMipmaps:false,
  });


  
  //Create Geometry for both FBO meshes
  var bufferGeom = new THREE.PlaneBufferGeometry(2, 2, numCellsPerSide, numCellsPerSide);
  fillInUVs(bufferGeom);


  //Off screen mesh A

  meshA = new THREE.Mesh(
      bufferGeom,
      new THREE.ShaderMaterial({
        uniforms: {
          origTex: {type: 't', value: baseTexture}, 
      inputTex: {type: 't', value: baseTexture}, 
      isVideoTexture: {type: 'i', value: isVideoTexture},
      blendVal: {type: 'f', value: blendVal},
      contrastVal: {type: 'f', value: contrastVal},
      brightnessVal:  {type: 'f', value: brightnessVal},
      saturateVal:  {type: 'f', value: saturateVal}

        },

      vertexShader: document.getElementById('vertex-shader_pp').textContent,
      fragmentShader: document.getElementById('fragment-shader_pp').textContent,
      depthWrite: false,
      depthTest: false,
      wireframe: false,
      })
      );

   //Off screen mesh B
  meshB = new THREE.Mesh(
      bufferGeom,
      new THREE.ShaderMaterial({
        uniforms: {
          origTex: {type: 't', value: baseTexture}, 
      inputTex: {type: 't', value: baseTexture},
      isVideoTexture: {type: 'i', value: isVideoTexture},

      blendVal: {type: 'f', value: blendVal},
      contrastVal: {type: 'f', value: contrastVal},
      brightnessVal:  {type: 'f', value: brightnessVal},
      saturateVal:  {type: 'f', value: saturateVal}


        },

      vertexShader: document.getElementById('vertex-shader_pp').textContent,
      fragmentShader: document.getElementById('fragment-shader_pp').textContent,
      depthWrite: false,
      depthTest: false,
      wireframe: false,
      })
  );

//meshA.geometry.dynamic = true;
//meshB.geometry.dynamic = true;

  FBO_a.add(meshA);
  FBO_b.add(meshB); 


  //create fullscreen mesh

  fullscreenQuadGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);

  var fullscreenMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tex0: {type: 't', value: baseTexture}
    },
      vertexShader: document.getElementById('drawTextureShader_vs').textContent,
      fragmentShader: document.getElementById('drawTextureShader_fs').textContent,
      transparent: false,
  });


  fullscreenQuadMesh = new THREE.Mesh(fullscreenQuadGeometry, fullscreenMaterial);

  scene.add(fullscreenQuadMesh);

  needToLoadFBOs = false;
  animate();
}


function animate() {

  requestAnimationFrame( animate );

  magVal = 0.25; //controls.Magnitude;
  contrastVal = controls.Contrast;
  saturateVal = controls.Saturate;
  brightnessVal = controls.Brightness;
  blendVal = controls.Blend;
  energyVal = controls.Energy;
  dissipationVal = controls.Fluidity;
  oM = 1.0 - (controls.Momentum * 2.0);
  oL = controls.Angularity;
  oR = -controls.Angularity;

  render();
}


function loadPresetFromArray(arr) {

  var params = arr["params"];

  controls.Blend = params[0];
  controls.Brightness = params[1];
  controls.Contrast = params[2];
  controls.Saturate = params[3];
  controls.Fluidity = params[4];
  controls.Momentum = params[5];
  controls.Angularity = params[6];
  controls.Energy = params[7];

  //check if this preset specifies if fluids are on or off
  if (arr.hasOwnProperty([ "fluids" ]) ) {
    fluidsOn = arr["fluids"]; 
  }

  //test
   if (arr.hasOwnProperty([ "grid" ]) ) {
    needToUpdateGridSize = true;
    newCols = arr["grid"][0];
    newRows = arr["grid"][1];

 }


  


}


var textPanel = document.getElementById('text1');
var isOverTextPanel = false;

textPanel.onmouseover = function () {
    isOverControls = true;
}

textPanel.onmouseout = function () {
    isOverControls = false;
}


//check to see if mouse is over the dat.gui interface, if so, then don't set a flag so that we don't update the fluid system
var dg = document.getElementsByClassName('dg')[0];
var isOverControls = false;

dg.onmouseover = function () {
    isOverControls = true;
}

dg.onmouseout = function () {
    isOverControls = false;

}

var controls = new function () {
  this.Blend = 0.0001;
  this.Contrast = 0.0001;
  this.Brightness = 0.0001; 
  this.Saturate = 0.0001;
  this.Fluidity = 0.0001;
  this.Energy = 0.0001;
  this.Momentum = 0.0001;
  this.Angularity = 0.0001;
  
};


//wha?
var presetsFolder = gui.addFolder('PRESETS');


for(name in presets) {
  console.log("preset name = " + name);
  var t =  {
    vals : presets[name],
    //[ '' + ( () => name)() ] : 
    [name] :
      function() {
        loadPresetFromArray(this.vals);
      }
  };

  presetsFolder.add(t, ''+name);
}



var paramsFolder = gui.addFolder('PARAMETERS');





paramsFolder.add(controls, 'Blend', 0.5000, 0.9999).step(0.0001).listen();
paramsFolder.add(controls, 'Brightness', 0.9500, 1.150).step(0.0001).listen();
paramsFolder.add(controls, 'Contrast', 0.9500, 1.20).step(0.0001).listen();
paramsFolder.add(controls, 'Saturate', 0.8000, 1.2000).step(0.0001).listen();

paramsFolder.add(controls, 'Fluidity', 0.9500, 1.001).step(0.0001).listen();
paramsFolder.add(controls, 'Momentum', 0.001, 0.5).step(0.0001).listen();
paramsFolder.add(controls, 'Angularity', 0.00, Math.PI/2.0).step(0.0001).listen();
paramsFolder.add(controls, 'Energy', 0.01, 0.99).step(0.0001).listen();



var toggleFluids = { 'Toggle Fluids':function() {fluidsOn = !fluidsOn} };
paramsFolder.add(toggleFluids,'Toggle Fluids');

var toggleDebug = { 'Toggle Debug':function() {debugOn = !debugOn} };
paramsFolder.add(toggleDebug,'Toggle Debug');



//gui.add(controls, 'Presets', [ 'Jupiters Moons', 'La Brea', 'Cubism', 'Ice Cracks' ] );

var libraryFolder = gui.addFolder('TEXTURE');


var toggleWebcamText = { 'Use Webcam':function() {toggleVideoTexture("webcam");} };

libraryFolder.add(toggleWebcamText,'Use Webcam');


var loadImageFunc = { 'Load Image' : function() { 
           document.getElementById("myInput").click();
          //var selectedFile = document.getElementById('input').files[0];
           
          //console.log("file = " + selectedFile);
    } };

libraryFolder.add(loadImageFunc, 'Load Image');



var loadVideoFunc = { 'Load Video' : function() {
            console.log("clicking loadVideo..."); 
           document.getElementById("myInput").click();
    } };

libraryFolder.add(loadVideoFunc, 'Load Video');



var hiResBW_Text = { 'Hi-Res Black & White Noise':loadHiResBWNoiseTexture };
libraryFolder.add(hiResBW_Text,'Hi-Res Black & White Noise');

var hiResRGB_Text = { 'Hi-Res RGB Noise':loadHiResRGBNoiseTexture };
libraryFolder.add(hiResRGB_Text,'Hi-Res RGB Noise');


var loResBW_Text = { 'Lo-Res Black & White Noise':loadLoResBWNoiseTexture };
libraryFolder.add(loResBW_Text,'Lo-Res Black & White Noise');

var loResRGB_Text = { 'Lo-Res RGB Noise':loadLoResRGBNoiseTexture };
libraryFolder.add(loResRGB_Text,'Lo-Res RGB Noise');



//loadPresetFromArray(presets["Ice Cracks"]);
loadPresetFromArray(presets["Jupiter\'s Moons"]);

//dat.GUI.close()
dat.GUI.toggleHide();


function checkURL(input, filetypes) {
  var extension = input.name.split('.').pop().toLowerCase();  //file extension from input file

  console.log("extension = " + extension);

  var isSuccess = filetypes.indexOf(extension) > -1;  //is extension in acceptable types

  if (isSuccess) {
    return true;
  }

  return false;
}



function handleFiles(files) {

  console.log("file name = " + files[0].name);

  var objectURL;

  var filesImage = ['jpg', 'jpeg', 'png'];
  var filesVideo = ['mov', 'mp4', 'mpeg', 'avi', 'ogv'];

  if (checkURL(files[0], filesImage)) {

    if (webcamIsOn || videoIsOn) {
      turnOffVideo();
    }

    objectURL = window.URL.createObjectURL(files[0]);
    baseTexture = loader.load(objectURL);

  } else if (checkURL(files[0], filesVideo)) {

    objectURL = window.URL.createObjectURL(files[0]);
    toggleVideoTexture(objectURL);

  } else {
    console.log("can't load " + files[0].name);
  }

  document.getElementById('myInput').value = "";
  
} 


function render() {

  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }

  if (currentMouseIdx >= 0) {
    if (isPressing == true) {
      ms[currentMouseIdx] = magVal;
    }

    if (isDragging == true) {
      os[currentMouseIdx] = currentMouseTheta;
    }
  }

  //console.log(controls.Magnitude);
  stats.update();


  if (isInitialized == false) {
    console.log("not initialized!"); 
    return;
  }  

  //only if using a video texture...
  if (videoIsReady == true) {
    videoImageContext.drawImage(video, 0, 0);

    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  }



  if (fluidsOn) {
    updateFluidVectors(); //updates the fluid vectors...
  }

  //swap fbos...
  if (flag == 0) { //i.e. render to FBO_A's texture

    updateGeometry(meshA);
    updateShaders(meshA);

    meshA.material.uniforms.origTex.value = baseTexture;
    meshA.material.uniforms.inputTex.value = textureB;
    renderer.render(FBO_a, camera, textureA); 
    fullscreenQuadMesh.material.uniforms.tex0.value = textureA;

  } else {

    updateGeometry(meshB);
    updateShaders(meshB);

    meshB.material.uniforms.origTex.value = baseTexture;
    meshB.material.uniforms.inputTex.value = textureA;
    renderer.render(FBO_b, camera, textureB); 
    fullscreenQuadMesh.material.uniforms.tex0.value = textureB;
  }

  flag = Math.abs(1-flag);


  dissipateEnergyForAllVertices();

  for (var i = 0; i < lines.length; i++) {
    lines[i].visible = debugOn;
    linesL[i].visible = debugOn;
    linesR[i].visible = debugOn;
    g_pA[i].visible = debugOn;
    g_pB[i].visible = debugOn;
    g_pB_L[i].visible = debugOn;
    g_pB_R[i].visible = debugOn;
  }


  renderer.render(scene, camera);


  if (needToUpdateGridSize == true) {
    updateGridSize(newCols, newRows);
    needToUpdateGridSize = false;
  }



}



function getVertexFromColRow(col, row, numVertsPerSide) {
  return (row * numVertsPerSide + col);
}



var px = 0;
var py = 0;
var firstClick = true;
var magVal = 0.01;

function mouseup(event){

    //  event.preventDefault();


  if (!isOverControls) {
    isPressing = false;
    isDragging = false;
    currentMouseIdx = -1;
 
    //alert("mouseup : px / py" + px + " / " + py);
 

  }

}



function touchdown(evt){
   
    //evt.preventDefault();

    if (splashOn && !isOverControls) {
      removeSplash();
    }


    var reaction_type = null;
    var touch = null;

    switch (evt.type) 
    {
      case "touchstart": 
        touch = evt.changedTouches[0]; //... specify which touch for later extraction of XY position values.
        reaction_type = "onclick"; 
        break;
      case "touchmove": // I don't use this
        reaction_type = "mousemove";
        touch = evt.changedTouches[0];
        break;
      case "touchend":  // I don't use this     
        reaction_type = "mouseup";
        touch = evt.changedTouches[0];
        break;
    }

    if (reaction_type == "onclick")
    {
      px =   touch.clientX;
      py =   touch.clientY; 

      var cellSize = 1.0 / numCellsPerSide;

      var col = Math.round((px / window.innerWidth) / cellSize);
      var row = Math.round((py / window.innerHeight) / cellSize);

      currentMouseIdx  = getVertexFromColRow(col, row, numCellsPerSide+1);

      isPressing = true;
    
    } else if (reaction_type == "mousemove") {

   
      var cellSize = 1.0 / numCellsPerSide;

      var col = Math.round((touch.clientX / window.innerWidth) / cellSize);
      var row = Math.round((touch.clientY /window.innerHeight) / cellSize);

      currentMouseIdx = getVertexFromColRow(col, row, numCellsPerSide+1);

      currentMouseTheta = Math.atan2(-(py - touch.clientY), px - touch.clientX);

      px =   touch.clientX;
      py =   touch.clientY; 

      isDragging = true;

    
    } else if ( reaction_type == "mouseup" )  {

      isPressing = false;
      isDragging = false;
      currentMouseIdx = -1;
    }


    /*

       if (!isOverControls) {

       if (firstClick == true) {
       firstClick = false;
       px = event.clientX;
       py = event.clientY;
       }

       var cellSize = 1.0 / numCellsPerSide;

       var col = Math.round((event.clientX / window.innerWidth) / cellSize);
       var row = Math.round((event.clientY /window.innerHeight) / cellSize);

       currentMouseIdx  = getVertexFromColRow(col, row, numCellsPerSide+1);


       px = event.clientX;
       py = event.clientY;


//console.log("px / py" + px + " / " + py);




isPressing = true;

// alert("mousedown : px / py" + px + " / " + py);


}
*/

}


function blockMove() {
      event.preventDefault() ;
}




function mousedown(event){


  if (splashOn && !isOverControls) {
    removeSplash();
  }


  if (!isOverControls) {

    if (firstClick == true) {
      firstClick = false;
      px = event.clientX;
      py = event.clientY;
    }

    var cellSize = 1.0 / numCellsPerSide;

    var col = Math.round((event.clientX / window.innerWidth) / cellSize);
    var row = Math.round((event.clientY /window.innerHeight) / cellSize);

    currentMouseIdx  = getVertexFromColRow(col, row, numCellsPerSide+1);


    px = event.clientX;
    py = event.clientY;


    //console.log("px / py" + px + " / " + py);




    isPressing = true;

    // alert("mousedown : px / py" + px + " / " + py);


  }

}


function mousemove(event){
  //event.preventDefault();



  if (!isOverControls) {

    if (firstClick == true) {
      firstClick = false;
      px = event.clientX;
      py = event.clientY;
    }


    var cellSize = 1.0 / numCellsPerSide;

    var col = Math.round((event.clientX / window.innerWidth) / cellSize);
    var row = Math.round((event.clientY /window.innerHeight) / cellSize);

    currentMouseIdx = getVertexFromColRow(col, row, numCellsPerSide+1);

    currentMouseTheta = Math.atan2(-(py - event.clientY), px - event.clientX);


    isDragging = true;

    px = event.clientX;
    py = event.clientY;

 }
}

function dissipateEnergyForAllVertices() {


  //console.log("num verts = " + meshA.geometry.attributes.magnitude.array.length);


  for (var i = 0; i < ncsq; i++) {
    ms[i] *= dissipationVal;
  }

  /*
     for (var i = 0; i < meshA.geometry.attributes.magnitude.array.length; i++) {
     meshA.geometry.attributes.magnitude.array[i] *= dissipationVal;
     meshB.geometry.attributes.magnitude.array[i] *= dissipationVal;



     if (meshA.geometry.attributes.magnitude.array[i] < 0.00001) {
     meshA.geometry.attributes.magnitude.array[i] = 0.0;
     meshB.geometry.attributes.magnitude.array[i] = 0.0;

     }

//console.log("vert: " +  i + ", mag = " + meshA.geometry.attributes.magnitude.array[i]);

}

meshA.geometry.attributes.magnitude.needsUpdate = true;
meshB.geometry.attributes.magnitude.needsUpdate = true;
*/



}




function initStats() {

  stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.getElementById("Stats-output").appendChild(stats.domElement);

  return stats;
}




function intersectRects(pa, pb, w, h, couldWrapLeft, couldWrapRight, couldWrapUp, couldWrapDown) {

  var perc = 0.0;

  var ax = pa.x - w/2.0;
  var bx = pb.x - w/2.0;

  var ay = pa.y - h/2.0;
  var by = pb.y - h/2.0;

  if (couldWrapRight && ax + w > 1.0) {
    ax -= 2.0;
  } else if (couldWrapLeft && ax < -1.0) {
    ax += 2.0;
  }

  if (couldWrapUp && ay + h > 1.0) {
    ay -= 2.0;
  } else if (couldWrapDown && ay < -1.0) {
    ay += 2.0;
  }


  var x = Math.max(ax, bx);
  var num1 = Math.min(ax + w, bx + w);

  var y = Math.max(ay, by);
  var num2 = Math.min(ay + h, by + h);

  if (num1 >= x && num2 >= y) {
    //they intersect! by how much?

    var nw = num1 - x;
    var nh = num2 - y;

    var narea = nw * nh;
    var oarea = w * h;

    perc = narea / oarea;
  }

  return perc;

}


function mod(val, modulus) {
  return ((val%modulus)+modulus)%modulus;
}

//gets the index of all 8 neighbors plus myself = 9 indexes
function getNeighbors(idx) {

  var c = idx % nc;
  var r = Math.floor(idx / nc);

  var ns = new Array(9);

  ns[0] = (mod(r-1, nc) * nc) + mod(c-1, nc);
  ns[1] = (mod(r-1, nc) * nc) + c;
  ns[2] = (mod(r-1, nc) * nc) + mod(c+1, nc);

  ns[3] = (mod(r, nc) * nc) + mod(c-1, nc);
  ns[4] = idx;
  ns[5] = (mod(r, nc) * nc) + mod(c+1, nc);

  ns[6] = (mod(r+1, nc) * nc) + mod(c-1, nc);
  ns[7] = (mod(r+1, nc) * nc) + c;
  ns[8] = (mod(r+1, nc) * nc) + mod(c+1, nc);

  return ns;

}


function addUpIntersections(magnitudeOffset, orientationOffset) {

  for (var i = 0; i < ncsq; i++) {

    var uM = ms[i] * magnitudeOffset;
    var uO = os[i] + orientationOffset;

    //calculate the "ghost rectangle" for intersections
    ptsB[i].x = ptsA[i].x - ( (uM * csx) * Math.cos(uO) );
    ptsB[i].y = ptsA[i].y - ( (uM * csy) * Math.sin(uO) );

    if (ms[i] == 0.0) { continue; }


    //displacement rect is centered around ptsB[i]

    var p, nv;

    var allNineNeighbors = getNeighbors(i);

    for (var ii = 0; ii < 9; ii++) {

      var ni = allNineNeighbors[ii];

      var couldWrapLeft = false;
      var couldWrapRight = false;
      var couldWrapUp = false;
      var couldWrapDown = false;

      if (ii == 0 || ii == 3 || ii == 6) {
        couldWrapLeft = true;
        //couldWrapRight = true;

      } else if (ii == 2 || ii == 5 || ii == 8) {
        couldWrapRight = true;
        //couldWrapLeft = true;
      } 

      if (ii == 6 || ii == 7 || ii == 8) {
        couldWrapDown = true;
      } else if (ii == 0 || ii == 1 || ii == 2) {
        couldWrapUp = true;
      }

      //console.log("about to intersect " + i + " and " + ni);
      p = intersectRects(ptsB[i], ptsA[ni], csx, csy, couldWrapLeft, couldWrapRight, couldWrapUp, couldWrapDown ); //ix = cell width, iy = cell height

      if (p > 0.0) {
        //console.log("n index for " + ii + "th neighbor of index " + i + " = " );
        //console.log("ni = " + ni);

        var newMag = uM * p;



        nv = new THREE.Vector2( newMag * Math.cos(uO), newMag * Math.sin(uO) ) ;

        //console.log("nv at index " + i + " intersects neighbor at index " + ni + " = " + p + "%" + ", mag added to cell = " + newMag );
        tmpHolder[ni].push( nv  ) ;
      }

    }
  }
}


function shortestDistanceBetweenRadians(rad1, rad2) {
  var mm1 = mod((rad2 - rad1), Math.PI * 2);
  var mm2 = mod(mm1 + (Math.PI * 3), Math.PI * 2);
  var dist = mm2 - Math.PI;

  //console.log("shortest distance between " + rad1 + " and " + rad2 + " is: " + dist);
  return dist; 
}

function updateFluidVectors() {


  //for each point... get displacement rect
  //  then check intersections with itself and 8 nieghbs

  //console.log("\n oM = " + oM + " fM = " + (1.0 - oM) + "**********\n");
  //console.log("total momentum perc = " + ((oM) + (1.0 - oM)   ) );

  addUpIntersections(1.0 - oM , 0.0); //forward
  addUpIntersections(oM/2.0, oL); //left
  addUpIntersections(oM/2.0, oR); //right






  //now we have all vectors from neighbors that intersected with each cell.
  //so... we want to add up these input vectors...
  //and then replace the current vector in each cell 
  //and then reset tmpHolder


  for (var i = 0; i < ncsq; i++) {

    var nm = 0.0;
    //var no = 0.0;
    var no = os[i]; //current orientation of cell

    for (var ii = 0; ii < tmpHolder[i].length; ii++) {

      var cm = tmpHolder[i][ii].length();
      var co = tmpHolder[i][ii].angle();

      var scaleWeight ;
      if (cm > nm || nm == 0.0) { 
        scaleWeight = 1.0; 
      } else {
        scaleWeight = cm / nm;
      }

      no += shortestDistanceBetweenRadians(no, co) * scaleWeight;
      /*
         var adiff = Math.abs(no - co);

      //console.log("\n****\nindex " + i + ", adding in vec #" + ii);
      //console.log("no = " + no + ", co = " + co + ", adiff = " + adiff);


      var uo;

      //AGF - check this logic...

      //console.log("adiff = " + adiff);
      if (cm > nm) {
      //console.log("cm (" + cm + ") > nm (" + nm + ")");
      uo = co - ((nm / cm) * 0.5 * adiff);

      } else {
      //console.log("nm (" + nm + ") > cm (" + cm + ")");
      uo = no + ((cm / nm) * 0.5 * adiff);
      }    

      no = uo;
      */

      nm += cm;    

      //console.log("no = " + no + " with mag = " + nm);
    }


    ms[i] = nm; 
    os[i] = mod(no, Math.PI * 2.0); 

    //  ptsB[i].x = ptsA[i].x + ( (ms[i] * (csx*scaleVal)) * Math.cos(os[i]));
    //  ptsB[i].y = ptsA[i].y + ( (ms[i] * (csy*scaleVal)) * Math.sin(os[i]));

    tmpHolder[i] = []; //clear the tmpHolder for this cell...

  }


  //sanity check: make sure total energy adds up to 1.0 - just for debugging
  var totalMag = 0.0;
  for (var i = 0; i < ncsq; i++) {
    totalMag += ms[i];
  }


  //console.log("totalMag = " + totalMag);




}


function switchBetweenMeshAndFluidGrid( idx) {

  return ( ((nc - 1) - Math.floor(idx/nc)) * nc ) + idx%nc;

}
function updateShaders(mesh) {

  mesh.material.uniforms.isVideoTexture.value = isVideoTexture;
  mesh.material.uniforms.blendVal.value = blendVal;
  mesh.material.uniforms.contrastVal.value = contrastVal;
  mesh.material.uniforms.brightnessVal.value = brightnessVal;
  mesh.material.uniforms.saturateVal.value = saturateVal;
}

function updateGeometry(mesh) {


  for (var i = 0; i < ncsq; i++) {

    ptsB[i].x = ptsA[i].x - ( (ms[i] * (csx*scaleVal)) * Math.cos(os[i]));
    ptsB[i].y = ptsA[i].y - ( (ms[i] * (csy*scaleVal)) * Math.sin(os[i]));

    ptsB_L[i].x = ptsA[i].x - ( (ms[i] * oM * (csx*scaleVal)) * Math.cos(os[i] + oL));
    ptsB_L[i].y = ptsA[i].y - ( (ms[i] * oM * (csy*scaleVal)) * Math.sin(os[i] + oL));

    ptsB_R[i].x = ptsA[i].x - ( (ms[i] * oM * (csx*scaleVal)) * Math.cos(os[i] + oR));
    ptsB_R[i].y = ptsA[i].y - ( (ms[i] * oM * (csy*scaleVal)) * Math.sin(os[i] + oR));



    var nm = ms[i] * energyVal;
    var no = os[i];

    //var si = switchBetweenMeshAndFluidGrid(i);
    var si = i;

    //  console.log("idx was " + i + ", now is " + si);

    mesh.geometry.attributes.orientation.array[si] = no; //theta;
    mesh.geometry.attributes.magnitude.array[si] = nm; //mag;
    mesh.geometry.attributes.orientation.needsUpdate = true;
    mesh.geometry.attributes.magnitude.needsUpdate = true;


    lines[i].geometry.vertices[1].x = ptsB[i].x;
    lines[i].geometry.vertices[1].y = ptsB[i].y;
    lines[i].geometry.verticesNeedUpdate = true;

    linesL[i].geometry.vertices[1].x = ptsB_L[i].x;
    linesL[i].geometry.vertices[1].y = ptsB_L[i].y;
    linesL[i].geometry.verticesNeedUpdate = true;

    linesR[i].geometry.vertices[1].x = ptsB_R[i].x;
    linesR[i].geometry.vertices[1].y = ptsB_R[i].y;
    linesR[i].geometry.verticesNeedUpdate = true;


    g_pB[i].geometry.vertices[0].x = ptsB[i].x;
    g_pB[i].geometry.vertices[0].y = ptsB[i].y;
    g_pB[i].geometry.verticesNeedUpdate = true;

    g_pB_L[i].geometry.vertices[0].x = ptsB_L[i].x;
    g_pB_L[i].geometry.vertices[0].y = ptsB_L[i].y;
    g_pB_L[i].geometry.verticesNeedUpdate = true;

    g_pB_R[i].geometry.vertices[0].x = ptsB_R[i].x;
    g_pB_R[i].geometry.vertices[0].y = ptsB_R[i].y;
    g_pB_R[i].geometry.verticesNeedUpdate = true;



  }

}




