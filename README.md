# Arduino_Super

# Installation
    - npm install
    - flash arduino with StandardFirmata
        firmware located at:
            Arduino IDE ->  File -> Examples -> Firmata 

# Run
    node main.js
    - OR - 
    nodemon main.js
    Open in browser http://localhost:3333
Express server is default on port 3333


## Remember 
Check COM port before running script
Change baud rate on line 774 in StandardFirmata
to math the rate in main.js or lcd.js