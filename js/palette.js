
function createTexture(data, tw, th) {
    var texture = new THREE.DataTexture(data, tw, th, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter, 0, THREE.LinearEncoding);
      
    //THREE.NearestFilter looks intersting too
    
    texture.needsUpdate = true;

    return texture;
}

function createRGBTexture(tw, th) {

  var data = new Uint8Array(tw * th * 4);

  for (var count = 0; count < data.length; count+= 4) {
    data[count+0] = Math.floor(Math.random() * 255);
    data[count+1] = Math.floor(Math.random() * 255);
    data[count+2] = Math.floor(Math.random() * 255);
    data[count+3] = 255;
  }

  return createTexture(data, tw, th);
}

function createBlackAndWhiteTexture(tw, th) {

  var data = new Uint8Array(tw * th * 4);

  for (var count = 0; count < data.length; count+= 4) {
    if (Math.random() > 0.5) {
      data[count+0] = data[count+1] = data[count+2] = 255;
    } else {
      data[count+0] = data[count+1] = data[count+2] = 0;
    }
    data[count+3] = 255;
  }

  return createTexture(data, tw, th);
}

function createGrayscaleTexture(tw, th) {

  var data = new Uint8Array(tw * th * 4);

  for (var count = 0; count < data.length; count+= 4) {
    var gray = Math.random() * 255;
    data[count+0] = data[count+1] = data[count+2] = gray;
    data[count+3] = 255;
  }

  return createTexture(data, tw, th);
}


function createPastelTexture(tw, th) {

  var data = new Uint8Array(tw * th * 4);

  for (var count = 0; count < data.length; count+= 4) {
    data[count+0] = 64 + Math.floor(Math.random() * 128);
    data[count+1] = 64 + Math.floor(Math.random() * 128);
    data[count+2] = 64 + Math.floor(Math.random() * 128);
    data[count+3] = 255;
  }

  return createTexture(data, tw, th);
}


