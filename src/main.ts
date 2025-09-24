import './style.css'
import { setupDoctorAgent } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="doctor-interface">
    <div class="header">
      <div class="medical-icon">🩺</div>
      <h1>AI Doctor - Voice Assistant</h1>
      <p class="subtitle">Your personal medical consultation assistant</p>
    </div>
    
    <div class="status-panel">
      <div id="connection-status" class="status-indicator disconnected">
        <span class="status-dot"></span>
        <span class="status-text">Disconnected</span>
      </div>
      <div id="microphone-status" class="status-indicator">
        <span class="mic-icon">🎤</span>
        <span class="status-text">Microphone Ready</span>
      </div>
    </div>

    <div class="main-content">
      <div class="consultation-area">
        <div class="doctor-avatar">
          <div class="avatar-circle">
            <span class="doctor-emoji">👨‍⚕️</span>
          </div>
          <h3>Dr. AI Assistant</h3>
          <p>Licensed Virtual Physician</p>
        </div>
        
        <div class="conversation-panel">
          <div id="conversation-log" class="conversation-log">
            <div class="message system-message">
              <strong>System:</strong> Welcome! I'm your AI doctor. I can help with medical consultations and prescribe medications. Please describe your symptoms or health concerns.
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button id="connect-btn" type="button" class="primary-btn">
          Connect to Doctor
        </button>
        <button id="disconnect-btn" type="button" class="secondary-btn" disabled>
          End Consultation
        </button>
      </div>

      <div class="prescription-panel" id="prescription-panel" style="display: none;">
        <h3>📋 Prescription</h3>
        <div id="prescription-content" class="prescription-content">
          <!-- Prescriptions will be displayed here -->
        </div>
      </div>

      <div class="history-panel" id="history-panel">
        <h3>📚 Consultation History</h3>
        <div id="history-content" class="history-content">
          <p class="loading-history">Loading consultation history...</p>
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
