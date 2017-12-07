const SerialPort = require("serialport");
const five = require("johnny-five");
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
  const port = process.env.PORT || 3333;
  let LCD;
 
  board.on('ready', function() {
      console.log('Arduino is ready.', board.id);
      this.pinMode(9, 1);
      this.digitalWrite(9, 0);
      this.pinMode(11, 3);
      this.pinMode(12, 3);
      this.pinMode(3, 3);
      this.pinMode(5, 3);
      LCD= new five.LCD({ 
        pins: [12, 11, 5, 4, 3, 2],
        backlight: 10,
        rows: 2,
        cols: 16
      });
      LCD.useChar('clock')
      

  });

  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/node_modules'))
  
  app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/lcd.html')
  });

  io.on('connection', function(client) {
    client.on('LCD', function(handshake) {
        if(board.isReady){
            LCD.clear();
            LCD.useChar("heart");
            LCD.print('Arduino klar! :heart:');
            LCD.cursor(1,0);
        }  
      });
      
        client.on('text', (data) => {
            console.log(data.txt)
            LCD.clear()
            LCD.autoscroll().print(data.txt)
            LCD.cursor(1,0);
            
        })

        client.on('showTime', (data) => {
            LCD.cursor(0,0).clear()
            LCD.cursor(0,0).print(`:clock: ${data.now}`)
            LCD.cursor(1,0).print(`Dato: ${data.date}`);
            LCD.cursor(1,15); 
        })

  })

  
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});