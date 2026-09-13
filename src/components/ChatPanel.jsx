import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'

export default function ChatPanel({ messages, onSend, selfId, visible }) {
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, visible])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className={`chat-panel toon-panel ${visible ? '' : 'panel-hidden'}`}>
      <div className="chat-header">
        <strong><i className="bi bi-chat-left-text" style={{marginRight:8}}></i>Chat</strong>
        <span className="chat-hint">dica: digite "2d20 3d10 1d6" pra rolar dados</span>
      </div>

      <div className="chat-messages" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.senderId === selfId ? 'own' : ''}`}>
            <Avatar name={m.name} src={m.avatar} size={26} />
            <div className="chat-bubble">
              <div className="chat-meta">
                <span className="chat-name">{m.name}</span>
                <span className="chat-time">
                  {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="chat-text">{m.text}</div>

              {m.dice && (
                <div className="dice-result">
                  {m.dice.groups.map((g, i) => (
                    <div key={i} className="dice-group">
                      <span className="dice-label">{g.raw}:</span> [{g.rolls.join(', ')}] ={' '}
                      <b>{g.subtotal}</b>
                    </div>
                  ))}
                  {m.dice.groups.length > 1 && (
                    <div className="dice-total"><i className="bi bi-dice-5" style={{marginRight:6}}></i> Total: {m.dice.total}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="chat-empty">Nenhuma mensagem ainda. Diga oi! <i className="bi bi-hand-thumbs-up"></i></div>
        )}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          className="toon-input"
          placeholder="Mensagem ou dados (ex: 2d20 1d6)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="toon-btn primary" type="submit">
          Enviar
        </button>
      </form>
    </div>
  )
}
