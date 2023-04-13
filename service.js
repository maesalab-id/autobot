const express = require('express');
const { createServer } = require('http');
const socket = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const gpsDevice = '/dev/ttyACM0';

const app = express();
const httpServer = createServer(app);
const io = socket(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const gpsd = require('node-gpsd');
const { parseLocation } = require('./location');

app.get('/', (req, res) => res.json({ message: 'Autobot is running...' }));
httpServer.listen(3000);

const gpsDaemon = new gpsd.Daemon({
    program: '/usr/sbin/gpsd',
    device: gpsDevice,
    verbose: true
});

gpsDaemon.start(() => {
    const listener = new gpsd.Listener();
    listener.connect(() => { listener.watch(); });

    listener.on('TPV', (data) => {
        switch (data.mode) {
            case 1:
                console.log('NO FIX');
                break;
            case 2:
                console.log('2D FIX');
                break;
            case 3:
                console.log('3D FIX');
                break;
        }
        if (data.mode !== 3) return io.emit('TPV.nofix');

        const tpv = parseLocation(data);
        io.emit('TPV.data', tpv);
    });

    listener.on('SKY', (data) => {
        const sky = {
            satellitesInView: data.nSat,
            satellitesUsed: data.satellites.filter((s) => s.used).length
        }
        io.emit('SKY.data', sky);
    });
});

