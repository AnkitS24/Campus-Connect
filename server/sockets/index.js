const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');

const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.join(`user:${socket.userId}`);

    io.emit('user:online', { userId: socket.userId });

    socket.on('group:join', async (groupID) => {
      try{
        await Group.updateOne(
          {
            _id: groupID,
            "members.userId": { $ne: socket.userId }
          },
          {
            $push: {
              members: {
                userId: socket.userId,
                lastReadMessageId: null
              }
            }
          }
        );
        const group = await Group.findById(groupID);
        socket.join(`group:${groupID}`);
        io.emit('group:joined', { group });
      } catch (error) {
        console.error('group:join error', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    socket.on('group:leave', async (groupID) => {
      try {
        await Group.updateOne(
          { _id: groupID },
          {
            $pull: {
              members: {
                userId: socket.userId
              }
            }
          }
        );
        const group = await Group.findById(groupID);

        io.emit('group:left', {group});
        socket.leave(`group:${groupID}`);

      } catch (error) {
        console.error('group:leave error', error);

        socket.emit('error', {
          message: 'Failed to leave group'
        });
      }
    });

    socket.on('message:send', async (data) => {
      try {
        const { groupId, content, messageType, fileUrl, fileName, fileSize, replyTo } = data;

        const Message = require('../models/Message');
        const message = await Message.create({
          group: groupId,
          sender: socket.userId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
          replyTo: replyTo || undefined,
          readBy: [socket.userId],
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'fullName email avatar role')
          .populate('readBy', 'fullName email avatar')
          .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'fullName' },
          });
              const sockets = await io.in(`group:${groupId}`).fetchSockets();
              console.log(sockets.map(s => ({socketId: s.id,userId: s.userId })));
        io.to(`group:${groupId}`).emit('message:new', populated);
      } catch (error) {
        console.error('message:send error', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (data) => {
      try {
        const { messageIds, groupId } = data;
        const Message = require('../models/Message');

        await Message.updateMany(
          { _id: { $in: messageIds }, readBy: { $ne: socket.userId } },
          { $addToSet: { readBy: socket.userId } }
        );

        socket.emit('message:read:ack', { messageIds });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    socket.on('typing:start', (data) => {
      const { groupId } = data;
      socket.to(`group:${groupId}`).emit('typing:update', {
        userId: socket.userId,
        fullName: socket.user.fullName,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      const { groupId } = data;
      socket.to(`group:${groupId}`).emit('typing:update', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // WebRTC Signaling
    socket.on('webrtc:join-room', (data) => {
      const { roomId } = data;
      socket.join(`webrtc:${roomId}`);
      socket.to(`webrtc:${roomId}`).emit('webrtc:user-joined', { userId: socket.userId });
    });

    socket.on('webrtc:leave-room', (data) => {
      const { roomId } = data;
      socket.leave(`webrtc:${roomId}`);
      socket.to(`webrtc:${roomId}`).emit('webrtc:user-left', { userId: socket.userId });
    });

    socket.on('webrtc:offer', (data) => {
      const { roomId, offer } = data;
      socket.to(`webrtc:${roomId}`).emit('webrtc:offer', { userId: socket.userId, offer });
    });

    socket.on('webrtc:answer', (data) => {
      const { roomId, answer } = data;
      socket.to(`webrtc:${roomId}`).emit('webrtc:answer', { userId: socket.userId, answer });
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { roomId, candidate } = data;
      socket.to(`webrtc:${roomId}`).emit('webrtc:ice-candidate', { userId: socket.userId, candidate });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit('user:offline', { userId: socket.userId });
    });
  });
};

module.exports = setupSocketHandlers;
