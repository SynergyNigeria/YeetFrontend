import React, { useState, useRef, useEffect, useContext } from 'react';
import { ArrowLeft, Send, MessageCircle, User, Camera, Headphones } from 'react-feather';
import { chatApi } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [chats, setChats] = useState([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);
  const pollIntervalRef = useRef(null);
  const typingPollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mobileMessagesRef = useRef(null);
  const desktopMessagesRef = useRef(null);

  // Polling functions for real-time messages
  const startPolling = (roomId) => {
    // Poll for new messages every 1 second for faster updates
    pollIntervalRef.current = setInterval(async () => {
      try {
        const messages = await chatApi.getMessages(roomId);
        
        setSelectedChat(prev => {
          // Only update if we're still on the same chat and have new messages
          if (!prev || prev.id !== roomId) return prev;
          
          // If we have more messages from server than locally, update the chat
          if (messages.length > prev.messages.length) {
            const formattedMessages = messages.map(msg => ({
              id: msg.id,
              text: msg.content || 'Message content unavailable',
              photo: msg.image || null,
              sender: msg.sender.id === prev.userId ? 'agent' : 'me',
              time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'
            }));
            
            const latestMessage = messages[messages.length - 1];
            
            // Also update the chat list
            setChats(prevChats => 
              prevChats.map(chat => 
                chat.id === roomId 
                  ? { 
                      ...chat, 
                      lastMessage: latestMessage ? latestMessage.content : chat.lastMessage,
                      time: 'now'
                    }
                  : chat
              )
            );
            
            return {
              ...prev,
              messages: formattedMessages,
              lastMessage: latestMessage ? latestMessage.content : prev.lastMessage,
              time: 'now'
            };
          }
          
          return prev;
        });
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    }, 1000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (typingPollRef.current) {
      clearInterval(typingPollRef.current);
      typingPollRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setOtherUserTyping(false);
  };

  // Poll for typing status
  const startTypingPoll = (roomId) => {
    typingPollRef.current = setInterval(async () => {
      try {
        const typingData = await chatApi.getTyping(roomId);
        setOtherUserTyping(typingData.is_typing || false);
      } catch (error) {
        console.error('Failed to poll typing status:', error);
      }
    }, 1000);
  };

  // Send typing status
  const sendTypingStatus = async (roomId, isTyping) => {
    try {
      await chatApi.setTyping(roomId, isTyping);
    } catch (error) {
      console.error('Failed to send typing status:', error);
    }
  };

  // Handle typing in message input
  const handleTyping = () => {
    if (!selectedChat?.room) return;

    // Send typing started
    sendTypingStatus(selectedChat.room.id, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing stopped after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(selectedChat.room.id, false);
    }, 2000);
  };

  // Fetch staff users and conversations on component mount
  useEffect(() => {
    console.log('Chat useEffect running, user:', user);
    const fetchData = async () => {
      try {
        const [staffUsers, conversations] = await Promise.all([
          chatApi.getStaffUsers(),
          chatApi.getConversations()
        ]);

        let chatList = [];

        if (user?.is_staff) {
          // Staff view: show only users who have texted (existing conversations with non-staff)
          console.log('Staff user ID:', user.id);
          console.log('Conversations:', conversations);
          const userChats = conversations
            .filter(room => {
              console.log('Room type:', room.room_type, 'Participants:', room.participants);
              return room.room_type === 'USER_USER';
            })
            .map(room => {
              console.log('Processing room:', room.id, 'Participants:', room.participants);
              const otherParticipant = room.participants.find(p => {
                console.log('Checking participant:', p.id, p.username, 'vs user.id:', user.id, 'p.id !== user.id:', p.id !== user.id);
                return p.id !== user.id;
              });
              console.log('Other participant found:', otherParticipant);
              if (otherParticipant) {
                const chatUser = `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim().toUpperCase() || otherParticipant.username.toUpperCase();
                console.log('Chat user set to:', chatUser);
                return {
                  id: room.id,
                  userId: otherParticipant.id,
                  user: chatUser,
                  avatar: 'user',
                  lastMessage: room.last_message?.content ?? 'No messages',
                  time: room.updated_at ? new Date(room.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                  unread: room.unread_count || 0,
                  online: true,
                  isStaff: false,
                  room: room,
                  messages: []
                };
              }
              return null;
            })
            .filter(chat => chat !== null);
          console.log('Final userChats:', userChats);
          chatList = userChats;
        } else {
          // Normal user view: show all staff users
          const staffChats = staffUsers.map(staff => {
            const existingRoom = conversations.find(room => 
              room.participants.some(p => p.id === staff.id)
            );
            return {
              id: existingRoom ? existingRoom.id : `staff-${staff.id}`,
              userId: staff.id,
              user: `${staff.first_name} ${staff.last_name}`.trim().toUpperCase() || staff.username.toUpperCase(),
              avatar: 'staff',
              lastMessage: existingRoom ? (existingRoom.last_message?.content ?? 'No messages') : 'Start a conversation',
              time: existingRoom && existingRoom.updated_at ? new Date(existingRoom.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              unread: existingRoom ? (existingRoom.unread_count || 0) : 0,
              online: true,
              isStaff: true,
              room: existingRoom,
              messages: []
            };
          });
          chatList = staffChats;
        }

        setChats(chatList);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setChats([]);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Auto-scroll to bottom when messages change or typing indicator appears
  useEffect(() => {
    // Scroll mobile container
    if (mobileMessagesRef.current) {
      mobileMessagesRef.current.scrollTop = mobileMessagesRef.current.scrollHeight;
    }
    // Scroll desktop container
    if (desktopMessagesRef.current) {
      desktopMessagesRef.current.scrollTop = desktopMessagesRef.current.scrollHeight;
    }
  }, [selectedChat?.messages, otherUserTyping]);

  const handleChatSelect = async (chat) => {
    // Stop previous polling
    stopPolling();

    setSelectedChat(chat);
    if (chat.room) {
      // Load messages for existing room
      try {
        const messages = await chatApi.getMessages(chat.room.id);
        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          text: msg.content || 'Message content unavailable',
          photo: msg.image || null,
          sender: msg.sender.id === chat.userId ? 'agent' : 'me',
          time: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'
        }));
        
        setSelectedChat(prev => ({ ...prev, messages: formattedMessages }));
        
        // Start polling for this room
        startPolling(chat.room.id);
        startTypingPoll(chat.room.id);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    } else {
      // Start new chat with staff user
      try {
        const room = await chatApi.startChatWithUser(chat.userId);
        setSelectedChat(prev => ({ ...prev, room, id: room.id, messages: [] }));
        // Start polling for the new room
        startPolling(room.id);
        startTypingPoll(room.id);
        // Refresh the chat list
        const [staffUsers, conversations] = await Promise.all([
          chatApi.getStaffUsers(),
          chatApi.getConversations()
        ]);
        const staffChats = staffUsers.map(user => {
          const existingRoom = conversations.find(r => 
            r.participants.some(p => p.id === user.id)
          );
          return {
            id: existingRoom ? existingRoom.id : `staff-${user.id}`,
            userId: user.id,
            user: `${user.first_name} ${user.last_name}`.trim().toUpperCase() || user.username.toUpperCase(),
            avatar: 'staff',
            lastMessage: existingRoom ? (existingRoom.last_message?.content ?? 'No messages') : 'Start a conversation',
            time: existingRoom && existingRoom.updated_at ? new Date(existingRoom.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: existingRoom ? (existingRoom.unread_count || 0) : 0,
            online: true,
            isStaff: true,
            room: existingRoom,
            messages: []
          };
        });
        setChats(staffChats);
      } catch (error) {
        console.error('Failed to start chat:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedPhoto) || !selectedChat?.room) return;

    // Capitalize first letter if there's a message
    const capitalizedMessage = message.trim() ? message.charAt(0).toUpperCase() + message.slice(1) : '';

    try {
      let imageFile = null;
      
      // Convert base64 to File if there's a selected photo
      if (selectedPhoto) {
        // selectedPhoto is a data URL like "data:image/jpeg;base64,BASE64DATA"
        const dataUrlParts = selectedPhoto.split(',');
        const mimeType = dataUrlParts[0].split(':')[1].split(';')[0];
        const base64Data = dataUrlParts[1];
        
        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        imageFile = new File([bytes], 'photo.jpg', { type: mimeType });
      }
      
      const sentMessage = await chatApi.sendMessage(selectedChat.room.id, capitalizedMessage, imageFile);
      
      const newMessage = {
        id: sentMessage.id,
        text: sentMessage.content || capitalizedMessage,
        photo: sentMessage.image || selectedPhoto,
        sender: 'me',
        time: sentMessage.created_at ? new Date(sentMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: sentMessage.content || 'Photo',
        time: 'now'
      }));

      setMessage('');
      setSelectedPhoto(null);
      
      // Clear typing timeout and send typing stopped
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      sendTypingStatus(selectedChat.room.id, false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (selectedChat) {
                setSelectedChat(null);
              } else {
                window.history.back();
              }
            }}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {selectedChat ? selectedChat.user : 'Messages'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)]">
        {/* Mobile: Show chat list or chat detail */}
        <div className="h-full md:hidden">
          {!selectedChat ? (
            /* Mobile Chat List */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className="w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                          {chat.avatar === 'staff' ? <Headphones size={20} /> : <User size={20} />}
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">{chat.user}</h3>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">{chat.unread}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Mobile Chat Detail */
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div ref={mobileMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-blue-500 text-white'
                          : msg.sender === 'agent'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.photo && (
                        <div className="mb-2">
                          <img
                            src={msg.photo}
                            alt="Attachment"
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => window.open(msg.photo, '_blank')}
                          />
                        </div>
                      )}
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                {selectedPhoto && (
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={selectedPhoto}
                        alt="Attachment"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">Photo selected</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={handlePhotoButtonClick}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Camera size={20} />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !selectedPhoto}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Two-panel layout */}
        <div className="hidden md:flex h-full">
          {/* Chat List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedChat?.id === chat.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                        {chat.avatar === 'staff' ? <Headphones size={20} /> : <User size={20} />}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{chat.user}</h3>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Detail */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                      {selectedChat.avatar === 'staff' ? <Headphones size={16} /> : <User size={16} />}
                    </div>
                    {selectedChat.online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChat.user}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div ref={desktopMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'me'
                            ? 'bg-blue-500 text-white'
                            : msg.sender === 'agent'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {msg.photo && (
                          <div className="mb-2">
                            <img
                              src={msg.photo}
                              alt="Attachment"
                              className="max-w-full h-auto rounded-lg cursor-pointer"
                              onClick={() => window.open(msg.photo, '_blank')}
                            />
                          </div>
                        )}
                        {msg.text && <p className="text-sm">{msg.text}</p>}
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  {otherUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  {selectedPhoto && (
                    <div className="mb-2 flex items-center gap-2">
                      <div className="relative">
                        <img
                          src={selectedPhoto}
                          alt="Attachment"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setSelectedPhoto(null)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">Photo selected</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={handlePhotoButtonClick}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Camera size={20} />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim() && !selectedPhoto}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a chat from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
