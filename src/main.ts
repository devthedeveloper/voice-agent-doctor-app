import './style.css'
import { setupDoctorAgent } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Telephone Loader -->
  <div id="telephone-loader" class="telephone-loader" style="display: none;">
    <div class="loader-content">
      <div class="telephone-icon">
        <div class="phone-body">
          <div class="phone-screen"></div>
          <div class="phone-speaker"></div>
        </div>
        <div class="phone-waves">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
          <div class="wave wave-3"></div>
        </div>
      </div>
      <p class="loader-text">Connecting to Doctor...</p>
    </div>
  </div>

  <!-- Large Central Avatar Display -->
  <div class="avatar-section">
    <div class="avatar-container">
      <div class="avatar-header">
        <h2>Dr. AI Assistant</h2>
        <div id="connection-status" class="status-indicator disconnected">
          <span class="status-dot"></span>
          <span class="status-text">Disconnected</span>
        </div>
      </div>
      <div class="video-container">
        <video id="simli-video" autoplay muted playsinline></video>
        <audio id="simli-audio" autoplay></audio>
        <div class="avatar-placeholder" id="avatar-placeholder">
          <div class="doctor-avatar-large">
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="150" cy="150" r="150" fill="url(#doctorGradient)"/>
              <circle cx="150" cy="120" r="40" fill="#ffffff"/>
              <path d="M75 240c0-41.421 33.579-75 75-75s75 33.579 75 75" fill="#ffffff"/>
              <defs>
                <linearGradient id="doctorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
            <div class="stethoscope">🩺</div>
          </div>
          <p>Dr. AI Assistant</p>
          <p class="avatar-subtitle">Licensed Virtual Physician</p>
        </div>
      </div>
    </div>
  </div>

  <div class="doctor-interface">
    <!-- Modern Header with Glassmorphism -->
    <div class="header">
      <div class="header-background"></div>
      <div class="header-content">
        <div class="medical-icon">
          <div class="icon-glow">🩺</div>
        </div>
        <h1>AI Doctor Assistant</h1>
        <p class="subtitle">Advanced Medical Consultation Platform</p>
      </div>
    </div>
    
    <!-- Status Panel with Modern Design -->
    <div class="status-panel">
      <div id="microphone-status" class="status-card">
        <div class="status-icon">🎤</div>
        <div class="status-info">
          <span class="status-label">Microphone</span>
          <span class="status-value">Ready</span>
        </div>
      </div>
      <div class="status-card">
        <div class="status-icon">🔊</div>
        <div class="status-info">
          <span class="status-label">Audio</span>
          <span class="status-value">Active</span>
        </div>
      </div>
    </div>

    <div class="main-content">
        
      <!-- Conversation Panel -->
      <div class="conversation-panel">
        <div class="panel-header">
          <h3>Consultation Chat</h3>
          <div class="chat-status">
            <div class="typing-indicator" id="typing-indicator" style="display: none;">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div id="conversation-log" class="conversation-log">
          <div class="message system-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <strong>System:</strong> Welcome! I'm your AI doctor. I can help with medical consultations and prescribe medications. Please describe your symptoms or health concerns.
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Controls -->
      <div class="controls">
        <button id="connect-btn" type="button" class="primary-btn">
          <span class="btn-icon">📞</span>
          <span class="btn-text">Connect to Doctor</span>
          <div class="btn-glow"></div>
        </button>
        <button id="disconnect-btn" type="button" class="secondary-btn" disabled>
          <span class="btn-icon">📴</span>
          <span class="btn-text">End Consultation</span>
        </button>
      </div>

      <!-- Prescription Panel -->
      <div class="prescription-panel" id="prescription-panel" style="display: none;">
        <div class="panel-header">
          <h3>📋 Prescription</h3>
        </div>
        <div id="prescription-content" class="prescription-content">
          <!-- Prescriptions will be displayed here -->
        </div>
      </div>

      <!-- History Panel -->
      <div class="history-panel" id="history-panel">
        <div class="panel-header">
          <h3>📚 Consultation History</h3>
        </div>
        <div id="history-content" class="history-content">
          <div class="loading-history">
            <div class="loading-spinner"></div>
            <p>Loading consultation history...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      <p><strong>Disclaimer:</strong> This AI doctor is for demonstration purposes. Always consult with a real healthcare professional for actual medical advice.</p>
    </div>
  </div>
`

setupDoctorAgent(
  document.querySelector<HTMLButtonElement>('#connect-btn')!,
  document.querySelector<HTMLButtonElement>('#disconnect-btn')!
)
