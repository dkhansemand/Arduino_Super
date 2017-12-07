(function() {
    var socket = io.connect(window.location.hostname + ':' + 3333);
    var red = document.getElementById('red');
    var green = document.getElementById('green');
    var blue = document.getElementById('blue');

    function emitValue(color, e) {
        socket.emit('rgb', {
            color: color,
            value: e.target.value
        });
    }

    red.addEventListener('change', emitValue.bind(null, 'red'));
    blue.addEventListener('change', emitValue.bind(null, 'blue'));
    green.addEventListener('change', emitValue.bind(null, 'green'));

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.emit('checkConnection');
    socket.emit('getTemp', {
        data: true
     });

    socket.on('connected', (status) => {
        let statusElm = document.getElementById("status");
        if(status){
            statusElm.innerHTML = 'Connected';
            statusElm.style = "color:green";
        }else{
            statusElm.innerHTML = 'Disconnected';
        }
    });

    socket.on('rgb', function(data) {
        var color = data.color;
        document.getElementById(color).value = data.value;
    });

    socket.on('temp', (temp) => {
        document.getElementById("temp").innerHTML = Math.round(temp);
        
    });

    socket.on('btnClick', (data) => {
        console.log('BUTTON clicked : ', data);
    })

    let btnChangeIndex = 0;
    socket.on('btnRGBChange', (data) => {
        console.log('RGB change button clicked');
        btnChangeIndex++;

        if(btnChangeIndex === 1){
            socket.emit('ledOn', {
                led : 0
            })
        }

        if(btnChangeIndex === 2){
            socket.emit('ledOff', {
                led : 0
            })
            socket.emit('ledOn', {
                led : 3
            })
        }

        if(btnChangeIndex === 3){
            socket.emit('ledOff', {
                led : 3
            })
            socket.emit('ledOn', {
                led : 1
            })
        }

        if(btnChangeIndex === 4){
            socket.emit('ledOff', {
                led : 1
            })
            btnChangeIndex = 0;
        }
    })

    socket.on('RGBChange', (data) => {
        console.log('RGB change: ', data);
        let rgbVal = data.value;
        if(data.index == 1){
            
            red.value = rgbVal;
            socket.emit('rgb', {
                color: 'red',
                value: rgbVal
            });
        }
        if(data.index == 2){
            
            green.value = rgbVal;
            socket.emit('rgb', {
                color: 'green',
                value: rgbVal
            });
        }
        if(data.index == 3){
            
            blue.value = rgbVal;                
            socket.emit('rgb', {
                color: 'blue',
                value: rgbVal
            });
        }
        
    })

    var ledSwitch = document.querySelectorAll(".mdl-switch__input").forEach( (elm, idx) => {
        //console.log('Element: ', elm);
        //console.log('Index: ', idx);
        elm.addEventListener('click', (e) => {
           // console.log('E: ', e);
            //console.log('Siwtch clicked: ', e.srcElement.value);
            if(e.srcElement.checked){
                //console.log(`LED ${e.srcElement.value} ON`);
                socket.emit('ledOn', {
                    led : e.srcElement.value
                })
            }else{
                //console.log(`LED ${e.srcElement.value} OFF`);
                socket.emit('ledOff', {
                    led : e.srcElement.value
                })
            }
        });
    });

    /* ledSwitch.addEventListener('click', (e) => {
        console.log('E: ', e);
        console.log('Siwtch clicked: ', ledSwitch.value);
    }) */
    
    
    var btnTemp = document.getElementById("btnTemp");
    btnTemp.addEventListener('click', () => {
        socket.emit('getTemp', {
           data: true
        });
    });

    var show_1 ={
        loop : false,
        data : [
            [
                [1,0,0,0,0],
                [0,1,0,0,0],
                [0,1,1,0,0],
                [0,0,1,1,0],
                [0,0,0,1,1],
                [0,0,0,0,0]
            ],
            [
                [1,0,1,0,1],
                [0,1,0,1,0],
                [0,0,1,0,0],
                [0,0,0,1,0],
                [1,1,0,1,1],
                [0,0,0,0,0]
            ],
            [
                [1,0,0,0,0],
                [0,1,0,0,0],
                [0,1,1,0,0],
                [0,0,1,1,0],
                [0,0,0,1,1],
                [0,0,0,0,0]
            ],
            
        ]
    } 

    document.getElementById("btnShow").addEventListener('click', (e) => {
        /* if(show_1.loop){
            while(show_1.loop){
                show_1.data.forEach( (item, idx) => {
                    console.log('Item: ', item);
                    console.log('Index: ', idx);
                })
            }
        } */
        socket.emit('showStart')
        setTimeout(function(){
            show_1.data[0].forEach((arr, index) => {
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
        /* show_1.data.forEach( (arr, idx) => {
            arr.forEach( (ins, arrIdx) => {
                //console.log('Item: ', ins);
                //console.log('Index: ', arrIdx);
                
               
                    ins.forEach( (ledOnOff, insIdx) => {
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
                
            });
        }); */
    });
}());