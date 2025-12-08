// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// YENİ EKLENECEK KISIM: Ana sayfaya girince mesaj göster
app.get('/', (req, res) => {
    res.send('🚀 PipeLine Server is Running Successfully!');
});

const io = new Server(server, {
    cors: {
        origin: "*", // DÜZELTME: Tüm kaynaklara izin ver (Kesin çözüm)
        methods: ["GET", "POST"],
        credentials: true
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

    // Bağlantı kopunca (Sekme kapanınca)
    socket.on('disconnecting', () => {
        const rooms = socket.rooms;
        // Kullanıcının bulunduğu tüm odalara haber ver
        rooms.forEach((roomId) => {
            socket.to(roomId).emit('peer-disconnected', socket.id);
        });
    });

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