const http = require('http');
const events = require('events');
const dbhandler = require('./db-handler')
const txhandler  = require('./transaction-handler')
const MockData = require('./mock-sensor-data');

//Config of server
const hostname = '127.0.0.1';
const port = 3000;

// Adding Event Listener
var em = new events.EventEmitter(); 
em.on('input', dbhandler)
em.on('input', txhandler)


const server = http.createServer((req, res) => {
    console.log('Request received')

    // Emitting event
    //em.emit('input', req, res) //how it should work with a real smart meter
    em.emit('input', MockData.createMockData(3,0,10), res ) // Currently Mocked within the household server
   
    // Sending Response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Success\n');

});

server.listen(port, hostname, () => {
    console.log(`Household Server running at http://${hostname}:${port}/`);
});
