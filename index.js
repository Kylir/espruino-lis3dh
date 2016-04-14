/* jshint undef: true, esnext: true */
/* global D4, D5, I2C1, console, setTimeout */

function LIS3DH (TheI2c, TheAddr) {

    this.i2c = TheI2c;
    this.addr = TheAddr || LIS3DH_DEFAULT_ADDRESS;

    // port of the Adafruit cpp functions.

    // sets the value of one register.
    this.writeRegister8 = function (register, value) {
        this.i2c.writeTo(this.addr, [register, value] );
    };

    this.readRegister8 = function (register) {
        return this.i2c.readFrom(this.addr, 1);
    };

    this.setDataRate = function (dataRate) {
        var ctl1 = this.readRegister8(LIS3DH_REG.CTRL1);
        ctl1 &= ~(0xF0); // mask off bits
        ctl1 |= (dataRate << 4);
        this.writeRegister8(LIS3DH_REG.CTRL1, ctl1);
    };

    // retrieve the accelerometer ID
    this.whoami = function () {
        this.i2c.writeTo(this.addr, LIS3DH_REG.WHOAMI);
        return this.i2c.readFrom(this.addr, 1)[0];
    };

    // Set the chip modes: 
    this.begin = function () {
        // enable all axes, normal mode and 400Hz refresh rate
        this.writeRegister8(LIS3DH_REG.CTRL1, 0x77); //0000 0111
        // CTRL2 - Everything at 0
        //this.writeRegister8(LIS3DH_REG.CTRL2, 0x00);
        
        // No interrupt (is set to 0x10 in Adafruit tuto...)
        //this.writeRegister8(LIS3DH_REG.CTRL3, 0x00);
        
        // Block Data Update: continuous, LSB at lower address, 2G, High res
        this.writeRegister8(LIS3DH_REG.CTRL4, 0x88); //1000 1000
        
        // enable adcs? not now.
        //this.writeRegister8(LIS3DH_REG.TEMPCFG, 0x00);
    };

    this.read = function () {

        var readings;

        this.i2c.writeTo(this.addr, LIS3DH_REG.OUT_X_L | 0x80 ); //1000 0000 | 
        readings = this.i2c.readFrom(this.addr, 6);
        
        var x = (((readings[1] & 0xff) << 8) | (readings[0] & 0xff));
        if (x >= 0x8000) {
            x = -(0x10000 - x);
        }
        var y = (((readings[3] & 0xff) << 8) | (readings[2] & 0xff));
        if (y >= 0x8000) {
            y = -(0x10000 - y);
        }
        var z = (((readings[5] & 0xff) << 8) | (readings[4] & 0xff));
        if (z >= 0x8000) {
            z = -(0x10000 - z);
        }

        return [x, y, z];   
        
    };

    var LIS3DH_DEFAULT_ADDRESS = 0x18;

    // Registers
    var LIS3DH_REG = {
        'STATUS1': 0x07,
        'OUTADC1_L': 0x08,
        'OUTADC1_H': 0x09,
        'OUTADC2_L': 0x0A,
        'OUTADC2_H': 0x0B,
        'OUTADC3_L': 0x0C,
        'OUTADC3_H': 0x0D,
        'INTCOUNT': 0x0E,
        'WHOAMI': 0x0F,
        'TEMPCFG': 0x1F,
        'CTRL1': 0x20,
        'CTRL2': 0x21,
        'CTRL3': 0x22,
        'CTRL4': 0x23,
        'CTRL5': 0x24,
        'CTRL6': 0x25,
        'REFERENCE': 0x26,
        'STATUS2': 0x27,
        'OUT_X_L': 0x28,
        'OUT_X_H': 0x29,
        'OUT_Y_L': 0x2A,
        'OUT_Y_H': 0x2B,
        'OUT_Z_L': 0x2C,
        'OUT_Z_H': 0x2D,
        'FIFOCTRL': 0x2E,
        'FIFOSRC': 0x2F,
        'INT1CFG': 0x30,
        'INT1SRC': 0x31,
        'INT1THS': 0x32,
        'INT1DUR': 0x33,
        'CLICKCFG': 0x38,
        'CLICKSRC': 0x39,
        'CLICKTHS': 0x3A,
        'TIMELIMIT': 0x3B,
        'TIMELATENCY': 0x3C,
        'TIMEWINDOW': 0x3D
    };

    // Ranges
    var LIS3DH_RANGE = {
        '16_G': 0b11,
        '8_G': 0b10,
        '4_G': 0b01,
        '2_G': 0b00
    };

    // Axis
    var LIS3DH_AXIS = {
        'X': 0x0,
        'Y': 0x1,
        'Z': 0x2
    };

    // Data rate
    var LIS3DH_DATARATE = {
        '400_HZ': 0b0111,
        '200_HZ': 0b0110,
        '100_HZ': 0b0101,
        '50_HZ': 0b0100,
        '25_HZ': 0b0011,
        '10_HZ': 0b0010,
        '1_HZ': 0b0001,
        'POWERDOWN': 0,
        'LOWPOWER_1K6HZ': 0b1000,
        'LOWPOWER_5KHZ': 0b1001
    };

}

I2C1.setup({sda: D4, scl: D5});

var accel = new LIS3DH(I2C1, 0x18);
accel.begin();

// Accelerometer ID
console.log('Chip ID: ' + accel.whoami()); // Should display 51.

accel.read();

