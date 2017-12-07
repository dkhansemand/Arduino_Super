/* const SerialPort = require('serialport').SerialPort;
const five = require('johnny-five');

const board = new five.Board({
  port: new SerialPort("COM7", {
    baudrate: 9600,
    buffersize: 1
  })
}) */
//new five.Board({port : 'COM7', repl: false});
const SerialPort = require("serialport");
const five = require("johnny-five");
const board_Two = new five.Board({
  id : "B",
  port: new SerialPort("COM8", {
    baudRate: 115200
  }),
  repl: false
});
const board = new five.Board({
  id : "A",
  port: new SerialPort("COM7", {
    baudRate: 115200
  }),
  repl: false
});


const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


const port = process.env.PORT || 3000;
const LEDS = [2,4,5,6,7];
const RGBLED  = [11,9,10];
const BTN_PIN = 12;

var BTN, RGB, LED_1, LED_2, LED_3, LED_4, LED_5;
var showLEDS = false;
var voltage, temp, sensor, status;
//const BTN = new five.Button(BTNPIN);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'))

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/index.html')
});


let state = {
  red: 0, green: 0, blue: 0
};

io.on('connection', function(client) {

    board_Two.on('ready', () => {
      console.log('Board 2 klar!', board_Two.id);
      
  
      let B2_LED = new five.Led({pin : 7, board: board_Two});
      //B2_LED.on();
  
    
    })

  board.on('ready', function() {
    console.log('Arduino is ready.', board.id);
    RGB = new five.Led.RGB({ pins: RGBLED, board: board });
    RGB.color('#00FF00');
    status = true;
    client.emit('connected', status); 
    
      sensor = new five.Sensor("A0");
    
    setTimeout(() => {
      voltage = (sensor.value / 1024.0) * 5.0;
      temp = (voltage - .5) * 100;
      client.emit('temp', temp);
      client.broadcast.emit('temp', temp); 
      RGB.color('#000000');
    }, 1000)
  });

    console.log('Connection: ', client);
    client.on('join', function(handshake) {
      console.log(handshake);
    });

   
 
    board.on('exit', (e) => {
      status = false;
      client.emit('connected', status);
    });

  
    

    client.on('checkConnection', () => {
      client.emit('connected', board.isReady);
    });

  // Every time a 'rgb' event is sent, listen to it and grab its new values for each individual colour
    client.on('rgb', function(data) {
      //console.log('Data recieved: ', data);
      state.red = data.color === 'red' ? data.value : state.red;
      state.green = data.color === 'green' ? data.value : state.green;
      state.blue = data.color === 'blue' ? data.value : state.blue;

      let RGB = new five.Led.RGB({pins: RGBLED, board: board});

      RGB.color({
        red: state.red,
        green: state.green,
        blue: state.blue
      });
      client.emit('rgb', data);
      client.broadcast.emit('rgb', data); 
    });



    
    client.on('getTemp', (data) => {
      console.log('Get Temp activated! ', data);
      
        sensor = new five.Sensor("A0");
      

      setTimeout(() => {
        console.log('Sensor val: ', sensor.fscaleTo(0,100));
        voltage = (sensor.value / 1024.0) * 5.0;
        temp = (voltage - .5) * 100;
        console.log(`Voltage: ${voltage} / temp (c): ${temp}`);
        client.emit('temp', temp);
        client.broadcast.emit('temp', temp);
      }, 1000)
     

    });

    client.on('ledOn', (data) => {
        let LED = new five.Led({ pin: LEDS[data.led], board: board });
        LED.on();
    });

    client.on('ledOff', (data) => {
      let LED = new five.Led({ pin: LEDS[data.led], board: board });
      LED.off();
    });




    client.on('showStart', (data) => {
      setTimeout(function(){
        data.forEach((arr, index) => {
            arr.forEach( (ledOnOff, insIdx) => {
                setTimeout(function(){
                if(ledOnOff === 0){
                    socket.emit('ledOff', {
                        led : insIdx
                    });
                }
                if(ledOnOff === 1){ 
                    socket.emit('ledOn', {
                        led : insIdx
                    })
                }
               
            });
        }, 5000);

        })

    }, 1000);
    })


   
    if(board.isReady){
      let changeState = false;
      let changeIndex = 0;
      
      let Btn_RGB = new five.Button({ pin: 8, board: board });
      let RGB_Change = new five.Led({ pin: 3, board: board });

      Btn_RGB.on('press', () => {
        changeState = true;
        if(changeState){
          RGB_Change.pulse(500);
          client.emit('btnRGBChange', {
            pressed : true
          })
          let potentiometer = new five.Sensor({
            pin: "A1",
            freq: 100,
            threshold: 2
          });
          
          potentiometer.on("change", function() {
            let changeVal = Math.floor(this.value / 4);
            //console.log(Math.floor(this.value / 4));
            client.emit('RGBChange', {
              index: changeIndex,     
              value : changeVal
            })
          });
          changeIndex++;
        }
         
        if(changeIndex === 4){
          changeState = false;
          changeIndex = 0;
          RGB_Change.stop();
          RGB_Change.off();
        }

      })
    }

    
    
    board_Two.on('ready', () => {
      let LED_CHANGE_STATE = false;
      let BTN_LED_START = new five.Button({ pin: 3, board: board_Two });
      let BTN_LED_TOGGLE = new five.Button({ pin: 2, board: board_Two });
     
    /*   BTN_LED_START.on('press', () => {
        console.log('BTN  pressed');
      })
      BTN_LED_TOGGLE.on('press', () => {
        console.log('BTN toggle pressed');
      }); */

       BTN_LED_START.on('press', () => {
         if(!LED_CHANGE_STATE){
           LED_CHANGE_STATE = true;
           let LED_CHOOSE = new five.Sensor({
             pin: "A1",
             freq: 100,
             threshold: 2
           });
           LED_CHOOSE.on('change', function() {
             console.log('CHANGE', this.raw);
             client.emit('LED_PICK', {     
               value : this.value
             })
           })
   
         }else{
           LED_CHANGE_STATE = false;
         }
         client.emit('LED_START', {
           pressed : true
         })
   
       })

      
    });

    

  });


server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
