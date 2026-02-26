# 🤖 Enable AI Chat - Quick Guide

## Current Status

✅ Chat widget is working (UI functional)  
✅ Chat calls API correctly  
⚠️ **OpenAI API key not configured** - Getting demo responses  

---

## 🔑 Add OpenAI API Key (2 Minutes)

### Step 1: Get Your API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Sign in (or create account)
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)

### Step 2: Add Key to .env File

**Option A: Using Notepad**
1. Open `.env` file in Notepad
2. Find this line:
```
OPENAI_API_KEY=your-openai-api-key-here
```
3. Replace with your actual key:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```
4. Save file (Ctrl+S)

**Option B: Using PowerShell**
```powershell
cd "C:\Users\Administrator\Desktop\LynQ Latest"

# Replace YOUR_KEY_HERE with your actual key
(Get-Content .env) -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=sk-YOUR_KEY_HERE' | Set-Content .env
```

### Step 3: Restart Development Server

**In the terminal running npm run dev:**
1. Press **Ctrl+C** to stop
2. Run: `npm run dev`
3. Wait for "Ready" message

### Step 4: Test AI Chat

1. Visit: **http://localhost:3000/demo**
2. Click the **💬 chat button**
3. Type: **"Hello"**
4. Press **Enter**

**You should now see:**
- Real AI response (not demo message)
- AI engages in conversation
- AI can ask questions
- AI can check availability
- AI can book meetings

---

## 🧪 Test Conversation Examples

### Example 1: Simple Greeting
```
You: Hello
AI: Hello! Thanks for visiting my profile. How can I help you today?

You: I'd like to learn more about your services
AI: I'd be happy to help! Could you tell me your name and company?
```

### Example 2: Meeting Booking
```
You: I want to schedule a meeting
AI: I'd be glad to help you schedule a meeting. May I have your name and email address?

You: I'm John Smith from Acme Corp, john@acme.com
AI: Nice to meet you, John! What would you like to discuss in the meeting?

You: Potential partnership
AI: [Checks calendar] I have availability on these dates...
```

### Example 3: Lead Qualification
```
You: Hi, I'm interested in your product
AI: Great! May I ask your name and company?

You: Sarah from Tech Startup
AI: Nice to meet you, Sarah! What industry is your startup in?

You: SaaS
AI: What challenges are you currently facing?
```

---

## 🎯 What AI Can Do (With API Key)

### ✅ Greeting & Qualification
- Greets visitors warmly
- Asks for name and company
- Asks qualification questions
- Builds lead profile

### ✅ Calendar Functions
- Checks your availability
- Proposes meeting slots
- Books confirmed meetings
- Handles timezone conversion

### ✅ Lead Capture
- Extracts visitor information
- Stores in database
- Creates lead record
- Tags as source: "chat"

### ✅ Smart Escalation
- Detects frustration keywords
- Can escalate to human
- Notifies profile owner

---

## 🔍 Verify It's Working

### In Browser Console (F12):

**When you send a message, you should see:**
```
POST /api/ai/chat
Status: 200 OK
Response: { success: true, data: { reply: "...", sessionId: "..." } }
```

### In Terminal (where npm run dev is running):

**You should see:**
```
POST /api/ai/chat 200 in XXXms
```

**No errors about OpenAI**

---

## ⚠️ Troubleshooting

### Still Getting Demo Responses?

**Check:**
1. API key is correct (starts with `sk-`)
2. `.env` file saved
3. Server restarted
4. No errors in terminal

### "Failed to get AI response" Error?

**Common causes:**
1. **Invalid API key** - Check at https://platform.openai.com
2. **No credits** - Check billing at https://platform.openai.com/settings/organization/billing
3. **Rate limit** - Wait a minute and try again
4. **Network issue** - Check internet connection

### API Key Format

**Correct:** `sk-proj-xxxxxxxxxxxxxxxxxxxxx` (OpenAI)  
**Incorrect:** `sk-ant-xxxxx` (Anthropic - wrong provider)  

---

## 💰 OpenAI Pricing

**GPT-4 (what LynQ uses):**
- Input: ~$0.01 per 1K tokens
- Output: ~$0.03 per 1K tokens
- Average chat: ~$0.05 per conversation

**For Testing:**
- Free trial: $5 credit
- Enough for ~100 test conversations

---

## 🎉 Once API Key is Added

**AI will be able to:**
- ✅ Respond intelligently to questions
- ✅ Maintain context in conversation
- ✅ Ask qualification questions
- ✅ Check calendar availability (function calling)
- ✅ Book meetings (function calling)
- ✅ Escalate to human when needed
- ✅ Extract lead information
- ✅ Create leads automatically

---

## 🔄 Quick Setup Summary

```bash
# 1. Get API key from OpenAI

# 2. Add to .env
OPENAI_API_KEY=sk-your-key-here

# 3. Restart server
# Press Ctrl+C in terminal
npm run dev

# 4. Test chat
# Visit http://localhost:3000/demo
# Click 💬 and chat!
```

---

## ✅ Current Status Without API Key

**What Works:**
- ✅ Chat widget UI
- ✅ Open/close animations
- ✅ Message sending
- ✅ Typing indicator
- ✅ Message history
- ✅ Minimize feature

**What Shows Demo Response:**
- ⚠️ AI replies (needs key)
- ⚠️ Function calling (needs key)
- ⚠️ Intelligent responses (needs key)

---

## 🎯 **Add your OpenAI key to see real AI magic!** ✨

**Get key**: https://platform.openai.com/api-keys  
**Add to**: `.env` file  
**Test at**: http://localhost:3000/demo  
