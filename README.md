# AI Doctor - Realtime Voice Agent

A sophisticated realtime voice agent that acts as a virtual doctor, capable of conducting medical consultations and prescribing medications using OpenAI's Realtime API.

## Features

🩺 **Medical Consultation**: Interactive voice-based medical consultations
💊 **Medication Prescription**: AI doctor can prescribe medications with detailed instructions
🎤 **Voice Interface**: Real-time audio communication using WebRTC
👨‍⚕️ **AI Avatar**: Realistic doctor avatar with lip-sync using Simli technology
📋 **Prescription Display**: Visual prescription panel with medication details
🔒 **Secure Connection**: Uses OpenAI ephemeral API keys for secure communication

## Prerequisites

- Node.js (version 20.19+ or 22.12+)
- OpenAI API key with access to the Realtime API
- Modern web browser with microphone access

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your API keys:
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env and add your API keys
   # Replace 'your-openai-api-key-here' with your actual OpenAI key
   # Replace 'your-simli-api-key' with your actual Simli key (optional)
   ```

   **Simli Avatar Setup (Optional):**
   - Sign up at [Simli.ai](https://simli.ai) to get an API key
   - Add your Simli API key to the `.env` file as `VITE_SIMLI_API_KEY`
- Optionally customize the face ID by setting `VITE_SIMLI_FACE_ID`
   - If no Simli key is provided, the app will use a static avatar placeholder

4. Start both the API server and frontend (recommended):
   ```bash
   ./start.sh
   ```

   Or start them separately:
   ```bash
   # Terminal 1: Start API server
   npm run server
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5174`

## How It Works

This application now includes an **automatic ephemeral key generation system**:

1. **API Server**: A local Express.js server (`http://localhost:3001`) that generates OpenAI ephemeral keys
2. **Frontend**: The voice agent interface that automatically fetches keys from the API server
3. **Seamless Connection**: No manual key entry required - just click "Connect to Doctor"

## Environment Variables

The application uses a `.env` file for configuration. Available variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | - | ✅ Yes |
| `API_PORT` | Port for the API server | 3001 | ❌ No |

### Setting up .env file:

1. Copy the template: `cp .env.example .env`
2. Edit `.env` and replace `your-openai-api-key-here` with your actual OpenAI API key
3. Optionally, set a custom port for the API server

Example `.env` file:
```env
OPENAI_API_KEY=sk-proj-abc123...
API_PORT=3001
```

## Getting an OpenAI Ephemeral API Key (Manual Method)

If you prefer to generate keys manually, you can still do so:

### Method 1: Using curl (Manual testing)

```bash
export OPENAI_API_KEY="sk-proj-...(your OpenAI API key)"

curl -X POST https://api.openai.com/v1/realtime/client_secrets \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session": {
      "type": "realtime",
      "model": "gpt-realtime"
    }
  }'
```

The response will contain a "value" field with your ephemeral key (starts with "ek_").

### Method 2: Backend Implementation (Production)

For production applications, implement this endpoint on your backend server:

```javascript
// Example Node.js/Express endpoint
app.post('/api/realtime-token', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime'
        }
      })
    });
    
    const data = await response.json();
    res.json({ ephemeralKey: data.value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ephemeral key' });
  }
});
```

## How to Use

1. **Start the Application**: Open the application in your browser
2. **Grant Microphone Access**: Allow microphone permissions when prompted
3. **Get API Key**: Generate an ephemeral API key using the methods above
4. **Connect**: Click "Connect to Doctor" and enter your ephemeral API key
5. **Start Consultation**: Begin speaking about your medical concerns
6. **Receive Prescriptions**: The AI doctor will provide prescriptions that appear in the prescription panel

## Medical Capabilities

The AI doctor is programmed to:

- **Listen** to patient symptoms and concerns
- **Ask** relevant follow-up questions for proper diagnosis
- **Provide** clear medical explanations in understandable terms
- **Prescribe** medications with specific details:
  - Medication name (generic and brand names)
  - Exact dosage (mg, ml, etc.)
  - Frequency (times per day, with/without food)
  - Duration of treatment
  - Special instructions and warnings
- **Explain** why specific medications are prescribed
- **Mention** potential side effects and contraindications
- **Recommend** in-person care when necessary

## Prescription Format

When the AI doctor prescribes medication, it uses this format:
```
PRESCRIPTION: [Medication Name] [Dosage] [Frequency] for [Duration] - [Special Instructions]
```

Example:
```
PRESCRIPTION: Amoxicillin 500mg three times daily for 7 days - Take with food to reduce stomach upset
```

## Technology Stack

- **Frontend**: Vite + TypeScript
- **AI**: OpenAI Realtime API with GPT-4 Realtime model
- **Audio**: WebRTC for real-time audio communication
- **Styling**: Modern CSS with medical-themed design
- **SDK**: OpenAI Agents SDK (@openai/agents)

## Important Disclaimers

⚠️ **This is a demonstration application for educational purposes only**

- This AI doctor is **NOT** a replacement for real medical care
- Always consult with licensed healthcare professionals for actual medical advice
- Do not rely solely on AI-generated prescriptions
- Seek emergency medical care for urgent health situations
- This application is for demonstration and learning purposes

## Development

### Project Structure

```
src/
├── main.ts          # Application entry point and UI setup
├── counter.ts       # Doctor agent implementation and session management
├── style.css        # Medical-themed styling
└── typescript.svg   # TypeScript logo
```

### Key Components

- **RealtimeAgent**: Configured with medical instructions and prescription capabilities
- **RealtimeSession**: Manages the real-time audio connection
- **Prescription Parser**: Extracts and displays prescription information
- **Medical UI**: Professional medical interface with status indicators

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**: Ensure your browser has microphone permissions
2. **Connection Failed**: Verify your ephemeral API key is valid and starts with "ek_"
3. **Audio Issues**: Check your microphone and speaker settings
4. **API Key Expired**: Ephemeral keys have limited validity - generate a new one

### Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Ensure your browser supports WebRTC and has microphone access enabled.

## License

This project is for educational and demonstration purposes. Please ensure compliance with OpenAI's usage policies and local healthcare regulations.

## Support

For issues related to:
- **OpenAI API**: Check OpenAI documentation and support
- **Application bugs**: Review the console for error messages
- **Medical questions**: Consult with real healthcare professionals

---

**Remember**: This is a demonstration of AI capabilities in healthcare. Always prioritize real medical care and professional healthcare advice.