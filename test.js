var util = require('util');

var async = require('async');

var Sensordrone = require('./index');

Sensordrone.discover(function(sensordrone) {
  async.series([
      function(callback) {
        console.log('connect');
        sensordrone.connect(callback);

        sensordrone.on('disconnect', function() {
          console.log('disconnected!');
          process.exit(0);
        });
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
        console.log('set LEDs');
        sensordrone.setLeds(255, 255, 255, 255, 255, 255, function() {
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
        console.log('enable altitude');
        sensordrone.enableAltitude(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read altitude');
        setTimeout(function() {
          sensordrone.readAltitude(function(altitude) {
            console.log('altitude = %d m', altitude.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable altitude');
        sensordrone.disableAltitude(function() {
          callback();
        });
      },
      function(callback) {
        console.log('enable RGBC');
        sensordrone.enableRGBC(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read RGBC');
        setTimeout(function() {
          sensordrone.readRGBC(function(r, g, b, c, lux, temp) {
            console.log('RGBC = %d %d %d %d %d Lux %d K', r.toFixed(1), g.toFixed(1), b.toFixed(1), c.toFixed(1), lux.toFixed(1), temp.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable RGBC');
        sensordrone.disableRGBC(function() {
          callback();
        });
      },
      function(callback) {
        console.log('enable IR temperature');
        sensordrone.enableIrTemperature(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read IR temperature');
        setTimeout(function() {
          sensordrone.readIrTemperature(function(temperature) {
            console.log('IR temperature = %d °C', temperature.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable IR temperature');
        sensordrone.disableIrTemperature(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read precision gas');
        sensordrone.readPrecisionGas(function(ppmCO) {
          console.log('precision gas = %d ppm CO', ppmCO.toFixed(1));
          
          callback();
        });
      },
      function(callback) {
        console.log('enable oxidizing gas');
        sensordrone.enableOxidizingGas(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read oxidizing gas');
        setTimeout(function() {
          sensordrone.readOxidizingGas(function(ohms) {
            console.log('oxidizing gas = %d Ω', ohms.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable oxidizing gas');
        sensordrone.disableOxidizingGas(function() {
          callback();
        });
      },
      function(callback) {
        console.log('enable reducing gas');
        sensordrone.enableReducingGas(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read reducing gas');
        setTimeout(function() {
          sensordrone.readReducingGas(function(ohms) {
            console.log('reducing gas = %d Ω', ohms.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable reducing gas');
        sensordrone.disableReducingGas(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read ADC');
        sensordrone.readADC(function(voltage) {
          console.log('ADC = %d V', voltage.toFixed(1));

          callback();
        });
      },
      function(callback) {
        console.log('enable capacitance');
        sensordrone.enableCapacitance(function() {
          callback();
        });
      },
      function(callback) {
        console.log('read capacitance');
        setTimeout(function() {
          sensordrone.readCapacitance(function(capacitance) {
            console.log('capacitance = %d fF', capacitance.toFixed(1));

            callback();
          });
        }, 1000);
      },
      function(callback) {
        console.log('disable capacitance');
        sensordrone.disableCapacitance(function() {
          callback();
        });
      },
      // function(callback) {
      //   sensordrone.setupExternalCO2(function() {
      //     callback();
      //   });
      // },
      // function(callback) {
      //   sensordrone.readExternalCO2(function(ppm) {
      //     console.log('external CO2 = %d ppm', ppm);
      //     callback();
      //   });
      // },
      function(callback) {
        console.log('disconnect');
        sensordrone.disconnect(callback);
      }
    ]
  );
});
