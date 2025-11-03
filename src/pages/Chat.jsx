import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Avatar, message, Modal } from 'antd';
import { SendOutlined, ArrowLeftOutlined, MenuOutlined, UserOutlined, PlayCircleOutlined, AudioOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/AiIcon.png';
import AudioHandler from '../components/AudioHandler';

import '../style/Chat.scss';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isProcessingModalVisible, setIsProcessingModalVisible] = useState(false);
  const [isPlaybackModalVisible, setIsPlaybackModalVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const waveformBarsRef = useRef([]);
  const animationRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/api/auth/chat-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: currentQuery,
          user_id: user.id,
          token: token,
          assistantId: 'yoga_assistant',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: data.data.answerrr,
          sender: 'ai',
          timestamp: new Date(),
          audioUrl: null, // Will be set if voice response is generated
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: data.message || 'Failed to get response from AI',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startProcessingAnimation = () => {
    if (waveformBarsRef.current.length === 0) return;

    animationRef.current = gsap.timeline({ repeat: -1 });

    waveformBarsRef.current.forEach((bar, index) => {
      const delay = index * 0.1;
      const height = Math.random() * 40 + 10; // Random height between 10-50

      animationRef.current.to(bar, {
        height: height,
        duration: 0.3,
        ease: "power2.inOut",
        delay: delay
      }, 0);
    });
  };

  const stopProcessingAnimation = () => {
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;

      // Reset bars to default height
      waveformBarsRef.current.forEach((bar) => {
        gsap.to(bar, {
          height: 10,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    }
  };

  const handleAudioRecorded = async (audioBlob) => {
    setIsLoading(true);
    setIsProcessingModalVisible(true);
    startProcessingAnimation();
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('user_id', user.id);
      formData.append('token', token);
      formData.append('assistantId', 'yoga_assistant');
      formData.append('voiceId', 'Joanna');
      formData.append('languageCode', 'en-US');

      const response = await fetch(`${API_BASE_URL}/api/voice/voice-to-voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Add user audio message (transcribed text)
        const userMessage = {
          id: Date.now(),
          text: data.data.transcribedText,
          sender: 'user',
          timestamp: new Date(),
          audioUrl: data.data.inputAudioUrl,
        };
        setMessages(prev => [...prev, userMessage]);

        // Add AI response with audio
        const aiMessage = {
          id: Date.now() + 1,
          text: data.data.aiTextResponse,
          sender: 'ai',
          timestamp: new Date(),
          audioUrl: data.data.outputAudioUrl,
        };
        setMessages(prev => [...prev, aiMessage]);

        // Show playback modal and automatically play the AI audio response
        setIsProcessingModalVisible(false);
        stopProcessingAnimation();
        setIsPlaybackModalVisible(true);
        startPlaybackAnimation();
        const audio = new Audio(data.data.outputAudioUrl);
        audio.play();
        setPlayingMessageId(aiMessage.id);
        setIsAudioPlaying(true);
        audio.onended = () => {
          setPlayingMessageId(null);
          setIsAudioPlaying(false);
          setIsPlaybackModalVisible(false);
          stopPlaybackAnimation();
        };
      } else {
        message.error(data.error || 'Failed to process voice message');
      }
    } catch (error) {
      console.error('Voice API error:', error);
      message.error('Failed to process voice message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioPlay = (isPlaying) => {
    setIsAudioPlaying(isPlaying);
  };

  const handleMessageAudioPlay = (messageId, audioUrl) => {
    if (playingMessageId === messageId) {
      setPlayingMessageId(null);
      setIsAudioPlaying(false);
    } else {
      setPlayingMessageId(messageId);
      setIsAudioPlaying(true);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setPlayingMessageId(null);
        setIsAudioPlaying(false);
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchChatList = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/api/auth/chat-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          token: token,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatList(data.data.chats || []);
      } else {
        console.error('Failed to fetch chat list:', data.message);
      }
    } catch (error) {
      console.error('Chat list API error:', error);
    }
  };

  const handleChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/api/auth/chat-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: user.id,
          token: token,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const historyMessages = [];
        data.data.history.forEach((msg, index) => {
          // Add user question
          historyMessages.push({
            id: Date.now() + index * 2,
            text: msg.question,
            sender: 'user',
            timestamp: new Date(msg.created_at),
          });
          // Add AI answer
          historyMessages.push({
            id: Date.now() + index * 2 + 1,
            text: msg.answer,
            sender: 'ai',
            timestamp: new Date(msg.updated_at),
          });
        });
        setMessages(historyMessages);
      } else {
        console.error('Failed to fetch chat history:', data.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('Chat history API error:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      fetchChatList();
    }
  }, [sidebarOpen]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Button
          type="text"
          className="chat-toggle-button"
          icon={<MenuOutlined />}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="chat-logo-container">
          <img src={logoImage} alt="ZenAI Logo" className="chat-logo" />
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <img src={logoImage} alt="ZenAI Logo" className="chat-welcome-logo" />
            <div className="chat-welcome-text">
              Welcome to ZenAI! How can I help you today?
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message chat-message-${message.sender}`}
            >
              <Avatar
                className="chat-message-avatar"
                icon={message.sender === 'user' ? <UserOutlined /> : null}
                src={message.sender === 'ai' ? logoImage : null}
                size={40}
              />
              <div className="chat-message-body">
                <div className="chat-message-content">
                  {message.text}
                </div>
                {message.audioUrl && message.sender === 'ai' && (
                  <div className="chat-message-audio">
                    <Button
                      type="text"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleMessageAudioPlay(message.id, message.audioUrl)}
                      className="chat-message-play-button"
                      size="small"
                    >
                      {playingMessageId === message.id ? 'Playing...' : 'Play Audio'}
                    </Button>
                    {playingMessageId === message.id && (
                      <div className="audio-playback-circle">
                        <PlayCircleOutlined />
                      </div>
                    )}
                  </div>
                )}
                <div className="chat-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <Input
            className="chat-input"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleKeyPress}
            suffix={
              <div className="chat-input-suffix">
                <AudioHandler
                  onAudioRecorded={handleAudioRecorded}
                  onAudioPlay={handleAudioPlay}
                  isPlaying={isAudioPlaying}
                />
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="chat-send-button"
                  loading={isLoading}
                />
              </div>
            }
          />
        </div>
      </div>

      {sidebarOpen && (
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>Chat History</h3>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setSidebarOpen(false)}
            />
          </div>
          <div className="chat-list">
            {chatList.length === 0 ? (
              <div className="chat-list-empty">No chats available</div>
            ) : (
              chatList.map((chat) => (
                <div
                  key={chat.chat_id}
                  className={`chat-list-item ${selectedChatId === chat.chat_id ? 'active' : ''}`}
                  onClick={() => handleChatSelect(chat.chat_id)}
                >
                  <div className="chat-list-title">{chat.first_question || `Chat ${chat.chat_id}`}</div>
                  <div className="chat-list-date">{new Date(chat.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <Modal
        open={isProcessingModalVisible}
        footer={null}
        closable={false}
        centered
        className="audio-recording-modal"
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="audio-recording-content">
          <div className="audio-animation-container">
            <div className="waveform-container">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  ref={(el) => (waveformBarsRef.current[i] = el)}
                  className="waveform-bar"
                  style={{
                    width: '3px',
                    height: '10px',
                    backgroundColor: '#ff4d4f',
                    borderRadius: '2px',
                    margin: '0 1px',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ color: 'white', fontSize: '16px', textAlign: 'center', marginTop: '20px' }}>
            AI is listening to you...
          </div>
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => {
              setIsProcessingModalVisible(false);
              setIsLoading(false);
            }}
            className="audio-cancel-button"
            size="large"
          />
        </div>
      </Modal>

      {/* Playback Modal */}
      <Modal
        open={isPlaybackModalVisible}
        footer={null}
        closable={false}
        centered
        className="audio-recording-modal"
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="audio-recording-content">
          <div className="audio-animation-container">
            <div className="waveform-container">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  ref={(el) => (waveformBarsRef.current[i] = el)}
                  className="waveform-bar"
                  style={{
                    width: '3px',
                    height: '10px',
                    backgroundColor: '#52c41a',
                    borderRadius: '2px',
                    margin: '0 1px',
                    transformOrigin: 'bottom'
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ color: 'white', fontSize: '16px', textAlign: 'center', marginTop: '20px' }}>
            AI is speaking...
          </div>
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
            onClick={() => {
              setIsPlaybackModalVisible(false);
              setPlayingMessageId(null);
              setIsAudioPlaying(false);
            }}
            className="audio-cancel-button"
            size="large"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
