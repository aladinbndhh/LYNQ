# Starting Docker on Windows

## Issue
Docker Desktop is not running or needs elevated privileges.

## Solution

### Option 1: Start Docker Desktop (Recommended)

1. **Open Docker Desktop application**
   - Search for "Docker Desktop" in Windows Start Menu
   - Click to start it
   - Wait for Docker to fully start (whale icon in system tray)
   - Retry the commands

### Option 2: Run PowerShell as Administrator

1. **Right-click PowerShell**
2. Select "Run as Administrator"
3. Navigate to project:
   ```powershell
   cd "C:\Users\Administrator\Desktop\LynQ Latest"
   ```
4. Run Docker command:
   ```powershell
   docker-compose up -d mongodb redis
   ```

### Option 3: Use Cloud MongoDB (No Docker)

If you don't want to use Docker, you can use MongoDB Atlas (free):

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lynq
   ```
5. For Redis, either:
   - Use Redis Cloud (https://redis.com/try-free/)
   - Or remove Redis features temporarily

---

## After Docker Starts

Once Docker is running, execute these commands:

```powershell
# In project directory
cd "C:\Users\Administrator\Desktop\LynQ Latest"

# Start databases
docker-compose up -d mongodb redis

# Wait 10 seconds
Start-Sleep -Seconds 10

# Seed database
npm run seed

# Start development server
npm run dev
```

Then visit: http://localhost:3000
