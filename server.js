import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { consultationDb } from './database.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

console.log(process.env.OPENAI_API_KEY)
// Endpoint to generate ephemeral key
app.post('/api/ephemeral-key', async (req, res) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(400).json({ 
        error: 'OPENAI_API_KEY environment variable is required' 
      });
    }

    // Call OpenAI API to generate ephemeral key
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to generate ephemeral key',
        details: errorData
      });
    }

    const data = await response.json();
    
    // Return the ephemeral key
    console.log(data)
    res.json({
      ephemeral_key: data.value,
      expires_at: data.expires_at
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Save consultation endpoint
app.post('/api/consultations', async (req, res) => {
  try {
    const { userIssue, aiResponse, prescriptions, sessionId } = req.body;
    
    if (!userIssue || !aiResponse) {
      return res.status(400).json({ 
        error: 'userIssue and aiResponse are required' 
      });
    }

    // Save consultation
    const consultationId = consultationDb.saveConsultation(userIssue, aiResponse, sessionId);
    
    // Save prescriptions if provided
    if (prescriptions && prescriptions.length > 0) {
      consultationDb.savePrescriptions(consultationId, prescriptions);
    }

    // Get the saved consultation with prescriptions
    const savedConsultation = consultationDb.getConsultationById(consultationId);
    
    res.json({
      success: true,
      consultation: savedConsultation
    });

  } catch (error) {
    console.error('Error saving consultation:', error);
    res.status(500).json({ 
      error: 'Failed to save consultation',
      message: error.message 
    });
  }
});

// Get all consultations endpoint
app.get('/api/consultations', async (req, res) => {
  try {
    const { limit, search } = req.query;
    
    let consultations;
    if (search) {
      consultations = consultationDb.searchConsultations(search);
    } else if (limit) {
      consultations = consultationDb.getRecentConsultations(parseInt(limit));
    } else {
      consultations = consultationDb.getAllConsultations();
    }
    
    res.json({
      success: true,
      consultations
    });

  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch consultations',
      message: error.message 
    });
  }
});

// Get consultation by ID endpoint
app.get('/api/consultations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = consultationDb.getConsultationById(parseInt(id));
    
    if (!consultation) {
      return res.status(404).json({ 
        error: 'Consultation not found' 
      });
    }
    
    res.json({
      success: true,
      consultation
    });

  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch consultation',
      message: error.message 
    });
  }
});

// Delete consultation endpoint
app.delete('/api/consultations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = consultationDb.deleteConsultation(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Consultation not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Consultation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({ 
      error: 'Failed to delete consultation',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Voice Agent Doctor API Server running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /api/ephemeral-key - Generate ephemeral key`);
  console.log(`   POST /api/consultations - Save consultation`);
  console.log(`   GET  /api/consultations - Get all consultations`);
  console.log(`   GET  /api/consultations/:id - Get consultation by ID`);
  console.log(`   DELETE /api/consultations/:id - Delete consultation`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`⚠️  Make sure to set OPENAI_API_KEY environment variable`);
});