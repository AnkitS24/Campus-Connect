import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuthStore();
  const {
    activeGroup,
    setActiveGroup,
    addMessage,
    updateMessage,
    addOnlineUser,
    removeOnlineUser,
    addTypingUser,
    removeTypingUser,
    incrementUnread,
    setConnected,
    setMemberCounts,
  } = useChatStore();

  const connect = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    const token = localStorage.getItem('accessToken');

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('message:new', (message) => {
      console.log('new message received:', message);
      const activeGroup = useChatStore.getState().activeGroup;
      if(message.group == activeGroup?._id) {
        addMessage(message);
      }
      if(message.sender._id !== user._id && message.group !== activeGroup?._id) {
        incrementUnread(message.group);
      }
      if(message.group === activeGroup?._id) {
        ;
      }
    });

    socketRef.current.on('message:updated', (message) => {
      updateMessage(message._id, message);
    });

    socketRef.current.on('user:online', ({ userId }) => {
      addOnlineUser(userId);
    });
  
    socketRef.current.on('user:offline', ({ userId }) => {
      removeOnlineUser(userId);
    });

    socketRef.current.on('typing:update', (data) => {
      if (data.isTyping) {
        addTypingUser(data);
      } else {
        removeTypingUser(data.userId);
      }
    });

    socketRef.current.on('error', ({ message }) => {
      console.error('Socket error:', message);
    });

    socketRef.current.on('group:joined', ({group}) => {
      setMemberCounts(group);
    });

    socketRef.current.on('group:left', ({ group }) => {
      setMemberCounts(group);
    });
  }, [user]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  const joinGroup = useCallback((groupID) => {
    socketRef.current?.emit('group:join', groupID);
  }, []);

  const leaveGroup = useCallback((groupId) => {
    socketRef.current?.emit('group:leave', groupId);
  }, []);

  const sendMessage = useCallback((data) => {
    socketRef.current?.emit('message:send', data);
  }, []);

  const markAsRead = useCallback((messageIds, groupId) => {
    socketRef.current?.emit('message:read', { messageIds, groupId });
  }, []);

  const startTyping = useCallback((groupId) => {
    socketRef.current?.emit('typing:start', { groupId });
  }, []);

  const stopTyping = useCallback((groupId) => {
    socketRef.current?.emit('typing:stop', { groupId });
  }, []);

  return {
    socket: socketRef.current,
    joinGroup,
    leaveGroup,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
};

export default useSocket;
