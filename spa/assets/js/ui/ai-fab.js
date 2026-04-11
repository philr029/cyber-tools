/**
 * ai-fab.js — Floating AI Assistant button + expandable chat panel.
 *
 * Injects a fixed bottom-right FAB and a chat panel into the document.
 * The panel uses a simple mock-reply engine for demonstration purposes.
 */

/* ── Public ─────────────────────────────────────────────────────── */

export function initAiFab() {
  const root = document.createElement('div');
  root.id    = 'ai-fab-root';
  root.innerHTML = _template();
  document.body.appendChild(root);

  const btn    = document.getElementById('ai-fab-btn');
  const panel  = document.getElementById('ai-fab-panel');
  const close  = document.getElementById('ai-fab-close');
  const input  = document.getElementById('ai-fab-input');
  const send   = document.getElementById('ai-fab-send');
  const msgs   = document.getElementById('ai-fab-messages');

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    panel?.classList.toggle('ai-fab__panel--open', isOpen);
    btn?.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      input?.focus();
    }
  }

  btn?.addEventListener('click',  toggle);
  close?.addEventListener('click', toggle);

  send?.addEventListener('click',  () => _sendMessage(input, msgs));
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _sendMessage(input, msgs);
    }
  });

  // Close panel when clicking outside
  document.addEventListener('click', e => {
    if (!isOpen) return;
    if (root.contains(e.target)) return;
    toggle();
  });
}

/* ── Chat helpers ───────────────────────────────────────────────── */

function _sendMessage(input, msgs) {
  const text = input?.value?.trim();
  if (!text || !msgs) return;

  // Append user bubble
  msgs.insertAdjacentHTML('beforeend', `
    <div class="ai-msg ai-msg--user" role="listitem">${_esc(text)}</div>
  `);
  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Typing indicator
  const typingId = `ai-typing-${Date.now()}`;
  msgs.insertAdjacentHTML('beforeend', `
    <div class="ai-msg ai-msg--assistant" id="${typingId}" role="listitem" aria-label="Typing">
      <span class="ai-typing" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </div>
  `);
  msgs.scrollTop = msgs.scrollHeight;

  // Mock reply after short delay
  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) {
      typingEl.removeAttribute('id');
      typingEl.innerHTML = _esc(_mockReply(text));
    }
    msgs.scrollTop = msgs.scrollHeight;
  }, 1300);
}

const _REPLIES = [
  'Based on common threat indicators, this target appears low-risk. No active blacklist matches were found.',
  'I\'ve noticed several warning signs here. The domain was registered recently and has no established reputation.',
  'This IP address has been associated with automated scanning activity in the past 30 days.',
  'The email domain has valid MX records and no known data-breach history — looks legitimate.',
  'I\'d recommend further manual investigation. Multiple threat feeds have flagged this entry as suspicious.',
  'The SSL certificate is valid and the domain has a clean 5-year registration history. Looks safe.',
  'Phone numbers registered through VoIP providers are commonly used in phishing campaigns. Exercise caution.',
];

function _mockReply() {
  return _REPLIES[Math.floor(Math.random() * _REPLIES.length)];
}

function _esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* ── Template ───────────────────────────────────────────────────── */

function _template() {
  return `
    <button
      id="ai-fab-btn"
      class="ai-fab__btn"
      aria-label="Open AI Assistant"
      aria-expanded="false"
      aria-controls="ai-fab-panel"
      title="AI Assistant"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
        <path d="M8 16.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM4 10.75C4
          8.403 6.176 6.647 8.59 6.868a34.63 34.63 0 0 0 4.82 0C15.824 6.647 18 8.403 18
          10.75v1.5a1.217 1.217 0 0 1-.997 1.217c-1.099.19-3.042.45-5.503.45s-4.404-.26-5.503-.45A1.217
          1.217 0 0 1 4 12.25v-1.5zm5.9-1.075a.325.325 0 0 0-.282.088l-1.196 1.17a32.2 32.2 0 0
          1-2.432-.238.325.325 0 0 0-.088.643c.715.099 1.601.194 2.626.252a.325.325 0 0 0
          .246-.093l.98-.956 1.1 2.223a.325.325 0 0 0 .525.08l1.212-1.261a32.87 32.87 0 0 0
          2.499-.244.325.325 0 0 0-.088-.643c-.699.097-1.568.188-2.571.246a.325.325 0 0
          0-.216.098l-.98 1.021-1.094-2.21a.325.325 0 0 0-.242-.177zM11 2C5.477 2 1 6.477 1
          12a.5.5 0 0 0 1 0C2 7.03 6.03 3 11 3s9 4.03 9 9a.5.5 0 0 0 1 0c0-5.523-4.477-10-10-10z"/>
      </svg>
      <span class="ai-fab__pulse" aria-hidden="true"></span>
    </button>

    <div
      id="ai-fab-panel"
      class="ai-fab__panel"
      role="dialog"
      aria-label="AI Assistant"
      aria-modal="true"
    >
      <div class="ai-fab__panel-header">
        <div class="ai-fab__panel-title">
          <span class="ai-fab__panel-dot" aria-hidden="true"></span>
          AI Assistant
          <span class="ai-fab__panel-badge">Beta</span>
        </div>
        <button
          id="ai-fab-close"
          class="ai-fab__close-btn"
          aria-label="Close AI Assistant"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M3.22 3.22a.75.75 0 0 1 1.06 0L7 5.94l2.72-2.72a.75.75 0 1 1 1.06
              1.06L8.06 7l2.72 2.72a.75.75 0 1 1-1.06 1.06L7 8.06l-2.72 2.72a.75.75 0 0
              1-1.06-1.06L5.94 7 3.22 4.28a.75.75 0 0 1 0-1.06z"/>
          </svg>
        </button>
      </div>

      <div id="ai-fab-messages" class="ai-fab__messages" role="list" aria-live="polite" aria-atomic="false">
        <div class="ai-msg ai-msg--assistant" role="listitem">
          Hello! I'm your AI security assistant. Ask me about threats, scan results, or get advice
          on any target you've analysed.
        </div>
      </div>

      <div class="ai-fab__input-row">
        <input
          id="ai-fab-input"
          class="ai-fab__input"
          type="text"
          placeholder="Ask about a scan result…"
          autocomplete="off"
          maxlength="500"
          aria-label="Type a message to the AI assistant"
        />
        <button
          id="ai-fab-send"
          class="ai-fab__send-btn"
          aria-label="Send message"
          title="Send"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M1.5 13.5 13 7 1.5.5v4.75L10 7l-8.5 1.75z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}
