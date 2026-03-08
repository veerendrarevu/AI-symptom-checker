import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./Chat.css"

// ─── SVG Icons (inline, no extra deps) ───────────────────────
const IconHeart = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
    <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 6l-1 14H6L5 6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 6V4h6v2" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round"/>
    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round"/>
    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconMessages = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── Component ────────────────────────────────────────────────
export default function Chat() {
  const [msg, setMsg]       = useState("")
  const [chat, setChat]     = useState([])
  const [chatId, setChatId] = useState(null)
  const [chats, setChats]   = useState([])
  const [theme, setTheme]   = useState(() =>
    localStorage.getItem("chat-theme") || "light"
  )
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const navigate       = useNavigate()

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("chat-theme", theme)
  }, [theme])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    const init = async () => {
      try { await loadChats() } catch (e) { console.error("error initializing chats", e) }
    }
    init()
  }, [])

  const loadChats = async () => {
    const res = await axios.get("http://localhost:8000/chat/")
    setChats(res.data)
    if (res.data.length > 0) {
      if (!chatId) selectChat(res.data[0].chat_id)
    }
  }

  const loadMessages = async (id) => {
    const res = await axios.get(`http://localhost:8000/chat/${id}`)
    const msgs = res.data.messages.map(m => {
      if (m.role === "user") return { user: m.content }
      return { bot: m.content }
    })
    setChat(msgs)
  }

  const selectChat = async (id) => {
    setChatId(id)
    setMsg("")
    setChat([])
    await loadMessages(id)
    inputRef.current?.focus()
  }

  const createNewChat = async () => {
    const title = prompt("Chat title", "New Session") || "New Session"
    try {
      const res = await axios.post("http://localhost:8000/chat/create", { title })
      const newSession = { chat_id: res.data.chat_id, title }
      setChats(prev => [...prev, newSession])
      selectChat(newSession.chat_id)
    } catch (e) { console.error("failed to create chat", e) }
  }

  const deleteCurrentChat = async () => {
    if (!chatId) return
    try {
      await axios.delete(`http://localhost:8000/chat/${chatId}`)
      setChats(prev => prev.filter(c => c.chat_id !== chatId))
      setChatId(null)
      setChat([])
    } catch (e) { console.error("failed to delete chat", e) }
  }

  const send = async () => {
    if (!chatId || !msg.trim()) return
    const outgoing = msg
    setMsg("")
    setChat(prev => [...prev, { user: outgoing, bot: null }])
    try {
      const res = await axios.post(`http://localhost:8000/chat/${chatId}/message`, { content: outgoing })
      setChat(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { user: outgoing, bot: res.data.response }
        return updated
      })
    } catch (e) {
      setChat(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { user: outgoing, bot: "Sorry, something went wrong. Please try again." }
        return updated
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    navigate("/login")
  }

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="chat-root">

      {/* ── Header ── */}
      <header className="chat-header">
        <div className="chat-header-brand">
          <div className="chat-header-logo">
            <IconHeart />
          </div>
          <h1 className="chat-header-title">
            Health<span>AI</span>
          </h1>
        </div>

        <div className="chat-header-actions">
          {/* Theme toggle */}
          <button
            className="main-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            <div className="main-theme-toggle-track">
              <div className="main-theme-toggle-thumb">
                {theme === "light" ? "☀️" : "🌙"}
              </div>
            </div>
          </button>

          {/* Logout */}
          <button className="btn-logout" onClick={logout}>
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="chat-body">

        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-label">Sessions</span>
            <button className="btn-new-chat" onClick={createNewChat}>
              <IconPlus />
              New Chat
            </button>
            <button
              className="btn-delete-chat"
              onClick={deleteCurrentChat}
              disabled={!chatId}
            >
              <IconTrash />
              Delete Chat
            </button>
          </div>

          <ul className="sidebar-chat-list">
            {chats.length === 0 ? (
              <li className="sidebar-empty">No sessions yet.<br />Create your first chat.</li>
            ) : (
              chats.map(c => (
                <li
                  key={c.chat_id}
                  className={`sidebar-chat-item ${c.chat_id === chatId ? "active" : ""}`}
                  onClick={() => selectChat(c.chat_id)}
                >
                  <div className="sidebar-chat-item-icon">
                    <IconChat />
                  </div>
                  <span className="sidebar-chat-item-text">
                    {c.title || "(untitled)"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* ── Chat Main ── */}
        <main className="chat-main">

          {!chatId ? (
            /* No chat selected */
            <div className="no-chat-selected">
              <IconMessages />
              <p>Select a session from the sidebar<br />or create a new one to get started.</p>
            </div>
          ) : chat.length === 0 ? (
            /* Empty chat — welcome state */
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <IconHeart />
              </div>
              <h3>How can I help you today?</h3>
              <p>Describe your symptoms and I'll help you understand what might be going on. I'm here to support you.</p>
            </div>
          ) : (
            /* Messages */
            <div className="chat-messages">
              {chat.map((c, i) => (
                <div key={i} className="message-row">
                  {/* User bubble */}
                  {c.user && (
                    <div className="bubble-wrapper user">
                      <div className="bubble-avatar user-avatar">You</div>
                      <div>
                        <div className="bubble-label">You</div>
                        <div className="bubble user">{c.user}</div>
                      </div>
                    </div>
                  )}

                  {/* Bot bubble */}
                  {c.bot === null ? (
                    /* Typing indicator */
                    <div className="bubble-wrapper bot">
                      <div className="bubble-avatar bot-avatar">
                        <IconHeart />
                      </div>
                      <div>
                        <div className="bubble-label">HealthAI</div>
                        <div className="typing-indicator">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      </div>
                    </div>
                  ) : c.bot ? (
                    <div className="bubble-wrapper bot">
                      <div className="bubble-avatar bot-avatar">
                        <IconHeart />
                      </div>
                      <div>
                        <div className="bubble-label">HealthAI</div>
                        <div className="bubble bot">{c.bot}</div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Input Area ── */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <input
                ref={inputRef}
                className="chat-input"
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatId ? "Describe your symptoms…" : "Select a chat to start…"}
                disabled={!chatId}
              />
              <button
                className="btn-send"
                onClick={send}
                disabled={!chatId || msg.trim() === ""}
                aria-label="Send message"
              >
                <IconSend />
              </button>
            </div>
            <p className="input-hint">
              HealthAI is not a substitute for professional medical advice.
            </p>
          </div>

        </main>
      </div>
    </div>
  )
}