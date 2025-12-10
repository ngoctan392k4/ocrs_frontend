import React, { useState, useRef, useEffect } from "react";
import "../../../styles/student/Chatbot/Chatbot.css"; // File CSS ở dưới
import ReactMarkdown from "react-markdown";
import robot from '../../../assets/icon/robot.png'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your academic assistant. What can I ask you about?",
    },
    {
      sender: "bot",
      text: "Here are scopes that I can assist you!\n1. Your Learnig Progress\n2. Information about upcoming courses for the next semester\n3. The curriculum of student's major\n4. Prerequisite rules",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/student/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await response.json();
      if (data.message && data.message === "429") {
        const botMsg = {
          sender: "bot",
          text: "The system is too busy. Please try again later.",
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const botMsg = { sender: "bot", text: data.reply };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Lost connection. Please try again later." },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chatbot-widget">
      <button
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "X" : <img src={robot} alt="chatbot" />}
      </button>

      {/* Chat Container */}
      <div className={`chat-container ${isOpen ? "active" : ""}`}>
        <div className="chat-header">
          <h3>Education Assistant 🎓</h3>
        </div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="bubble">
                {msg.sender === "bot" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="bubble">Answering...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="What is your question?"
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
