# Finding the Correct Odoo Database Name

## The Problem

The error shows that the database `p_aladinbndhh_lynq_test_live_29061122` does not exist.

## How to Find the Correct Database Name

### Method 1: Check Odoo Logs

From your earlier logs, I saw:
```
database: p_aladinbndhh_lynq_test_live_29061122@192.168.1.1:5432
```

But this might not be the actual database name used for XML-RPC authentication.

### Method 2: Check Odoo Instance URL

Your Odoo URL is: `https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com`

For Odoo.sh instances, the database name is typically:
- The subdomain: `aladinbndhh-lynq-test-live-29061122` (with hyphens)
- Or without prefix: `aladinbndhh_lynq_test_live_29061122` (with underscores)

### Method 3: Try Common Variations

Try these database names in your `.env` file:

1. **With hyphens (most common for Odoo.sh)**:
   ```env
   ODOO_DATABASE=aladinbndhh-lynq-test-live-29061122
   ```

2. **With underscores**:
   ```env
   ODOO_DATABASE=aladinbndhh_lynq_test_live_29061122
   ```

3. **Without prefix**:
   ```env
   ODOO_DATABASE=aladinbndhh_lynq_test_live_29061122
   ```

4. **Check Odoo Database Manager**:
   - Log into your Odoo instance
   - Go to Database Manager (usually at `/web/database/manager`)
   - See the actual database name listed there

### Method 4: Contact Odoo Support

If you're using Odoo.sh or Odoo.com hosting, contact their support to get the exact database name.

## Quick Test

Update your `.env` file with one of the variations above and test:

```bash
node test-odoo-connection.js
```

Or try logging in at `http://localhost:3001/login` with your Odoo credentials.

## Current Configuration

Your current `.env` has:
```env
ODOO_DATABASE=p_aladinbndhh_lynq_test_live_29061122
```

Try changing it to:
```env
ODOO_DATABASE=aladinbndhh-lynq-test-live-29061122
```

This is the most common format for Odoo.sh instances.
