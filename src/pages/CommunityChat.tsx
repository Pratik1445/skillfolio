import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  query, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, User, Clock, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
  status: 'sent' | 'delivered' | 'read';
  isPending?: boolean;
}

interface SkillCommunity {
  id: string;
  name: string;
  description: string;
  members: string[];
  topics: string[];
  icon: string;
}

export default function CommunityChat() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState<SkillCommunity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (!communityId || !user) return;

    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeOnlineMembers: (() => void) | undefined;

    const setupChat = async () => {
      try {
        // Fetch community details
        const communityDoc = await getDoc(doc(db, 'skillCommunities', communityId));
        if (communityDoc.exists()) {
          setCommunity({ id: communityDoc.id, ...communityDoc.data() } as SkillCommunity);
        } else {
          setError('Community not found');
          return;
        }

        // Create messages collection if it doesn't exist
        const messagesCollectionRef = collection(db, `skillCommunities/${communityId}/messages`);

        // Subscribe to messages with real-time updates
        const messagesQuery = query(
          messagesCollectionRef,
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt
            }))
            .reverse();
          
          setMessages(newMessages as Message[]);
          setLoading(false);
          scrollToBottom();
        }, (error) => {
          console.error('Error fetching messages:', error);
          setError('Failed to load messages');
          setLoading(false);
        });

        // Update online status
        const userStatusRef = doc(db, `skillCommunities/${communityId}/onlineMembers`, user.uid);
        await setDoc(userStatusRef, {
          online: true,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || 'Anonymous'
        });

        // Subscribe to online members
        const onlineMembersQuery = query(
          collection(db, `skillCommunities/${communityId}/onlineMembers`)
        );

        unsubscribeOnlineMembers = onSnapshot(onlineMembersQuery, (snapshot) => {
          const online = snapshot.docs.map(doc => doc.id);
          setOnlineMembers(online);
        });

      } catch (error) {
        console.error('Error setting up chat:', error);
        setError('Failed to set up chat. Please try again.');
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeOnlineMembers) unsubscribeOnlineMembers();
      
      // Set user as offline when leaving
      if (communityId && user) {
        const userStatusRef = doc(db, `skillCommunities/${communityId}/onlineMembers`, user.uid);
        setDoc(userStatusRef, {
          online: false,
          lastSeen: serverTimestamp()
        }).catch(error => {
          console.error('Error updating offline status:', error);
        });
      }
    };
  }, [communityId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !communityId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      // Add the message to Firestore
      await addDoc(collection(db, `skillCommunities/${communityId}/messages`), {
        text: messageText,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        status: 'sent'
      });

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const allMessages = [...messages, ...pendingMessages].sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">Community not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="border-b px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/community')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold">{community.name}</h1>
                  <p className="text-sm text-gray-500">{onlineMembers.length} online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Main Chat Area */}
            <div className="md:col-span-3 h-[calc(100vh-16rem)] flex flex-col">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              >
                {allMessages.map((message, index) => {
                  const isFirstMessageOfDay = index === 0 || 
                    formatDate(message.createdAt) !== formatDate(allMessages[index - 1].createdAt);
                  const isCurrentUser = message.userId === user?.uid;

                  return (
                    <React.Fragment key={message.id}>
                      {isFirstMessageOfDay && (
                        <div className="flex justify-center my-4">
                          <span className="px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      )}
                      <div 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                          message.isPending ? 'opacity-70' : ''
                        }`}
                      >
                        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          {!isCurrentUser && (
                            <div className="text-sm text-gray-500 mb-1 ml-2">
                              {message.userName}
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isCurrentUser 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-gray-100 rounded-tl-none'
                            }`}
                          >
                            <div className="text-sm">{message.text}</div>
                            <div className="text-xs mt-1 flex items-center justify-end space-x-1">
                              <span className={isCurrentUser ? 'text-gray-300' : 'text-gray-500'}>
                                {formatTime(message.createdAt)}
                              </span>
                              {isCurrentUser && (
                                <span>
                                  {message.isPending && <Clock className="h-3 w-3 animate-pulse" />}
                                  {!message.isPending && message.status === 'sent' && <Clock className="h-3 w-3" />}
                                  {message.status === 'delivered' && <Check className="h-3 w-3" />}
                                  {message.status === 'read' && <CheckCheck className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t px-6 py-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-black text-white rounded-full p-3 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Online Members Sidebar */}
            <div className="hidden md:block border-l">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Online Members</h2>
                <div className="space-y-4">
                  {onlineMembers.map((memberId) => (
                    <div key={memberId} className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {messages.find(m => m.userId === memberId)?.userName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-green-500">Online</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 