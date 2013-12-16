var events = require('events');
var util = require('util');

var noble = require('noble');

var SERVICE_UUID = '14839ac47d7e415c9a42167340cf2339';
var TX_UUID      = '8b00ace7eb0b49b0bbe99aee0a26e1a3';
var RX_UUID      = '0734594aa8e74b1aa6b1cd5243059a57';

function Sensordrone(peripheral) {
  this._peripheral = peripheral;
  this._txCharacteristic = null;
  this._rxCharacteristic = null;

  this.uuid = peripheral.uuid;
  this._rxQueue = [];

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
}

util.inherits(Sensordrone, events.EventEmitter);

Sensordrone.discover = function(callback) {
  noble.once('stateChange', function() {
    var onDiscover = function(peripheral) {
      if (peripheral.advertisement.localName &&
            peripheral.advertisement.localName.indexOf('Sensordrone') === 0) {
        noble.removeListener('discover', onDiscover);
        noble.stopScanning();

        var sensordrone = new Sensordrone(peripheral);
        callback(sensordrone);
      }
    };

    noble.on('discover', onDiscover);
    noble.startScanning();
  });
};

Sensordrone.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

Sensordrone.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid
  });
};

Sensordrone.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

Sensordrone.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

Sensordrone.prototype.discoverServicesAndCharacteristics = function(callback) {
  this._peripheral.discoverSomeServicesAndCharacteristics([], [], function(error, services, characteristics) {
    for (var i in characteristics) {
      var characteristic = characteristics[i];
      if (characteristic.uuid === TX_UUID) {
        this._txCharacteristic = characteristic;
      } else if (characteristic.uuid === RX_UUID) {
        this._rxCharacteristic = characteristic;
      }
    }

    this._rxCharacteristic.on('read', this.onRxData.bind(this));
    this._rxCharacteristic.notify(true, function() {
      this.readPrecisionGasCalibration(callback);
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.txData = function(bytes, callback) {
  this._rxQueue.push(callback);

  this._txCharacteristic.write(new Buffer(bytes), false);
};

Sensordrone.prototype.onRxData = function(data) {
  if (data[0] === 0x51) {
    var len = data[1];

    var callback = this._rxQueue.shift();

    callback(data.slice(2));
  }
};

Sensordrone.prototype.readBatteryVoltage = function(callback) {
  this.txData([0x05, 0x02, 0x22, 0x00], function(data) {
    var adc = data.readUInt16LE(1);
    var voltage = (adc / 4095.0) * 6.0;

    callback(voltage);
  });
};

Sensordrone.prototype.setLeds = function(leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, callback) {
  this.txData([0x05, 0x08, 0x15, leftRed, leftGreen, leftBlue, rightRed, rightGreen, rightBlue, 0x00], function(data) {
    callback();
  });
};

Sensordrone.prototype.readAmbientTemperature = function(callback) {
  this.txData([0x05, 0x06, 0x10, 0x00, 0x40, 0xe3, 0x02, 0x00], function(data) {
    var adc = data.readUInt16BE(1) & 0xfffc;
    var temperature = -46.85 + 175.72 * (adc / 65536.0);

    callback(temperature);
  });
};

Sensordrone.prototype.readHumidity = function(callback) {
  this.txData([0x05, 0x06, 0x10, 0x00, 0x40, 0xe5, 0x02, 0x00], function(data) {
    var adc = data.readUInt16BE(1) & 0xfffc;
    var humidity = -6.0 + 125.0 * (adc / 65536.0);

    callback(humidity);
  });
};

Sensordrone.prototype.enablePressure = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x3f, 0x00], function(data) {
    this.txData([0x05, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x38, 0x00], function(data) {
      this.txData([0x05, 0x07, 0x11, 0x00, 0x60, 0x01, 0x13, 0x07, 0x00], function(data) {
        this.txData([0x05, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x39, 0x00], function(data) {
          callback();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.disablePressure = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x00, 0x60, 0x01, 0x26, 0x3f, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readPressure = function(callback) {

  this.txData([0x05, 0x05, 0x10, 0x00, 0x60, 0x01, 0x05], function(data) {
    var pressureIntValue = data.readUInt16BE(1);
    var pressureIntBits = (data.readUInt8(3) & 0x0c);
    var pressureDecBits = (data.readUInt8(3) & 0x03);
    
    var pascals = (pressureIntValue * 4.0) + pressureIntBits + (pressureDecBits / 4.0);

    callback(pascals);
  }.bind(this));
};

Sensordrone.prototype.enableAltitude = Sensordrone.prototype.enablePressure;

Sensordrone.prototype.disableAltitude = Sensordrone.prototype.disablePressure;

Sensordrone.prototype.readAltitude = function(callback) {
  this.readPressure(function(pressure) {
    var pRatio = pressure / 101326.0;
    var altitudeMeters = ((1 - Math.pow(pRatio, 0.1902632)) * 44330.77);

    callback(altitudeMeters);
  }.bind(this));
};

Sensordrone.prototype.enableRGBC = function(callback) {
  this.txData([0x05, 0x03, 0x35, 0x01, 0x00], function(data) {
    this.txData([0x05, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x01, 0x00], function(data) {
      this.txData([0x05, 0x07, 0x11, 0x00, 0x39, 0x01, 0x81, 0x01, 0x00], function(data) {
        this.txData([0x05, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x03, 0x00], function(data) {
          callback();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.disableRGBC = function(callback) {
  this.txData([0x05, 0x03, 0x35, 0x00, 0x00], function(data) {
    this.txData([0x05, 0x07, 0x11, 0x00, 0x39, 0x01, 0x80, 0x00, 0x00], function(data) {
      callback();
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.readRGBC = function(callback) {
  this.txData([0x05, 0x06, 0x10, 0x00, 0x39, 0x90, 0x08, 0x00], function(data) {

    var R = data.readUInt16LE(3);
    var G = data.readUInt16LE(1);
    var B = data.readUInt16LE(5);
    var C = data.readUInt16LE(7);

    var Rcal = 0.2639626007;
    var Gcal = 0.2935368922;
    var Bcal = 0.379682891;
    var Ccal = 0.2053011829;
    
    R += R * Rcal;
    G += G * Gcal;
    B += B * Bcal;
    C += C * Ccal;
    
    var X = -0.14282 * R + 1.54924 * G + -0.95641 * B;
    var Y = -0.32466 * R + 1.57837 * G + -0.73191 * B;
    var Z = -0.68202 * R + 0.77073 * G + 0.56332 * B;
    
    var x = X / (X + Y + Z);
    var y = Y / (X + Y + Z);
    
    var n = (x - 0.3320) / (0.1858 - y);
    
    var CCT = 449.0 * Math.pow(n, 3) + 3525.0 * Math.pow(n, 2) + 6823.3 * n + 5520.33;
    
    if (Y < 0) {
        Y = 0;
    }

    callback(R, G, B, C, Y, CCT);
  }.bind(this));
};

Sensordrone.prototype.enableIrTemperature = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x00, 0x41, 0x01, 0x02, 0x75, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.disableIrTemperature = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x00, 0x41, 0x01, 0x02, 0x00, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readIrTemperature = function(callback) {
  this.txData([0x05, 0x06, 0x10, 0x00, 0x41, 0x00, 0x02, 0x00], function(data) {

    var V_OBJ = data.readInt16BE(1) * 1.0;

    this.txData([0x05, 0x06, 0x10, 0x00, 0x41, 0x01, 0x02, 0x00], function(data) {
      // Terms used for calculating the objects Temperature
      var a1 = 1.75 * Math.pow(10, -3);
      var a2 = -1.678 * Math.pow(10, -5);
      var T_REF = 298.15;
      var b0 = -2.94 * Math.pow(10, -5);
      var b1 = -5.7 * Math.pow(10, -7);
      var b2 = 4.63 * Math.pow(10, -9);
      var c2 = 13.4;

      var s0 = 2.51 * Math.pow(10, -14);
            
      var T_DIE = data.readInt16BE(1) * 1.0;
      
      var dT_DIE = ((T_DIE / (32.0 * 4.0)) + 273.15); // Should be Kelvin. The *4 was reversed engineered.
      var dV_OBJ = (V_OBJ * 156.25 * Math.pow(10, -9)); // Should be in Volts

      var Vos = b0 + b1 * (dT_DIE - T_REF) + b2 * Math.pow((dT_DIE - T_REF), 2);
      var sensitivity = s0 * (1 + a1 * (dT_DIE - T_REF) + a2 * Math.pow((dT_DIE - T_REF), 2));
      var fVobj = (dV_OBJ - Vos) + c2 * Math.pow((dV_OBJ - Vos), 2);
      var TMP = Math.pow(dT_DIE, 4) + (fVobj / sensitivity);
      
      var temperature = Math.sqrt(Math.sqrt(TMP));

      callback(temperature - 273.15);
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.readPrecisionGasCalibration = function(callback) {

  this.txData([0x05, 0x02, 0x40, 0x00], function(data) {
    this._precisionGasSensitivity = data.readUInt16LE(1) / 1000.0;
    this._precisionGasBaseline = data.readUInt16LE(3);

    callback();
  }.bind(this));
};

Sensordrone.prototype.readPrecisionGas = function(callback) {
  this.txData([0x05, 0x02, 0x20, 0x00], function(data) {
    var gaintStage = data[3];
    
    var gainRes = [
      2200000,
      301961,
      113793,
      34452,
      13911,
      6978,
      3494,
      2747
    ];
    
    var ADC = data.readUInt16LE(1);
    var deltaADC = ADC - this._precisionGasBaseline;
    var gasResponse = (deltaADC * 3.0 * Math.pow(10, 9)) / 4096.0;
    if (deltaADC < 0.0) {
        gasResponse = 0.0;
    }
    var gain = gainRes[gaintStage];
    var ppmCO = gasResponse / (this._precisionGasSensitivity * gain);

    callback(ppmCO);
  }.bind(this));
};

Sensordrone.prototype.enableOxidizingGas = function(callback) {
  this.txData([0x05, 0x03, 0x18, 0x84, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.disableOxidizingGas = function(callback) {
  this.txData([0x05, 0x03, 0x18, 0x00, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readOxidizingGas = function(callback) {
  this.txData([0x05, 0x02, 0x1c, 0x00], function(data) {
    var ADC = data.readUInt16LE(1);
    var voltage = (ADC / 4095.0) * 3.3;

    var resistance = (18000.0 * 3.3 / voltage) - 18000.0;

    callback(resistance);
  }.bind(this));
};

Sensordrone.prototype.enableReducingGas = function(callback) {
  this.txData([0x05, 0x03, 0x19, 0xba, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.disableReducingGas = function(callback) {
  this.txData([0x05, 0x03, 0x19, 0x00, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readReducingGas = function(callback) {
  this.txData([0x05, 0x02, 0x1d, 0x00], function(data) {
    var ADC = data.readUInt16LE(1);
    var voltage = (ADC / 4095.0) * 3.3;

    var resistance = (270000.0 * 3.3 / voltage) - 270000.0;

    callback(resistance);
  }.bind(this));
};

Sensordrone.prototype.readADC = function(callback) {
  this.txData([0x05 , 0x02, 0x21, 0x00], function(data) {
    var ADC = data.readUInt16LE(1);
    var voltage = (ADC / 4095.0) * 3.3;

    callback(voltage);
  }.bind(this));
};

Sensordrone.prototype.enableCapacitance = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0f, 0x11, 0x00], function(data) {
    this.txData([0x05, 0x08, 0x11, 0x01, 0x48, 0x01, 0x05, 0x30, 0x00, 0x00], function(data) {
      this.txData([0x05, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0b, 0xc0, 0x00], function(data) {
        callback();
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.disableCapacitance = function(callback) {
  this.txData([0x05, 0x07, 0x11, 0x01, 0x48, 0x01, 0x0f, 0x00, 0x00], function(data) {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readCapacitance = function(callback) {
  this.txData([0x05, 0x06, 0x10, 0x01, 0x48, 0x00, 0x03, 0x00], function(data) {
    var ADC = data.readUInt16BE(2);

    var capacitance = (ADC / 65520.0) * 4000;

    callback(capacitance);
  }.bind(this));
};

Sensordrone.prototype.writeUart = function(data, callback) {
  var command = [];
  command[0] = 0x05;
  command[1] = 0x02 + data.length;
  command[2] = 0x24;

  for (var i = 0; i < data.length; i++) {
    command[i + 3] = data[i];
  }
  command[3 + data.length] = 0x00;

  this.txData(command, function(data) {
    callback()
  }.bind(this));
};

Sensordrone.prototype.readUart = function(callback) {
  this.txData([0x05, 0x02, 0x25, 0x00], function(data) {
    var readData = data.slice(3, data.length - 1);

    callback(readData);
  }.bind(this));
};

Sensordrone.prototype.setupExternalCO2 = function(callback) {
  this.writeUart(new Buffer('K 1\r\n'), function() {
    callback();
  }.bind(this));
};

Sensordrone.prototype.readExternalCO2 = function(callback) {
  this.writeUart(new Buffer('Z\r\n'), function() {
    var s = '';

    var parseUartData = function(data) {
      s += data.toString().replace(/\s+/g, ' ').replace(/\0/g, '');

      var found = s.match(/ z (\d{5}) (\d{5}) /);
      if (found) {
        var measurement1 = parseInt(found[1]);
        var measurement2 = parseInt(found[2]);

        var measurementAverage = (measurement1 + measurement2) / 2.0;

        callback(measurementAverage);
      } else {
        this.readUart(parseUartData);
      }
    }.bind(this);

    this.readUart(parseUartData);
  }.bind(this));
};

module.exports = Sensordrone;
