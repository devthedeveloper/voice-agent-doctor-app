import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const db = new Database(join(__dirname, 'consultations.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Consultations table
  const createConsultationsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_issue TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT
    )
  `);

  // Prescriptions table
  const createPrescriptionsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultation_id INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consultation_id) REFERENCES consultations (id) ON DELETE CASCADE
    )
  `);

  createConsultationsTable.run();
  createPrescriptionsTable.run();
};

// Initialize tables
createTables();

// Database operations
export const consultationDb = {
  // Save a new consultation
  saveConsultation: (userIssue, aiResponse, sessionId = null) => {
    const stmt = db.prepare(`
      INSERT INTO consultations (user_issue, ai_response, session_id)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userIssue, aiResponse, sessionId);
    return result.lastInsertRowid;
  },

  // Save prescriptions for a consultation
  savePrescriptions: (consultationId, prescriptions) => {
    const stmt = db.prepare(`
      INSERT INTO prescriptions (consultation_id, medication_name, dosage, frequency, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const saveMultiple = db.transaction((prescriptions) => {
      for (const prescription of prescriptions) {
        stmt.run(
          consultationId,
          prescription.medication,
          prescription.dosage,
          prescription.frequency,
          prescription.duration,
          prescription.instructions || ''
        );
      }
    });

    saveMultiple(prescriptions);
  },

  // Get all consultations with their prescriptions
  getAllConsultations: () => {
    const consultationsStmt = db.prepare(`
      SELECT * FROM consultations 
      ORDER BY created_at DESC
    `);
    
    const prescriptionsStmt = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE consultation_id = ?
      ORDER BY created_at ASC
    `);

    const consultations = consultationsStmt.all();
    
    return consultations.map(consultation => ({
      ...consultation,
      prescriptions: prescriptionsStmt.all(consultation.id)
    }));
  },

  // Get consultation by ID
  getConsultationById: (id) => {
    const consultationStmt = db.prepare(`
      SELECT * FROM consultations WHERE id = ?
    `);
    
    const prescriptionsStmt = db.prepare(`
      SELECT * FROM prescriptions WHERE consultation_id = ?
    `);

    const consultation = consultationStmt.get(id);
    if (!consultation) return null;

    return {
      ...consultation,
      prescriptions: prescriptionsStmt.all(id)
    };
  },

  // Get recent consultations (limit)
  getRecentConsultations: (limit = 10) => {
    const consultationsStmt = db.prepare(`
      SELECT * FROM consultations 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const prescriptionsStmt = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE consultation_id = ?
      ORDER BY created_at ASC
    `);

    const consultations = consultationsStmt.all(limit);
    
    return consultations.map(consultation => ({
      ...consultation,
      prescriptions: prescriptionsStmt.all(consultation.id)
    }));
  },

  // Delete consultation and its prescriptions
  deleteConsultation: (id) => {
    const stmt = db.prepare('DELETE FROM consultations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Search consultations by user issue
  searchConsultations: (searchTerm) => {
    const consultationsStmt = db.prepare(`
      SELECT * FROM consultations 
      WHERE user_issue LIKE ? OR ai_response LIKE ?
      ORDER BY created_at DESC
    `);
    
    const prescriptionsStmt = db.prepare(`
      SELECT * FROM prescriptions 
      WHERE consultation_id = ?
      ORDER BY created_at ASC
    `);

    const searchPattern = `%${searchTerm}%`;
    const consultations = consultationsStmt.all(searchPattern, searchPattern);
    
    return consultations.map(consultation => ({
      ...consultation,
      prescriptions: prescriptionsStmt.all(consultation.id)
    }));
  }
};

// Close database connection on process exit
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;