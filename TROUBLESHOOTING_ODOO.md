# Troubleshooting Odoo XML-RPC "Access Denied" Error

## Common Causes and Solutions

### 1. Database Name Mismatch

**Problem**: The database name in `.env` doesn't match your Odoo instance.

**Solution**:
- Check your Odoo instance URL: `https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com`
- The database name is usually the subdomain: `aladinbndhh-lynq-test-live-29061122`
- However, it might be different. To find it:
  1. Log into your Odoo instance
  2. Go to Settings > Technical > Database Structure > Databases
  3. Or check the database name in your Odoo hosting panel

**Update `.env`**:
```env
ODOO_DATABASE=your-actual-database-name
```

### 2. Wrong Username/Login

**Problem**: Odoo uses a `login` field which might be different from the email.

**Solution**:
- Try using the exact login username (not email) if they differ
- In Odoo, go to Settings > Users & Companies > Users
- Check the "Login" field for your user
- Use that exact value (it might be the email, but could be different)

### 3. User Doesn't Have XML-RPC Access

**Problem**: The user account might not have permission to use XML-RPC.

**Solution**:
1. Log into Odoo as administrator
2. Go to Settings > Users & Companies > Users
3. Find the user you're trying to authenticate with
4. Make sure the user is active and has proper access rights
5. Check if there are any restrictions on XML-RPC access

### 4. XML-RPC Disabled

**Problem**: XML-RPC might be disabled on your Odoo instance for security.

**Solution**:
- Contact your Odoo administrator
- Check Odoo configuration files
- Some hosting providers disable XML-RPC by default

### 5. Password Issues

**Problem**: The password might be incorrect or expired.

**Solution**:
- Reset the password in Odoo
- Make sure you're using the correct password
- Some Odoo instances require password reset after first login

## Testing the Connection

### Method 1: Test with Python Script

Create a test script to verify XML-RPC access:

```python
import xmlrpc.client

url = "https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com"
db = "aladinbndhh-lynq-test-live-29061122"  # Update with actual database name
username = "your-email@example.com"  # Or your login username
password = "your-password"

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

if uid:
    print(f"Authentication successful! User ID: {uid}")
else:
    print("Authentication failed!")
```

### Method 2: Test Database Name

Try different database name variations:
- `aladinbndhh-lynq-test-live-29061122`
- `aladinbndhh_lynq_test_live_29061122`
- `lynq-test-live`
- Or check your Odoo hosting panel

### Method 3: Check Odoo Logs

1. Enable debug mode in Odoo
2. Check Odoo server logs when attempting authentication
3. Look for XML-RPC access errors

## Quick Fixes

### Update `.env` with Correct Values

```env
# Try these variations:
ODOO_URL=https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com
ODOO_DATABASE=aladinbndhh-lynq-test-live-29061122

# Or try:
ODOO_DATABASE=aladinbndhh_lynq_test_live_29061122

# Make sure username is the exact login field from Odoo
ODOO_SYSTEM_USER=admin
ODOO_SYSTEM_PASSWORD=your-actual-admin-password
```

### Verify User Credentials

1. Log into Odoo web interface: `https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com`
2. Use the exact same credentials
3. If login works in web but not XML-RPC, it's likely a database name issue

## Getting Help

If none of these solutions work:

1. **Check Odoo Version**: Make sure you're using Odoo 18 (the module is designed for Odoo 18)
2. **Contact Odoo Support**: If using Odoo.sh or Odoo.com hosting, contact their support
3. **Check Network**: Ensure your server can reach the Odoo instance
4. **Check Firewall**: XML-RPC might be blocked by firewall rules

## Debug Information

When reporting issues, include:
- Odoo version
- Database name you're using
- Error message (full text)
- Whether you can log into Odoo web interface
- Whether XML-RPC is enabled on your instance
