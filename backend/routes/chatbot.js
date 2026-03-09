const express = require('express');
const router = express.Router();
const { JWT_SECRET } = require('../utils/jwtAuth');
const jwt = require('jsonwebtoken');

// Optional auth — populate req.user if token present, but don't block
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (_) { /* token invalid — continue as guest */ }
  }
  next();
}

// ────────────────────────── Knowledge Base ──────────────────────────

const SAFETY_TIPS = [
  'Always be aware of your surroundings, especially at night.',
  'Keep emergency numbers saved — Police: 100, Ambulance: 108, Women Helpline: 1091.',
  'Avoid sharing personal details such as your address or daily routine with strangers online.',
  'If you witness a crime, note the time, location, and any descriptions before filing a report.',
  'Lock doors and windows when leaving your home unattended.',
  'Walk in well-lit areas and avoid isolated shortcuts after dark.',
  'Register your vehicle and keep documents handy to avoid fines.',
  'Never leave valuables visible inside a parked car.',
  'Trust your instincts — if something feels wrong, leave the area and call for help.',
  'Install a smoke detector and keep a fire extinguisher at home.',
];

const FAQ = {
  'what is a fir': 'A **First Information Report (FIR)** is a written document prepared by the police when they receive information about a cognizable offence. It sets the criminal law in motion.',
  'how to file a fir': 'To file a FIR:\n1. Go to **File FIR** from the dashboard.\n2. Select the nearest police station.\n3. Describe the incident (the AI will auto-detect the crime type).\n4. Fill in personal details and accused information.\n5. Submit — the station will review it.',
  'how long does fir take': 'Online FIR submission is instant. Police review typically takes 24–48 hours. You can track the status from your dashboard.',
  'what happens after fir': 'After filing:\n• The FIR is sent to the selected police station.\n• An officer reviews it and either **Approves** or **Rejects** it.\n• If approved, investigation begins. You can track progress in **My FIRs**.',
  'can i file fir online': 'Yes! This system lets you file FIRs online. Navigate to **File FIR** from your User Dashboard.',
  'what is cognizable offence': 'A cognizable offence is one where the police can arrest without a warrant and start investigation without court permission — e.g., theft, robbery, murder.',
  'what documents needed': 'For filing a FIR you need:\n• Your identity details (name, age, phone, address)\n• Accused details (if known)\n• Incident description\n• Any supporting evidence (optional)',
  'emergency numbers': '**Emergency Numbers (India)**\n• Police: 100\n• Ambulance: 108\n• Fire: 101\n• Women Helpline: 1091 / 181\n• Child Helpline: 1098\n• Cyber Crime: 1930',
  'what crime types': 'We handle: Theft, Assault, Burglary, Robbery, Fraud, Cybercrime, Harassment, Vandalism, Trespassing, Arson, Drug Offense, DUI, Traffic Violation, Homicide, Sexual Offense, Kidnapping, Racketeering, Extortion, Forgery, Counterfeiting.',
  'cyber crime': 'For cyber crimes:\n1. File an FIR selecting **Cybercrime** as the type.\n2. Preserve screenshots, URLs, transaction IDs as evidence.\n3. You can also report at **cybercrime.gov.in** or call **1930**.',
};

// Quick-reply suggestions shown to the user
const QUICK_REPLIES = [
  'How to file a FIR?',
  'Check my FIR status',
  'Emergency numbers',
  'Safety tips',
  'What crime types are supported?',
];

// ────────────────────────── Intent Matching ──────────────────────────

