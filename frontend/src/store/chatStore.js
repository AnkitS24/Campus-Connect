import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  activeGroup: null,
  groups: [],
  myGroups: [],
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  unreadCounts: {},
  memberCounts: {},
  isConnected: false,

  setActiveGroup: (group) =>{
     set({ activeGroup: group, messages: [] })
  },
  setGroups: (groups) => set({ groups }),

  addInMyGroups: (group) =>
  set((state) => ({
    myGroups: state.myGroups.some(
      (g) => g._id === group._id
    )
      ? state.myGroups
      : [...state.myGroups, group]
  })),

  removeInMyGroups : (group) => set({
    myGroups : get().myGroups.filter(g => g._id != group._id)
  }),
  
  addGroup: (group) => set((state) => ({ groups: [group, ...state.groups] })),

  updateGroup: (groupId, updates) => 
    set((state) => ({
      groups: state.groups.map((g) =>
        g._id === groupId ? { ...g, ...updates } : g
      ),
    })),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      ),
    })),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  setTypingUsers: (users) => set({ typingUsers: users }),

  addTypingUser: (user) => {
    const state = get();
    if (!state.typingUsers.find((u) => u.userId === user.userId)) {
      set({ typingUsers: [...state.typingUsers, user] });
    }
  },

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u.userId !== userId),
    })),

  incrementUnread: (groupId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [groupId]: (state.unreadCounts[groupId] || 0) + 1,
      },
    })),
  resetUnread: (groupId) =>
    set((state) => {

      return {
      unreadCounts: { ...state.unreadCounts, [groupId]: 0}
      };
    }),

    setMemberCounts: (group) =>
      set((state) => {
        return {
        memberCounts: { ...state.memberCounts, [group._id]: group.members?.length || 0 },
      }}),
  setConnected: (connected) => set({ isConnected: connected }),
}));

export default useChatStore;
