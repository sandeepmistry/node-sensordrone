var util = require('util');

var async = require('async');

var Sensordrone = require('./index');

Sensordrone.discover(function(sensordrone) {
  async.series([
      function(callback) {
        console.log('connect');
        sensordrone.connect(callback);
      },
      function(callback) {
        console.log('discoverServicesAndCharacteristics');
        sensordrone.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        console.log('read battery voltage');
        sensordrone.readBatteryVoltage(function(voltage) {
          console.log('battery voltage = %d V', voltage.toFixed(1));

          callback();
        });
      },
      function(callback) {
        console.log('read ambient temperature');
        sensordrone.readAmbientTemperature(function(temperature) {
          console.log('ambient temperature = %d °C', temperature.toFixed(1));

          callback();
        });
      },
      function(callback) {
        console.log('read humidity');
        sensordrone.readHumidity(function(humidity) {
          console.log('humidity = %d %', humidity.toFixed(1));

          callback();
        });
      },
      function(callback) {
        console.log('enable pressure');
        sensordrone.enablePressure(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read pressure');
        setTimeout(function() {
          sensordrone.readPressure(function(pressure) {
            console.log('pressure = %d Pa', pressure.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable pressure');
        sensordrone.disablePressure(function() {
          callback();
        });
      },
      function(callback) {
        console.log('disconnect');
        sensordrone.disconnect(callback);
      }
    ],
    function() {
      process.exit(0);
    }
  );
});