function detectIntent(message) {
  const msg = message.toLowerCase().trim();

  // FIR status check (e.g. "status of FIR 42", "track fir #7")
  const statusMatch = msg.match(/(?:status|track|check|where|fir)\s*(?:of|for|#|id|number)?\s*(?:fir|my fir|report)?\s*#?\s*(\d+)/i);
  if (statusMatch) return { intent: 'fir_status', firId: parseInt(statusMatch[1], 10) };
  if (/(?:my firs?|my reports?|fir status|fir list|track)/.test(msg) && !/how|what|file/.test(msg))
    return { intent: 'fir_list' };

  // Greeting
  if (/^(hi|hello|hey|hola|greetings|good\s*(morning|afternoon|evening))/.test(msg))
    return { intent: 'greeting' };

  // Thanks
  if (/^(thanks|thank you|thx|ty|cheers)/.test(msg))
    return { intent: 'thanks' };

  // Safety tips
  if (/safe|safety|precaution|protect|tip/.test(msg))
    return { intent: 'safety' };

  // Emergency
  if (/emergency|helpline|help\s*number|ambulance|fire|rescue|sos/.test(msg))
    return { intent: 'faq', key: 'emergency numbers' };

  // FIR filing help
  if (/how.*(file|register|lodge|create).*(fir|complaint|report)/.test(msg) || /file.*fir|lodge.*fir|register.*fir/.test(msg))
    return { intent: 'faq', key: 'how to file a fir' };

  // FAQ matching
  for (const [key] of Object.entries(FAQ)) {
    const words = key.split(' ');
    const matched = words.filter(w => msg.includes(w)).length;
    if (matched >= Math.ceil(words.length * 0.6)) return { intent: 'faq', key };
  }

  return { intent: 'unknown' };
}

// ────────────────────────── Chat Endpoint ──────────────────────────

router.post('/message', optionalAuth, async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ status: 'error', message: 'Message is required' });
  }

  const userMsg = message.trim().substring(0, 500); // cap input length
  const { intent, firId, key } = detectIntent(userMsg);

  try {
    switch (intent) {

      case 'greeting': {
        const name = req.user?.username || 'there';
        return res.json({
          status: 'success',
          data: {
            reply: `Hello ${name}! 👋 I'm the Crime Management Assistant. I can help you:\n• File an FIR\n• Check FIR status\n• Answer safety & legal questions\n\nHow can I help you today?`,
            quickReplies: QUICK_REPLIES,
          },
        });
      }

      case 'thanks':
        return res.json({
          status: 'success',
          data: { reply: 'You\'re welcome! Stay safe. Let me know if you need anything else. 😊' },
        });

      case 'safety': {
        const tips = SAFETY_TIPS.sort(() => 0.5 - Math.random()).slice(0, 3);
        return res.json({
          status: 'success',
          data: {
            reply: `🛡️ **Safety Tips**\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
            quickReplies: ['More safety tips', 'Emergency numbers', 'How to file a FIR?'],
          },
        });
      }

      case 'faq':
        return res.json({
          status: 'success',
          data: {
            reply: FAQ[key],
            quickReplies: QUICK_REPLIES.filter(q => !q.toLowerCase().includes(key?.split(' ')[0])),
          },
        });

      case 'fir_status': {
        if (!req.user) {
          return res.json({
            status: 'success',
            data: {
              reply: '🔒 You need to be **logged in** to check FIR status. Please log in and try again.',
              quickReplies: ['How to file a FIR?', 'Safety tips'],
            },
          });
        }
        // Look up FIR from database
        const db = req.db;
        if (!db) {
          return res.json({ status: 'success', data: { reply: 'Database is temporarily unavailable. Please try again later.' } });
        }
        try {
          const fir = await new Promise((resolve, reject) => {
            db.get('SELECT id, crime_type, status, created_at, station_id FROM firs WHERE id = ? AND user_id = ?',
              [firId, req.user.id],
              (err, row) => err ? reject(err) : resolve(row));
          });
          if (!fir) {
            return res.json({
              status: 'success',
              data: { reply: `❌ No FIR found with ID **#${firId}** under your account. Please check the number and try again.` },
            });
          }
          const statusEmoji = { Sent: '📨', Approved: '✅', Rejected: '❌' };
          return res.json({
            status: 'success',
            data: {
              reply: `📋 **FIR #${fir.id}**\n• **Crime Type:** ${fir.crime_type}\n• **Status:** ${statusEmoji[fir.status] || '📄'} ${fir.status}\n• **Station:** ${fir.station_id}\n• **Filed:** ${new Date(fir.created_at).toLocaleDateString()}`,
              quickReplies: ['Check another FIR', 'How to file a FIR?', 'Safety tips'],
            },
          });
        } catch (dbErr) {
          console.error('Chatbot DB error:', dbErr);
          return res.json({ status: 'success', data: { reply: 'Something went wrong fetching FIR data. Please try again.' } });
        }
      }

      case 'fir_list': {
        if (!req.user) {
          return res.json({
            status: 'success',
            data: {
              reply: '🔒 Please **log in** to view your FIR list.',
              quickReplies: ['How to file a FIR?', 'Safety tips'],
            },
          });
        }
        const db = req.db;
        if (!db) {
          return res.json({ status: 'success', data: { reply: 'Database is temporarily unavailable.' } });
        }
        try {
          const firs = await new Promise((resolve, reject) => {
            db.all('SELECT id, crime_type, status, created_at FROM firs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
              [req.user.id],
              (err, rows) => err ? reject(err) : resolve(rows || []));
          });
          if (firs.length === 0) {
            return res.json({
              status: 'success',
              data: {
                reply: 'You haven\'t filed any FIRs yet. Would you like to file one?',
                quickReplies: ['How to file a FIR?', 'What documents needed?'],
              },
            });
          }
          const statusEmoji = { Sent: '📨', Approved: '✅', Rejected: '❌' };
          const list = firs.map(f =>
            `• **#${f.id}** ${f.crime_type} — ${statusEmoji[f.status] || '📄'} ${f.status} (${new Date(f.created_at).toLocaleDateString()})`
          ).join('\n');
          return res.json({
            status: 'success',
            data: {
              reply: `📋 **Your Recent FIRs**\n\n${list}\n\nSay *"status of FIR #ID"* to see details.`,
              quickReplies: ['How to file a FIR?', 'Safety tips'],
            },
          });
        } catch (dbErr) {
          console.error('Chatbot DB error:', dbErr);
          return res.json({ status: 'success', data: { reply: 'Something went wrong. Please try again.' } });
        }
      }

      default:
        return res.json({
          status: 'success',
          data: {
            reply: `I'm not sure I understand that. Here are some things I can help with:\n\n• **File a FIR** — I'll guide you through the process\n• **Check FIR status** — say *"status of FIR #123"*\n• **Safety tips** — personal safety advice\n• **Emergency numbers** — important contacts\n• **Legal info** — what is an FIR, cognizable offence, etc.`,
            quickReplies: QUICK_REPLIES,
          },
        });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Quick replies endpoint — returns suggestions for new conversations
router.get('/quick-replies', (req, res) => {
  res.json({ status: 'success', data: QUICK_REPLIES });
});

module.exports = router;
