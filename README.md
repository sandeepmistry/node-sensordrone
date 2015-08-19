# node-sensordrone

Node.js lib for the [Sensorcon](http://sensorcon.com) [Sensordrone](http://sensorcon.com/sensordrone-1/)

Special thanks to [@mrose17](https://github.com/mrose17) for sending me a Sensordrone!

__Notes__

  * Protocol determined from:
    * [Sensorcon/Sensordrone-iOS-Library](https://github.com/Sensorcon/Sensordrone-iOS-Library)
    * [Sensorcon/Sensordrone](https://github.com/Sensorcon/Sensordrone)

  * __Try resetting the Sensordrone if connection or service/characteristic discovery hangs__

## Prerequisites

 * See [noble prerequisites](https://github.com/sandeepmistry/noble#prerequisites) for your platform

## Install

```sh
npm install sensordrone
```

## Usage

```javascript
var Sensordrone = require('sensordrone');
```

### Discover

```javascript
Sensordrone.discover(callback(sensordrone));
```

### Connect

```javascript
sensordrone.connect(callback);
```

### Disconnect

```javascript
sensordrone.disconnect(callback);
```

### Discover Services and Characteristics

```javascript
sensordrone.discoverServicesAndCharacteristics(callback);
```

### Battery Voltage

```javascript
sensorTag.readBatteryVoltage(callback(voltage));
```

### LED's

```javascript
// values 0 - 255
sensordrone.setLeds(leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, callback);
```

### Ambient Temperature

```javascript
sensorTag.readAmbientTemperature(callback(temperature));
```

### Humidity

```javascript
sensorTag.readHumidity(callback(humidity));
```

### Pressure

Enable/disable:

```javascript
sensordrone.enablePressure(callback);

sensordrone.disablePressure(callback);
```

Read:

```javascript
sensordrone.readPressure(callback(pressure));
```

### Altitude (based on pressure)

Enable/disable:

```javascript
sensordrone.enableAltitude(callback);

sensordrone.disableAltitude(callback);
```

Read:

```javascript
sensordrone.readAltitude(callback(altitude));
```

### RGBC

Enable/disable:

```javascript
sensordrone.enableRGBC(callback);

sensordrone.disableRGBC(callback);
```

Read:

```javascript
sensordrone.readRGBC(callback(r, g, b, c, lux, temp)); // temp in Kelvins
```

### IR Temperature

Enable/disable:

```javascript
sensordrone.enableIrTemperature(callback);

sensordrone.disableIrTemperature(callback);
```

Read:

```javascript
sensordrone.readIrTemperature(callback(temperature));
```

### Precision Gas

```javascript
sensordrone.readPrecisionGas(callback(ppmCO));
```

### Oxidizing Gas

Enable/disable:

```javascript
sensordrone.enableOxidizingGas(callback);

sensordrone.disableOxidizingGas(callback);
```

Read:

```javascript
sensordrone.readOxidizingGas(callback(ohms));
```

### Reducing Gas

Enable/disable:

```javascript
sensordrone.enableReducingGas(callback);

sensordrone.disableReducingGas(callback);
```

Read:

```javascript
sensordrone.readReducingGas(callback(ohms));
```

### ADC

```javascript
sensordrone.readADC(callback(voltage));
```

### Capacitance

Enable/disable:

```javascript
sensordrone.enableCapacitance(callback);

sensordrone.disableCapacitance(callback);
```

Read:

```javascript
sensordrone.readCapacitance(callback(capacitance));
```

### UART

Write:

```javascript
sensordrone.writeUart(data, callback);
```

Read:

```javascript
sensordrone.readUart(callback(data));
```

### [External CO2 sensor](http://www.sensorcon.com/ambient-co2-sensor-carbon-dioxide-sensor-module-for-sensordrone/)

Setup:

```javascript
sensordrone.setupExternalCO2(callback);
```

Read:

```javascript
sensordrone.readExternalCO2(callback(ppm));
```
