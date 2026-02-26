import { Client } from '@microsoft/microsoft-graph-client';

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/api/calendar/outlook/callback`;

export function getOutlookAuthUrl() {
  const scopes = encodeURIComponent('Calendars.ReadWrite offline_access');
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=${scopes}`;
}

export async function getOutlookTokens(code: string) {
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID!,
    client_secret: MICROSOFT_CLIENT_SECRET!,
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return response.json();
}

export function getOutlookClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export async function listOutlookCalendarEvents(
  accessToken: string,
  startDateTime: string,
  endDateTime: string
) {
  const client = getOutlookClient(accessToken);
  
  const events = await client
    .api('/me/calendarview')
    .query({
      startDateTime,
      endDateTime,
    })
    .get();

  return events.value || [];
}

export async function createOutlookCalendarEvent(
  accessToken: string,
  event: {
    subject: string;
    body?: { contentType: string; content: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ emailAddress: { address: string; name?: string } }>;
    location?: { displayName: string };
  }
) {
  const client = getOutlookClient(accessToken);
  
  const response = await client.api('/me/events').post(event);

  return response;
}
