# espruino-lis3dh

The goal of this project is ultimately to provide an Espruino module for the LIS3DH.

For the moment this is work in progress and it is far from completion! Right now I'm still playing with an Adafruit LIS3DH accelerometer plugged to an ESP8266 breakout board. The ESP is an Adafruit Huzzah flashed with Espruino.
All the communication are using the I2C protocol and I'm following the [tutorial from Adafruit.](https://learn.adafruit.com/adafruit-lis3dh-triple-axis-accelerometer-breakout)

## LIS3DH Datasheet

The datasheet for the LIS3DH is available [here](http://www.st.com/web/en/resource/technical/document/datasheet/CD00274221.pdf).

## Example

### Set-up I2C

SDA pin is on pin 4 and SCL is on pin 5. Edit the end of `index.js` if you are using another wiring.

The following code is executed at the end of index.js:

```js
I2C1.setup({sda: D4, scl: D5});
```

### Instantiate the object

Then, we create the main object and set all the default configurations.
The default I2C address is `0x18`.

```js
var accel = new LIS3DH(I2C1, 0x18);
accel.begin();
```


### Display the acceleration values

You can then trigger the read function by calling the `read()` function:

```js
console.log(accel.read());
```

You should see something like this:

```js
[ 16880, 2752, 2528 ]
=undefined
```

