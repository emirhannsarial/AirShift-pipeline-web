// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// İzin verilen adresler (Localhost ve ilerideki Vercel adresi)
const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pipeline-web.vercel.app" // Kendi Vercel adresini buraya ekleyeceksin
];

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Postman veya Mobile App gibi originsiz isteklere izin ver (geliştirme aşamasında)
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Biri bağlandı! Socket ID: ${socket.id}`);

    // İstemciden gelen 'join-room' sinyalini dinle
    // DÜZELTME: userId'yi parametreden değil, direkt socket.id'den alıyoruz (Daha güvenli)
    socket.on('join-room', (roomId) => { // userId parametresini kaldırdık
        const userId = socket.id; // Server kendi bildiği ID'yi kullanır
        socket.join(roomId);
        console.log(`Kullanıcı ${userId} odaya katıldı: ${roomId}`);
        
        // Odadaki diğer kişiye "Biri geldi" haberini ver
        socket.to(roomId).emit('user-connected', userId);
    });

    // İstemci koptuğunda
    socket.on('disconnect', () => {
        console.log('Biri ayrıldı:', socket.id);
    });


    // Sinyal İletişimi (Ahmet sinyal atar, Sunucu bunu Ayşe'ye iletir)
    socket.on('send-signal', ({ targetId, signal }) => {
        // Sinyali sadece hedef kişiye yolla
        io.to(targetId).emit('receive-signal', {
            senderId: socket.id,
            signal: signal
        });
    });

});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Sinyal Sunucusu ${PORT} portunda çalışıyor...`);
});