import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useSocket from '../hooks/useSocket';
import { groupAPI } from '../services/api';
import {
  Search,
  Send,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  X,
  Reply,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ChatSkeleton } from '../components/common/Skeleton';

const groupTypes = ['All', 'DSA', 'Web Dev', 'SAP', 'AI/ML', 'MCA', 'company-specific']; 

const Chat = () => {
  const { user } = useAuthStore();
  const {
    activeGroup, setActiveGroup,
    groups, setGroups, addInMyGroups, removeInMyGroups, myGroups,
    messages, setMessages, addMessage, updateMessage,
    typingUsers, unreadCounts, resetUnread, memberCounts, setMemberCounts
  } = useChatStore();
  const {
    joinGroup, leaveGroup, sendMessage, startTyping, stopTyping, reactToMessage,
  } = useSocket();
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', type: 'general' });
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data } = await groupAPI.getGroups();
      setGroups(data.data?.groups || []);
       
      await Promise.all(
        (data.data?.groups || []).map(async (g) => {
          setMemberCounts(g);
          unreadCounts[g._id] = 0;  
          if(g.members.some((m) => m.userId === user._id)) {
            addInMyGroups(g);
            joinGroup(g._id);
            //console.log('-----------------------')
            const { data } = await groupAPI.messageCount(g._id, user._id);
            //console.log('data',data);
            unreadCounts[g._id] = data.data?.unreadCount || 0;
          }
        })
      );
    } catch(error) {
      console.log('Failed to load groups',error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = async (group) => {
    //console.log(group)
     setActiveGroup(group);
     
    if(group.members.some((m) => m.userId === user._id )){
      //console.log('-----------------')
      setReplyingTo(null);
      resetUnread(group._id);
      try {
        await groupAPI.updateLastReadMessage({groupId : group._id});
        const { data } = await groupAPI.getMessages(group._id, { limit: 50 });
        setMessages(data.data?.messages || []);
      } catch(error) {
        console.log(error);
      }
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await groupAPI.createGroup(newGroup);
      const updatedGroups = [data.data.group, ...groups];
      setGroups(updatedGroups);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', type: 'general' });
    } catch {}
  };
  const handleJoinGroup = async(group) =>{
    joinGroup(group._id);
    addInMyGroups(group);
  }
  const handleLeaveGroup = async(group) =>{
    console.log("wnat to leave...")
    leaveGroup(group._id);
    removeInMyGroups(group);
    
    if (activeGroup?._id === group._id) {
      console.log('clear the chat because the user left the group');
      setActiveGroup(null);
      setMessages([]);
    }
  }
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    try {
      await groupAPI.deleteGroup(groupId);
      const updatedGroups = groups.filter((g) => g._id !== groupId);
      setGroups(updatedGroups);
      if (activeGroup?._id === groupId) {
        setActiveGroup(null);
        setMessages([]);
      }
    } catch {}
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeGroup) return;

    sendMessage({
      groupId: activeGroup._id,
      content: messageInput.trim(),
      replyTo: replyingTo?._id,
    });
    setMessageInput('');
    setReplyingTo(null);
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (!activeGroup) return;
    startTyping(activeGroup._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeGroup._id);
    }, 2000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e, msg) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 60) {
      setReplyingTo(msg);
    }
  };

  const filteredGroups = groups.filter((g) => {
    const matchesType = selectedType === 'All' || g.type === selectedType;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) return <ChatSkeleton />;
  // console.log('myGroups:', myGroups);
  // console.log('groups:', groups);
  // console.log("memberCounts:", memberCounts);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 lg:w-96 border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Community Chat</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
              title="Create Group"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-lighter rounded-lg pl-9 pr-4 py-2 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-thin">
            {groupTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  ${selectedType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface-lighter text-text-muted hover:text-text'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted p-4">
              <MessageSquare size={40} className="mb-2 opacity-50" />
              <p className="text-sm">No groups found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-sm text-primary hover:text-primary-light"
              >
                Create the first group
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isCreator = group.createdBy?._id === user?._id || group.createdBy === user?._id;

              return (
                <div
                  key={group._id}
                  className={`group relative flex items-center border-b border-border/50 transition-colors
                    ${activeGroup?._id === group._id
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-surface-lighter'
                    }`}
                >
                  <div
                    onClick={() => handleGroupSelect(group)}
                    className="flex-1 p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <Users size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{group.name}</p>
                          {unreadCounts[group._id] > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {unreadCounts[group._id]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">{group.type}</span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-muted">{memberCounts[group._id] || 0} members</span>
                          {isCreator && (
                            <button
                              onClick={(e) => 
                                {e.stopPropagation();
                                handleDeleteGroup(group._id)}}
                              className="absolute right-2 p-1.5 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all"
                              title="Delete group"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          {!isCreator &&(
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  {myGroups.some((g) => g._id === group._id)
                                    ? handleLeaveGroup(group)
                                    : handleJoinGroup(group)
                                  }}}
                                className="absolute right-2 p-1.5 rounded-lg text-text-muted opacity-0 group-hover:opacity-100 hover:bg-green-400/10 hover:text-green-400 transition-all"
                                >
                                  {myGroups.some((g) => g._id === group._id)
                                    ? <UserMinus size={16} />
                                    : <UserPlus size={16} />
                                  }
                              </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {myGroups.some((g) => g._id === activeGroup?._id) && activeGroup ? (
          <>
            <div className="p-4 border-b border-border glass">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{activeGroup.name}</p>
                    <p className="text-xs text-text-muted">{memberCounts[activeGroup._id] || 0} members</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg._id}>
                  {/* Reply preview inside message */}
                  {msg.replyTo && (
                    <div className={`flex mb-0.5 ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`text-xs text-text-muted flex items-center gap-1 px-1 ${msg.sender?._id === user?._id ? 'justify-end' : ''}`} style={{ maxWidth: '70%' }}>
                        <Reply size={10} />
                        Replying to {msg.replyTo?.sender?.fullName || 'a message'}
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(e, msg)}
                  >
                    <div
                      className={`relative group max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.sender?._id === user?._id
                          ? 'bg-primary text-white rounded-br-md'
                          : 'glass rounded-bl-md'
                      }`}
                    >
                      {msg.sender?._id !== user?._id && (
                        <p className="text-xs font-medium text-primary mb-1">
                          {msg.sender?.fullName}
                        </p>
                      )}

                      {/* Reply-to content preview */}
                      {msg.replyTo && (
                        <div className={`text-xs mb-1.5 pl-2 border-l-2 rounded-sm ${
                          msg.sender?._id === user?._id ? 'border-white/40 text-white/70' : 'border-primary/40 text-text-muted'
                        }`}>
                          {msg.replyTo.content?.substring(0, 60)}{msg.replyTo.content?.length > 60 ? '...' : ''}
                        </div>
                      )}

                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>

                      {/* Desktop reply button on hover */}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className={`absolute -top-3 p-1 rounded-full bg-surface border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white ${
                          msg.sender?._id === user?._id ? 'right-0' : 'left-0'
                        }`}
                        title="Reply"
                      >
                        <Reply size={12} />
                      </button>

                      <p className="text-xs opacity-60 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                     
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply preview bar */}
            {replyingTo && (
              <div className="px-4 py-2 border-t border-border bg-surface-lighter/50 flex items-center gap-2 text-sm">
                <Reply size={14} className="text-primary shrink-0" />
                <span className="text-text-muted truncate flex-1">
                  Replying to <span className="text-primary font-medium">{replyingTo.sender?.fullName || 'message'}</span>
                </span>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-surface-lighter rounded">
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="p-4 border-t border-border glass">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={handleTyping}
                  className="flex-1 bg-surface-lighter rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={60} className="mx-auto mb-4 text-text-muted opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Select a Group</h3>
              <p className="text-text-muted text-sm">
                Choose a group from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreateModal(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-surface-lighter">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Placement Prep 2026"
                required
              />
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Group Type</label>
                <select
                  value={newGroup.type}
                  onChange={(e) => setNewGroup((p) => ({ ...p, type: e.target.value }))}
                  className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {groupTypes.filter((t) => t !== 'All').map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Description (optional)</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-surface-lighter rounded-lg px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  placeholder="What's this group about?"
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                <Plus size={16} />
                Create Group
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
