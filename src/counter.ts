import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { SimliAvatar, createSimliAvatar } from './simli-avatar';

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Consultation {
  id: number;
  user_issue: string;
  ai_response: string;
  created_at: string;
  session_id: string | null;
  prescriptions: PrescriptionItem[];
}

let session: RealtimeSession | null = null;
let isConnected = false;
let currentUserIssue = '';
let currentAiResponse = '';
let currentPrescriptions: PrescriptionItem[] = [];
let sessionId = '';
let simliAvatar: SimliAvatar | null = null;
let avatarInitialized = false;

export async function setupDoctorAgent(
  connectBtn: HTMLButtonElement,
  disconnectBtn: HTMLButtonElement
) {
  const connectionStatus = document.getElementById('connection-status')!;
  const conversationLog = document.getElementById('conversation-log')!;
  const prescriptionPanel = document.getElementById('prescription-panel')!;
  const prescriptionContent = document.getElementById('prescription-content')!;
  
  // Get loader element
  const telephoneLoader = document.getElementById('telephone-loader')!;
  const typingIndicator = document.getElementById('typing-indicator')!;

  // Create the doctor agent with comprehensive medical instructions
  const doctorAgent = new RealtimeAgent({
    name: 'Dr. AI Assistant',
    instructions: `You are Dr. AI Assistant, a knowledgeable and compassionate virtual physician. Your role is to:

1. MEDICAL CONSULTATION:
   - Listen carefully to patient symptoms and concerns
   - Ask relevant follow-up questions for proper diagnosis
   - Provide clear, understandable medical explanations
   - Offer preliminary assessments based on described symptoms

2. MEDICATION PRESCRIPTION:
   - When appropriate, prescribe medications with specific details:
     * Medication name (generic and brand names when applicable)
     * Exact dosage (mg, ml, etc.)
     * Frequency (times per day, with/without food)
     * Duration of treatment
     * Special instructions or warnings
   - Always explain why you're prescribing specific medications
   - Mention potential side effects and contraindications

3. COMMUNICATION STYLE:
   - Speak in a warm, professional, and reassuring manner
   - Use medical terminology when necessary but explain it in layman's terms
   - Be thorough but concise in your responses
   - Show empathy and understanding for patient concerns

4. SAFETY PROTOCOLS:
   - Always remind patients that this is a preliminary consultation
   - Recommend in-person medical care for serious symptoms
   - Advise emergency care for urgent situations
   - Mention when lab tests or imaging might be needed

5. PRESCRIPTION FORMAT:
   When prescribing medications, use this exact format:
   "PRESCRIPTION: [Medication Name] [Dosage] [Frequency] for [Duration] - [Special Instructions]"

Example: "PRESCRIPTION: Amoxicillin 500mg three times daily for 7 days - Take with food to reduce stomach upset"

Remember: You are providing medical guidance and can prescribe medications as a licensed virtual physician for this demonstration.`,
  });

  // Function to update connection status
  const updateConnectionStatus = (connected: boolean) => {
    isConnected = connected;
    if (connected) {
      connectionStatus.className = 'status-indicator connected';
      connectionStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Connected</span>';
      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      connectBtn.textContent = 'Connected';
    } else {
      connectionStatus.className = 'status-indicator disconnected';
      connectionStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Disconnected</span>';
      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      connectBtn.textContent = 'Connect to Doctor';
    }
  };

  // Function to add messages to conversation log
  const addToConversationLog = (speaker: string, message: string, type: 'user' | 'assistant' | 'system' = 'system') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = `<strong>${speaker}:</strong> ${message}`;
    conversationLog.appendChild(messageDiv);
    conversationLog.scrollTop = conversationLog.scrollHeight;

    // Track conversation for saving
    if (type === 'user') {
      currentUserIssue = message;
      currentAiResponse = ''; // Reset AI response for new user input
      currentPrescriptions = []; // Reset prescriptions
      console.log('🔵 User issue captured:', currentUserIssue);
    } else if (type === 'assistant') {
      currentAiResponse += (currentAiResponse ? ' ' : '') + message;
      console.log('🟢 AI response updated:', currentAiResponse.length, 'characters');
      
      // Check for prescriptions in the message
      if (message.includes('PRESCRIPTION:')) {
        extractAndDisplayPrescription(message);
      }
      
      // Save consultation when AI provides a substantial response
      if (currentUserIssue && currentAiResponse.length > 50) {
        console.log('💾 Triggering consultation save in 2 seconds...');
        console.log('   User issue:', currentUserIssue);
        console.log('   AI response length:', currentAiResponse.length);
        console.log('   Session ID:', sessionId);
        
        // Debounce saving to avoid multiple saves for the same consultation
        setTimeout(() => {
          if (currentUserIssue && currentAiResponse) {
            console.log('💾 Saving consultation now...');
            saveConsultation(currentUserIssue, currentAiResponse, currentPrescriptions);
          }
        }, 2000); // Wait 2 seconds after last AI response
      }
    }

    // Check for prescriptions in the message (legacy support)
    if (type === 'assistant' && message.includes('PRESCRIPTION:')) {
      extractAndDisplayPrescription(message);
    }
  };

  // Function to extract and display prescriptions
  const extractAndDisplayPrescription = (message: string) => {
    const prescriptionRegex = /PRESCRIPTION:\s*([^-]+)\s*-\s*(.+)/gi;
    let match;
    const prescriptions: PrescriptionItem[] = [];

    while ((match = prescriptionRegex.exec(message)) !== null) {
      const prescriptionText = match[1].trim();
      const instructions = match[2].trim();
      
      // Parse the prescription text (medication, dosage, frequency, duration)
      const parts = prescriptionText.split(/\s+/);
      const medication = parts[0];
      const dosage = parts[1] || '';
      const frequency = parts.slice(2).join(' ');

      prescriptions.push({
        medication,
        dosage,
        frequency,
        duration: '', // Could be extracted from frequency if needed
        instructions
      });
    }

    if (prescriptions.length > 0) {
      currentPrescriptions = prescriptions; // Store for saving
      displayPrescriptions(prescriptions);
    }
  };

  // Function to display prescriptions in the prescription panel
  const displayPrescriptions = (prescriptions: PrescriptionItem[]) => {
    prescriptionPanel.style.display = 'block';
    
    const prescriptionHTML = prescriptions.map(prescription => `
      <div class="prescription-item">
        <div class="medication-name">${prescription.medication}</div>
        <div class="prescription-details">
          <div class="dosage">Dosage: ${prescription.dosage}</div>
          <div class="frequency">Frequency: ${prescription.frequency}</div>
          <div class="instructions">Instructions: ${prescription.instructions}</div>
        </div>
      </div>
    `).join('');

    prescriptionContent.innerHTML = prescriptionHTML;
  };

  // Function to save consultation to database
  const saveConsultation = async (userIssue: string, aiResponse: string, prescriptions: PrescriptionItem[]) => {
    console.log('💾 saveConsultation called with:', {
      userIssue: userIssue.substring(0, 50) + '...',
      aiResponse: aiResponse.substring(0, 50) + '...',
      prescriptions: prescriptions.length,
      sessionId
    });
    
    try {
      const response = await fetch('http://localhost:3001/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIssue,
          aiResponse,
          prescriptions,
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save consultation: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Consultation saved successfully:', data);
      
      // Refresh consultation history
      await loadConsultationHistory();
      
    } catch (error) {
      console.error('Error saving consultation:', error);
      addToConversationLog('System', 'Failed to save consultation to database', 'system');
    }
  };

  // Function to load consultation history
  const loadConsultationHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/consultations?limit=10');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch consultations: ${response.statusText}`);
      }

      const data = await response.json();
      displayConsultationHistory(data.consultations);
      
    } catch (error) {
      console.error('Error loading consultation history:', error);
    }
  };

  // Function to display consultation history
  const displayConsultationHistory = (consultations: Consultation[]) => {
    const historyPanel = document.getElementById('history-panel');
    const historyContent = document.getElementById('history-content');
    
    if (!historyPanel || !historyContent) return;

    if (consultations.length === 0) {
      historyContent.innerHTML = '<p class="no-history">No consultation history available.</p>';
      return;
    }

    const historyHTML = consultations.map(consultation => {
      const date = new Date(consultation.created_at).toLocaleString();
      const prescriptionsHTML = consultation.prescriptions.length > 0 
        ? `<div class="history-prescriptions">
             <strong>Prescriptions:</strong>
             ${consultation.prescriptions.map(p => 
               `<div class="history-prescription">• ${p.medication} - ${p.dosage} - ${p.frequency}</div>`
             ).join('')}
           </div>`
        : '';

      return `
        <div class="history-item" data-id="${consultation.id}">
          <div class="history-header">
            <span class="history-date">${date}</span>
            <button class="delete-consultation" data-id="${consultation.id}">×</button>
          </div>
          <div class="history-issue">
            <strong>Issue:</strong> ${consultation.user_issue.substring(0, 100)}${consultation.user_issue.length > 100 ? '...' : ''}
          </div>
          <div class="history-response">
            <strong>Response:</strong> ${consultation.ai_response.substring(0, 150)}${consultation.ai_response.length > 150 ? '...' : ''}
          </div>
          ${prescriptionsHTML}
        </div>
      `;
    }).join('');

    historyContent.innerHTML = historyHTML;

    // Add delete event listeners
    historyContent.querySelectorAll('.delete-consultation').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const consultationId = (e.target as HTMLElement).getAttribute('data-id');
        if (consultationId && confirm('Are you sure you want to delete this consultation?')) {
          await deleteConsultation(parseInt(consultationId));
        }
      });
    });
  };

  // Function to delete consultation
  const deleteConsultation = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/consultations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete consultation: ${response.statusText}`);
      }

      // Refresh consultation history
      await loadConsultationHistory();
      addToConversationLog('System', 'Consultation deleted successfully', 'system');
      
    } catch (error) {
      console.error('Error deleting consultation:', error);
      addToConversationLog('System', 'Failed to delete consultation', 'system');
    }
  };

  // Function to initialize Simli avatar
  const initializeAvatar = async (): Promise<void> => {
    try {
      const videoElement = document.getElementById('simli-video') as HTMLVideoElement;
      const audioElement = document.getElementById('simli-audio') as HTMLAudioElement;
      const placeholder = document.getElementById('avatar-placeholder') as HTMLElement;

      if (!videoElement || !audioElement) {
        console.warn('Avatar video/audio elements not found');
        return;
      }

      // Get API key and face ID from environment
      const apiKey = import.meta.env.VITE_SIMLI_API_KEY;
      const faceId = import.meta.env.VITE_SIMLI_FACE_ID;

      if (!apiKey || !faceId) {
        console.warn('Simli API key or Face ID not configured. Avatar will not be available.');
        console.log('Please set VITE_SIMLI_API_KEY and VITE_SIMLI_FACE_ID in your .env file');
        return;
      }

      simliAvatar = await createSimliAvatar(apiKey, faceId, videoElement, audioElement);
      
      // Always show the video element initially
      videoElement.style.display = 'block';
      placeholder.style.display = 'none';
      
      // Set up avatar event handlers
      simliAvatar.onConnectionStatusChange = (connected: boolean) => {
        if (connected) {
          // Keep video visible and log success
          videoElement.style.display = 'block';
          placeholder.style.display = 'none';
          addToConversationLog('System', 'Avatar connected successfully', 'system');
          
          // Set up audio capture for lip-sync
          setupAudioCapture();
        } else {
          // Keep video visible even if disconnected
          videoElement.style.display = 'block';
          placeholder.style.display = 'none';
          addToConversationLog('System', 'Avatar disconnected, but video remains visible', 'system');
        }
      };

      simliAvatar.onError = (error: any) => {
        console.error('Avatar error:', error);
        addToConversationLog('System', 'Avatar connection failed, but video remains visible', 'system');
        // Keep video visible even on error
        videoElement.style.display = 'block';
        placeholder.style.display = 'none';
      };

      await simliAvatar.start();
      
    } catch (error) {
      console.error('Failed to initialize avatar:', error);
      addToConversationLog('System', 'Avatar initialization failed, but video area remains visible', 'system');
      
      // Ensure video element is still visible even if Simli fails
      const videoElement = document.getElementById('simli-video') as HTMLVideoElement;
      const placeholder = document.getElementById('avatar-placeholder') as HTMLElement;
      if (videoElement && placeholder) {
        videoElement.style.display = 'block';
        placeholder.style.display = 'none';
      }
    }
  };

  // Function to set up audio capture for Simli lip-sync
  const setupAudioCapture = async (): Promise<void> => {
    try {
      // Capture system audio output (this will require user permission)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      if (simliAvatar && stream) {
        // Connect the audio stream to Simli for lip-sync
        simliAvatar.listenToMediaStream(stream);
        addToConversationLog('System', 'Audio capture enabled for avatar lip-sync', 'system');
      }
    } catch (error) {
      console.warn('Could not capture audio for avatar lip-sync:', error);
      addToConversationLog('System', 'Avatar will work without lip-sync (audio capture not available)', 'system');
    }
  };

  // Function to fetch ephemeral key from our API
  const fetchEphemeralKey = async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/api/ephemeral-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch ephemeral key');
      }

      const data = await response.json();
      return data.ephemeral_key;
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        throw new Error('API server not running. Please start the server with: npm run server');
      }
      throw error;
    }
  };

  // Connect button event handler
  connectBtn.addEventListener('click', async () => {
    try {
      // Show telephone loader
      telephoneLoader.style.display = 'flex';
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;

      // Generate session ID for this consultation session
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      addToConversationLog('System', 'Fetching ephemeral key from API server...', 'system');

      // Fetch ephemeral key from our API
      const apiKey = await fetchEphemeralKey();
      
      addToConversationLog('System', 'Ephemeral key obtained successfully. Connecting to OpenAI...', 'system');

      // Create a new session
      session = new RealtimeSession(doctorAgent, {
        model: 'gpt-realtime',
      });

      // Set up event listeners for the session
      // Note: Audio integration with Simli will be handled through media stream capture
      // when the OpenAI Realtime API provides audio output

      // Connect to the session
      await session.connect({ apiKey });
      
      // Hide telephone loader
      telephoneLoader.style.display = 'none';
      
      updateConnectionStatus(true);
      addToConversationLog('System', 'Connected to Dr. AI Assistant. You can now speak your medical concerns.', 'system');
      
      // Initialize and show avatar after successful connection
      if (!avatarInitialized) {
        avatarInitialized = true;
        await initializeAvatar();
      }
      
      // Show avatar section
      const avatarSection = document.getElementById('avatar-section');
      if (avatarSection) {
        avatarSection.classList.add('visible');
      }
      
      // Load consultation history
      await loadConsultationHistory();
      
    } catch (error: any) {
      // Hide telephone loader on error
      telephoneLoader.style.display = 'none';
      
      console.error('Connection error:', error);
      addToConversationLog('System', `Connection failed: ${error.message}`, 'system');
      updateConnectionStatus(false);
      connectBtn.textContent = 'Connect to Doctor';
      connectBtn.disabled = false;
    }
  });

  // Disconnect button event handler
  disconnectBtn.addEventListener('click', async () => {
    try {
      if (session) {
        // Note: Using session termination approach based on SDK capabilities
        session = null;
      }
      
      // Stop avatar
      if (simliAvatar) {
        await simliAvatar.stop();
        simliAvatar = null;
        
        // Reset UI to placeholder
        const videoElement = document.getElementById('simli-video') as HTMLVideoElement;
        const placeholder = document.getElementById('avatar-placeholder') as HTMLElement;
        if (videoElement && placeholder) {
          videoElement.style.display = 'none';
          placeholder.style.display = 'block';
        }
      }
      
      updateConnectionStatus(false);
      addToConversationLog('System', 'Disconnected from Dr. AI Assistant.', 'system');
    } catch (error: any) {
      console.error('Disconnection error:', error);
      addToConversationLog('System', `Disconnection error: ${error.message}`, 'system');
    }
  });



  // Initialize the interface
  updateConnectionStatus(false);
  
  // Initialize avatar immediately for bigscreen display
  try {
    await initializeAvatar();
    console.log('Avatar initialized on page load for bigscreen display');
  } catch (error) {
    console.error('Failed to initialize avatar on page load:', error);
  }
}
