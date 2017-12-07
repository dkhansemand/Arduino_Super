function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}
const SerialPort = require("serialport");
const five = require("johnny-five");
const os = require('os');
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
        let timerStarted = false;
        client.on('showTime', (data) => {
            if(timerStarted){
                LCD.cursor(0,0).print(`:clock: ${data.now}`)
                LCD.cursor(1,0).print(`Dato: ${data.date}`);
                LCD.cursor(1,15); 
            }else{
                timerStarted = true;
                LCD.clear()
            }
        })

        let osInfoToggle = false;
        client.on('osInfo', () => {
            LCD.clear();
            LCD.cursor(0,0).print(`RAM usage:`);
            LCD.cursor(1,0).print(`${formatBytes(os.freemem())}/${formatBytes(os.totalmem())}`)
            setTimeout(() => {
                 LCD.clear() 
                 LCD.cursor(0,0).print(`User logged in:`)
                 LCD.cursor(1,0).print(`${os.userInfo().username}`)
            }, 4000)
            //console.log('user info: ', os.userInfo().username)
        })

  })

  
server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});