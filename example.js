/* jshint undef: true, esnext: true */
/* global D4, D5, I2C1, console, LIS3DH */

// Set up I2C for sda on pin 4 and scl on pin 5
I2C1.setup({sda: D4, scl: D5});

// this is not working as the module is not available yet.
//var lis3dh = require('LIS3DH').connect(I2C1, 0x18);

var lis3dh = new LIS3DH(I2C1, 0x18);
lis3dh.begin();

// Accelerometer ID
console.log('Chip ID: ' + lis3dh.whoami()); // Should display 51.
console.log('Data: ' + lis3dh.read()); // Should display [x, y,z] values.
