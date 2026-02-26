/**
 * Test script to verify Odoo XML-RPC connection
 * Run with: node test-odoo-connection.js
 * 
 * Make sure your .env file is in the root directory
 * Next.js will automatically load it, or you can set environment variables directly
 */

const xmlrpc = require('xmlrpc');
const fs = require('fs');
const path = require('path');

// Simple .env parser (if dotenv is not available)
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  }
}

// Load .env file
loadEnv();

const config = {
  url: process.env.ODOO_URL || 'https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com',
  database: process.env.ODOO_DATABASE || 'aladinbndhh-lynq-test-live-29061122',
  username: process.env.ODOO_SYSTEM_USER || 'admin',
  password: process.env.ODOO_SYSTEM_PASSWORD || 'admin',
};

console.log('Testing Odoo XML-RPC Connection...\n');
console.log('Configuration:');
console.log(`  URL: ${config.url}`);
console.log(`  Database: ${config.database}`);
console.log(`  Username: ${config.username}`);
console.log(`  Password: ${config.password ? '***' : 'NOT SET'}\n`);

const common = xmlrpc.createSecureClient({
  host: new URL(config.url).hostname,
  port: 443,
  path: '/xmlrpc/2/common',
});

console.log('Attempting authentication...\n');

common.methodCall('authenticate', [config.database, config.username, config.password, {}], (error, uid) => {
  if (error) {
    console.error('❌ Authentication FAILED!\n');
    console.error('Error:', error.message || error);
    console.error('\nPossible issues:');
    console.error('1. Database name is incorrect');
    console.error('2. Username/password is incorrect');
    console.error('3. XML-RPC is disabled on this Odoo instance');
    console.error('4. User doesn\'t have XML-RPC access permissions');
    console.error('\nTry:');
    console.error('- Verify the database name in your Odoo instance');
    console.error('- Check if you can log into Odoo web interface with these credentials');
    console.error('- Contact your Odoo administrator');
    process.exit(1);
  } else if (!uid || uid === false) {
    console.error('❌ Authentication FAILED!\n');
    console.error('Invalid credentials or database name');
    console.error('\nThe authentication returned false, which means:');
    console.error('- The database name might be wrong');
    console.error('- The username/password might be incorrect');
    process.exit(1);
  } else {
    console.log('✅ Authentication SUCCESSFUL!\n');
    console.log(`User ID: ${uid}`);
    
    // Test reading user info
    const object = xmlrpc.createSecureClient({
      host: new URL(config.url).hostname,
      port: 443,
      path: '/xmlrpc/2/object',
    });
    
    object.methodCall('execute_kw', [
      config.database,
      uid,
      config.password,
      'res.users',
      'read',
      [[uid]],
      { fields: ['id', 'name', 'email', 'login'] }
    ], (error, users) => {
      if (error) {
        console.error('\n⚠️  Could not read user info:', error.message);
      } else if (users && users.length > 0) {
        console.log('\nUser Information:');
        console.log(`  Name: ${users[0].name}`);
        console.log(`  Email: ${users[0].email || 'N/A'}`);
        console.log(`  Login: ${users[0].login || 'N/A'}`);
      }
      
      console.log('\n✅ Connection test completed successfully!');
      console.log('You can now use these credentials in your .env file.');
      process.exit(0);
    });
  }
});
