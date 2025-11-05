import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, message, Dropdown, Menu } from "antd";
import {
  SendOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  UserOutlined,
  PlayCircleOutlined,
  LogoutOutlined,
  CopyOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/AiIcon.jpg";
import AudioHandler from "../components/AudioHandler";

import "../style/Chat.scss";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue("");
    setIsLoading(true);

    const typingMessage = {
      id: "typing-indicator",
      text: "",
      sender: "ai",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`${API_BASE_URL}/api/auth/chat-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: currentQuery,
          user_id: user.id,
          token: token,
          assistantId: "yoga_assistant",
          ...(selectedChatId && { chat_id: selectedChatId }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );

        const aiMessage = {
          id: Date.now() + 1,
          text: data.data.answer,
          sender: "ai",
          timestamp: new Date(),
          audioUrl: null, // Will be set if voice response is generated
        };
        setMessages((prev) => [...prev, aiMessage]);

        // If this was a new chat, update selectedChatId
        if (!selectedChatId) {
          setSelectedChatId(data.data.chat_id);
        }
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );

        const errorMessage = {
          id: Date.now() + 1,
          text: data.message || "Failed to get response from AI",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "typing-indicator")
      );

      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioRecorded = async (audioBlob) => {
    setIsLoading(true);

    // Add typing indicator for AI response
    const typingMessage = {
      id: "typing-indicator",
      text: "",
      sender: "ai",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("user_id", user.id);
      formData.append("token", token);
      formData.append("assistantId", "yoga_assistant");
      formData.append("voiceId", "Joanna");
      formData.append("languageCode", "en-US");

      const response = await fetch(`${API_BASE_URL}/api/voice/voice-to-voice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Remove typing indicator
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );

        // Add user audio message (transcribed text)
        const userMessage = {
          id: Date.now(),
          text: data.data.transcribedText,
          sender: "user",
          timestamp: new Date(),
          audioUrl: data.data.inputAudioUrl,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Add AI response with audio
        const aiMessage = {
          id: Date.now() + 1,
          text: data.data.aiTextResponse,
          sender: "ai",
          timestamp: new Date(),
          audioUrl: data.data.outputAudioUrl,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Automatically play the AI audio response
        const audio = new Audio(data.data.outputAudioUrl);
        try {
          setIsPlaying(true);
          await audio.play();
          audio.onended = () => {
            setIsPlaying(false);
          };
        } catch (error) {
          console.error("Autoplay failed:", error);
          message.warning(
            "Autoplay blocked by browser. Please click the play button to hear the response."
          );
          setIsPlaying(false);
        }
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );
        message.error(data.error || "Failed to process voice message");
      }
    } catch (error) {
      console.error("Voice API error:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "typing-indicator")
      );
      message.error("Failed to process voice message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const fetchChatList = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(`${API_BASE_URL}/api/auth/chat-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        console.error("Failed to fetch chat list:", data.message);
      }
    } catch (error) {
      console.error("Chat list API error:", error);
    }
  };

  const handleChatSelect = async (chatId) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(`${API_BASE_URL}/api/auth/chat-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
            sender: "user",
            timestamp: new Date(msg.created_at),
          });
          // Add AI answer
          historyMessages.push({
            id: Date.now() + index * 2 + 1,
            text: msg.answer,
            sender: "ai",
            timestamp: new Date(msg.updated_at),
          });
        });
        setMessages(historyMessages);
      } else {
        console.error("Failed to fetch chat history:", data.message);
        setMessages([]);
      }
    } catch (error) {
      console.error("Chat history API error:", error);
      setMessages([]);
    }
  };

  const handleRegenerate = async (messageId) => {
    // Find the user message that precedes this AI message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.sender !== "user") return;

    // Remove the current AI message and any messages after it
    setMessages(prev => prev.slice(0, messageIndex));
    setIsLoading(true);

    const typingMessage = {
      id: "typing-indicator",
      text: "",
      sender: "ai",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch(`${API_BASE_URL}/api/auth/chat-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: userMessage.text,
          user_id: user.id,
          token: token,
          assistantId: "yoga_assistant",
          ...(selectedChatId && { chat_id: selectedChatId }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );

        const aiMessage = {
          id: Date.now() + 1,
          text: data.data.answer,
          sender: "ai",
          timestamp: new Date(),
          audioUrl: null,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // If this was a new chat, update selectedChatId
        if (!selectedChatId) {
          setSelectedChatId(data.data.chat_id);
        }
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== "typing-indicator")
        );

        const errorMessage = {
          id: Date.now() + 1,
          text: data.message || "Failed to regenerate response",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Regenerate API error:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== "typing-indicator")
      );

      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error while regenerating. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      fetchChatList();
    }
  }, [sidebarOpen]);

  return (
    <div className={`chat-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="chat-main">
        <div className="chat-header">
          
          <Button
            type="text"
            className="chat-toggle-button"
            icon={<MenuOutlined />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="chat-logo-container">
            <h1>Drona AI</h1>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <img
                src={logoImage}
                alt="ZenAI Logo"
                className="chat-welcome-logo"
              />
              <div className="chat-welcome-text">
                Welcome to Drona How can I help you today?
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message-${message.sender}`}
              >
                <Avatar
                  className={`chat-message-avatar ${
                    isRecording && message.sender === "ai" ? "recording" : ""
                  } ${isPlaying && message.sender === "ai" ? "playing" : ""}`}
                  src={message.sender === "ai" ? logoImage : null}
                  size={50}
                >
                  {message.sender === "user" ? user.email.charAt(0).toUpperCase() : null}
                </Avatar>
                <div className="chat-message-body">
                  <div className="chat-message-sender-name">
                    {message.sender === "ai" ? "Drona" : "You"}
                  </div>
                  <div className="chat-message-content">
                    {message.isTyping ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      message.text
                    )}
                  </div>
                  {message.audioUrl && message.sender === "ai" && (
                    <div className="chat-message-audio">
                     
                    </div>
                  )}
                  {!message.isTyping && (
                    <div className="chat-message-actions">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          message.info('Copied to clipboard');
                        }}
                        className="action-button"
                        title="Copy"
                      />
                      {message.sender === "ai" && (
                        <Button
                          type="text"
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => handleRegenerate(message.id)}
                          className="action-button"
                          title="Regenerate"
                        />
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
                  {!inputValue.trim() ? (
                    <AudioHandler
                      onAudioRecorded={handleAudioRecorded}
                      isLoading={isLoading}
                      isPlaying={isPlaying}
                      onRecordingStart={() => setIsRecording(true)}
                      onRecordingStop={() => setIsRecording(false)}
                    />
                  ) : (
                    <Button
                      type="text"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="chat-send-button"
                      loading={isLoading}
                    />
                  )}
                </div>
              }
            />
          </div>
        </div>
      </div>

      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <Button
            className="sidebar-new-chat-button"
            icon={<span style={{ fontSize: '18px' }}>+</span>}
            onClick={() => {
              setMessages([]);
              setSelectedChatId(null);
              setSidebarOpen(false);
            }}
          >
            New Chat
          </Button>
          {/* <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setSidebarOpen(false)}
            style={{ color: 'white' }}
          /> */}
        </div>
        <div className="chat-list">
          {chatList.length === 0 ? (
            <div className="chat-list-empty">No chats available</div>
          ) : (
            chatList.map((chat) => (
              <div
                key={chat.chat_id}
                className={`chat-list-item ${
                  selectedChatId === chat.chat_id ? "active" : ""
                }`}
                onClick={() => handleChatSelect(chat.chat_id)}
              >
                <div className="chat-list-title">
                  {chat.first_question || `Chat ${chat.chat_id}`}
                </div>
                <div className="chat-list-date">
                  {new Date(chat.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="chat-sidebar-footer">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  onClick: handleLogout,
                },
              ],
            }}
            trigger={['click']}
            placement="topRight"
          >
            <Button
              type="text"
              className="sidebar-profile-button"
              icon={<UserOutlined />}
            >
              <div className="profile-info">
                <span className="profile-label">Profile</span>
                <span className="profile-email">{user.email}</span>
              </div>
            </Button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Chat;
