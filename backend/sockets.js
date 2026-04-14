const { Server } = require('socket.io');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected to socket: ${socket.id}`);

        socket.on('join_patient_room', (patientId) => {
            socket.join(`patient_${patientId}`);
            console.log(`Socket ${socket.id} joined room patient_${patientId}`);
        });

        // Mock event from Wearable Stream
        socket.on('wearable_data_stream', (data) => {
            // Echo to any doctors or the patient themselves listening to this patient's data
            io.to(`patient_${data.patientId}`).emit('live_vitals', data);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
