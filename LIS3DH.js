/* jshint undef: true, esnext: true */
/* global exports */

/**
 * Constructor of the LISDH module.
 * 
 * @param i2c The I2C object to communicate with the chip.
 * @param addr the address of the I2C component.
 */
function LIS3DH (i2c, addr) {

    this.LIS3DH_DEFAULT_ADDRESS = 0x18;

    // Registers
    this.LIS3DH_REG = {
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
    this.LIS3DH_RANGE = {
        '16_G': 0b11,
        '8_G': 0b10,
        '4_G': 0b01,
        '2_G': 0b00
    };

    // Axis
    this.LIS3DH_AXIS = {
        'X': 0x0,
        'Y': 0x1,
        'Z': 0x2
    };

    // Data rate
    this.LIS3DH_DATARATE = {
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

    // Instantiate the variables
    this.i2c = i2c;
    this.addr = addr || this.LIS3DH_DEFAULT_ADDRESS;

}
// port of the Adafruit cpp functions.

/**
 * Low level function to write 8 bytes in a registry.
 * 
 * @param register
 * @param value
 */
LIS3DH.prototype.writeRegister8 = function (register, value) {
    this.i2c.writeTo(this.addr, [register, value] );
};

/**
 * Low level function to reads one byte.
 * 
 * @return value of the byte
 */
LIS3DH.prototype.readRegister8 = function () {
    return this.i2c.readFrom(this.addr, 1);
};

/**
 * Set the data rate by updating CTRL1 registry.
 * 
 * @param dataRate the new value of the data rate (see LIS3DH_DATARATE.)
 */
LIS3DH.prototype.setDataRate = function (dataRate) {
    var ctl1 = this.readRegister8(this.LIS3DH_REG.CTRL1);
    ctl1 &= ~(0xF0); // mask off bits
    ctl1 |= (dataRate << 4);
    this.writeRegister8(this.LIS3DH_REG.CTRL1, ctl1);
};


/**
 * Retrieve the accelerometer ID and return it.
 * The LIS3DH ID should be 51 (in decimal)
 * 
 * @return {integer} 
 */
LIS3DH.prototype.whoami = function () {
    this.i2c.writeTo(this.addr, this.LIS3DH_REG.WHOAMI);
    return this.i2c.readFrom(this.addr, 1)[0];
};

/**
 * Set the control register of the chip.
 * - Normal reading mode
 * - All 3 axis enabled
 * - 400 Hz refresh rate
 * - Continuous reading
 * - LSB at lower address
 * - 2G sensibility
 * - High resolution
 * - No interruption
 *
 * This function is called when using the connect function.
 * 
 */
LIS3DH.prototype.begin = function () {
    // enable all axes, normal mode and 400Hz refresh rate
    this.writeRegister8(this.LIS3DH_REG.CTRL1, 0x77);
    // Block Data Update: continuous, LSB at lower address, 2G, High res
    this.writeRegister8(this.LIS3DH_REG.CTRL4, 0x88);
};

/**
 * Read sequentially the 3 axis acceleration values.
 * Each value is an signed 16 bits integer.
 * 
 * @return [x, y, z] the array of the three acceleration values.
 */
LIS3DH.prototype.read = function () {

    var readings,
        x,y,z;

    this.i2c.writeTo(this.addr, this.LIS3DH_REG.OUT_X_L | 0x80 ); //1000 0000 | 
    readings = this.i2c.readFrom(this.addr, 6);
    
    try {
        x = twoBytesToInt(readings[0], readings[1]);
        y = twoBytesToInt(readings[2], readings[3]);
        z = twoBytesToInt(readings[4], readings[5]);
    } catch (err) {
        throw new Error('Error while reading acceleration data: ' + err.message);
    }

    return [x, y, z];
    
};


exports.connect = function ( i2c, i2cAddress ) {
    var accel = new LIS3DH( i2c, i2cAddress );
    accel.begin();
    return accel;
};

/**
 * Utility function to compute the value of a signed 16 bits integer
 * given the two bytes.
 * The first parameter is the least significant byte.
 * 
 * @param byte1 The value of the least significant byte
 * @param byte2 The value of the most significant byte
 * @return the value of the signed 16 bits integer
 */
function twoBytesToInt(byte1, byte2) {
    var value = (((byte2 & 0xff) << 8) | (byte1 & 0xff));
    if (value >= 0x8000) {
        value = -(0x10000 - value);
    }
    return value;
}