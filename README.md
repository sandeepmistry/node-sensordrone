node-sensordrone
================

node.js lib for the [Sensorcon](http://sensorcon.com) [Sensordrone](http://sensorcon.com/sensordrone-1/)

Special thanks to [@mrose17](https://github.com/mrose17) for sending me a Sensordrone!

__Notes__

  * Protocol determined from:

    * [Sensorcon/Sensordrone-iOS-Library](https://github.com/Sensorcon/Sensordrone-iOS-Library)
    * [Sensorcon/Sensordrone](https://github.com/Sensorcon/Sensordrone)

  * __Try resetting the Sensordrone if connection or service/characteristic discovery hangs__

Install
-------

    npm install sensordrone

Usage
-----

    var Sensordrone = require('sensordrone');

__Discover__

    Sensordrone.discover(callback(sensordrone));

__Connect__

    sensordrone.connect(callback);

__Disconnect__

    sensordrone.disconnect(callback);

__Discover Services and Characteristics__

    sensordrone.discoverServicesAndCharacteristics(callback);

__Battery Voltage__

    sensorTag.readBatteryVoltage(callback(voltage));

__LED's__

    // values 0 - 255
    sensordrone.setLeds(leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, callback);

__Ambient Temperature__

    sensorTag.readAmbientTemperature(callback(temperature));

__Humidity__

    sensorTag.readHumidity(callback(humidity));

__Pressure__

Enable/disable:

    sensordrone.enablePressure(callback);

    sensordrone.disablePressure(callback);

Read:

    sensordrone.readPressure(callback(pressure));

__Altitude (based on pressure)__

Enable/disable:

    sensordrone.enableAltitude(callback);

    sensordrone.disableAltitude(callback);

Read:

    sensordrone.readAltitude(callback(altitude));

__RGBC__

Enable/disable:

    sensordrone.enableRGBC(callback);

    sensordrone.disableRGBC(callback);

Read:

    sensordrone.readRGBC(callback(r, g, b, c, lux, temp)); // temp in Kelvins

__IR Temperature__

Enable/disable:

    sensordrone.enableIrTemperature(callback);

    sensordrone.disableIrTemperature(callback);

Read:

    sensordrone.readIrTemperature(callback(temperature));

__Precision Gas__

    sensordrone.readPrecisionGas(callback(ppmCO));

__Oxidizing Gas__

Enable/disable:

    sensordrone.enableOxidizingGas(callback);

    sensordrone.disableOxidizingGas(callback);

Read:

    sensordrone.readOxidizingGas(callback(ohms));

__Reducing Gas__

Enable/disable:

    sensordrone.enableReducingGas(callback);

    sensordrone.disableReducingGas(callback);

Read:

    sensordrone.readReducingGas(callback(ohms));

__ADC__

    sensordrone.readADC(callback(voltage));

__Capacitance__

Enable/disable:

    sensordrone.enableCapacitance(callback);

    sensordrone.disableCapacitance(callback);

Read:

    sensordrone.readCapacitance(callback(capacitance));

__UART__

Write:

    sensordrone.writeUart(data, callback);

Read:

    sensordrone.readUart(callback(data));

__[External CO2 sensor](http://www.sensorcon.com/ambient-co2-sensor-carbon-dioxide-sensor-module-for-sensordrone/)__

Setup:

    sensordrone.setupExternalCO2(callback);

Read:

    sensordrone.readExternalCO2(callback(ppm));


