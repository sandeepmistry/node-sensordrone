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
}

util.inherits(Sensordrone, events.EventEmitter);

Sensordrone.discover = function(callback) {
  noble.once('stateChange', function() {
    var onDiscover = function(peripheral) {
      if (peripheral.advertisement.localName.indexOf('Sensordrone') === 0) {
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
  this._peripheral.discoverSomeServicesAndCharacteristics([SERVICE_UUID], [], function(error, services, characteristics) {
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
      this.txData([0x05, 0x02, 0x40, 0x00], function(data) {
        callback();
      });
    }.bind(this));
  }.bind(this));
};

Sensordrone.prototype.txData = function(bytes, callback) {
  this.once('data', callback);

  this._txCharacteristic.write(new Buffer(bytes), false);
};

Sensordrone.prototype.onRxData = function(data) {
  if (data[0] === 0x51) {
    var len = data[1];

    this.emit('data', data.slice(2));
  }
};

Sensordrone.prototype.readBatteryVoltage = function(callback) {
  this.txData([0x05, 0x02, 0x22, 0x00], function(data) {
    var adc = data.readUInt16LE(1);
    var voltage = (adc / 4095.0) * 6.0;

    callback(voltage);
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

module.exports = Sensordrone;
