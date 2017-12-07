(function() {
    var socket = io.connect(window.location.hostname + ':' + 3333);

    document.getElementById("btnLCD").addEventListener('click', () => {
        socket.emit('LCD');
    })

    document.getElementById('btnTxt').addEventListener('click', () => {
        let text = document.getElementById('lcdTxt').value;
        console.log(text)
        socket.emit('text', {
            txt : text
        })
    })

    let BTN_TOGGLE = false;
    let timer;
    document.getElementById('btnTime').addEventListener('click', () => {
        if(!BTN_TOGGLE){
            BTN_TOGGLE = true;
            timer = setInterval(function () {
                let date = new Date()
                let timeStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                let dateStr = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
                socket.emit('showTime', {
                    now : timeStr,
                    date : dateStr 
                })
            }, 1000) 
        }else{
            clearInterval(timer);
            BTN_TOGGLE = false;
        }
    })

}());