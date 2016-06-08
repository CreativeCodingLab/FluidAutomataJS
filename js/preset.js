/*
  0 - Blend
  1 - Brightness
  2 - Contrast
  3 - Saturation
  4 - Fluidity
  5 - Momentum
  6 - Angularity
  7 - Energy
*/



var presets = {
   


  "Jupiter\'s Moons":
  {
    "params": [0.93, 1.0, 1.03, 1.04, 0.95, 0.45, Math.PI / 2.0, 0.5],
    "fluids": true,
    "grid": [16,16],
  },

  "Ice Cracks":
  {
    "params": [0.824063, 1.079861, 1.100694, 0.975694, 1.0, 0.0001, 0.0001, 0.25],
    "fluids": false,
    "grid": [14,14]
  },

  "Milky Way":
  {
    "params": [0.795382, 1.107639, 1.165, 0.718750, 0.9999, 0.158, Math.PI / 4.0, 0.05],
    "fluids": true,
    "grid": [18,18]
  },

  "La Brea":
  {
    "params": [0.82, 1.12, 1.173194, 0.5, 0.96, 0.4, Math.PI / 4.0, 0.15],
    "fluids": true,
  },

  "Cubism":
  {
    "params": [0.785139, 1.069441, 1.163194, 1.034722, 0.99, 0.0, 0.0001, 0.5],
  },

   "Sepia":
  {
    "params": [0.8495, 1.0798, 1.1006, 0.8, 1, 0.0001, 0.0001, 0.3],
    "fluids": false,
    "grid": [10,10],
  },

  "Watercolors":
  {
    "params": [0.824063, 1.079861, 1.100694, 1.040000, 0.985, 0.26, 1.18, 0.2],
    "fluids": true,
  },

  "Kaleidoscope":
  {"params": [0.803576,1.079861, 1.121528, 0.93, 0.99, 0.452361, Math.PI/4.0, 0.218] },

  //Stained Glass
  //Lo-res colored noise texture, 8x8 grid, fluids off
  //"Stained Glass":
  //  [0.817917, 1.047367, 1.100694, 1.024306, 0.99, 0.0, 0.785398, 0.07],

  "Rainbow Drop":
  {
    "params": [0.817917, 1.047367, 1.100694, 1.024306, 0.99, 0.0, 0.785398, 0.07],
    "fluids": true,
  },

  "Infrared":
  {"params": [0.709340, 1.010417, 1.163194, 1.218750, 0.99, 0.25, 1.5, 0.15] },

  "Planetary":
  {
    "params": [0.7925, 1.0799, 1.1288, 1.0168, 1.0, 0.0001, 0.0001, 0.3] ,
    "grid": [6,6]
  },


  "Magic Marker":
  {"params": [0.81, 1.0799, 1.1207, 1.0688, 0.97, 0.0001, 0.0001, 0.3] },

};

//var numPresets = Object.keys(presets).length;


