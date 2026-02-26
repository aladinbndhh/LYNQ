# Odoo Configuration Guide

## Odoo Instance URL

Your Odoo instance URL is:
```
https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Odoo Configuration
ODOO_URL=https://aladinbndhh-lynq-test-live-29061122.dev.odoo.com
ODOO_DATABASE=aladinbndhh-lynq-test-live-29061122
ODOO_SYSTEM_USER=admin
ODOO_SYSTEM_PASSWORD=admin

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lynq

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AI Configuration (Google Gemini)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Outlook Calendar (Optional)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Important Notes

1. **Database Name**: The `ODOO_DATABASE` is typically the subdomain of your Odoo instance. If you're unsure, check your Odoo instance settings or contact your Odoo administrator.

2. **System User**: The `ODOO_SYSTEM_USER` and `ODOO_SYSTEM_PASSWORD` are used for public profile access (read-only operations). These should be a dedicated system user with minimal permissions.

3. **User Authentication**: Regular users will log in with their Odoo credentials (email and password). The system authenticates against Odoo's `res.users` model.

4. **XML-RPC Endpoint**: The system uses Odoo's XML-RPC API at `/xmlrpc/2/common` and `/xmlrpc/2/object` endpoints.

## Testing the Connection

After setting up the environment variables, you can test the connection by:

1. Starting the development server:
   ```bash
   npm run dev
   ```

2. Attempting to log in with an Odoo user's credentials at `http://localhost:3000/login`

3. If authentication fails, check:
   - The Odoo URL is correct and accessible
   - The database name matches your Odoo instance
   - The user credentials are valid in Odoo
   - The Odoo instance allows XML-RPC connections

## Odoo Module Installation

Make sure the `lynq_connector` module is installed in your Odoo instance:

1. Copy the `odoo-module/lynq_connector` directory to your Odoo addons path
2. Update the apps list in Odoo
3. Install the "LynQ Connector" module
4. Configure the module settings if needed

## Security Considerations

- Never commit your `.env` file to version control
- Use strong passwords for system users
- Consider using OAuth tokens instead of storing passwords in production
- Enable HTTPS for production deployments
- Restrict XML-RPC access to trusted IPs if possible
