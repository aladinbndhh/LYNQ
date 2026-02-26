export interface OdooConfig {
  url: string;
  database?: string; // Optional - not needed for web session auth
  username: string;
  password: string;
}

export class OdooClient {
  private url: string;
  private db: string | null;
  private username: string;
  private password: string;
  private uid: number | null = null;
  private sessionId: string | null = null;
  private cookies: string = '';

  constructor(config: OdooConfig) {
    this.url = config.url.replace(/\/$/, ''); // Remove trailing slash
    this.db = config.database || null;
    this.username = config.username;
    this.password = config.password;
  }

  /**
   * Authenticate using custom HTTP endpoint (pure HTTP JSON, no RPC)
   */
  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      // Use custom HTTP JSON endpoint (no RPC protocol)
      const response = await fetch(`${this.url}/lynq/api/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          db: this.db || undefined,
          login: this.username,
          password: this.password,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.success && data.uid) {
        this.uid = data.uid;
        this.sessionId = data.session_id || null;
        
        // Store cookies for subsequent requests
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          this.cookies = setCookieHeader;
        }
        
        // Ensure uid is set and is a number
        if (this.uid && typeof this.uid === 'number') {
          return this.uid;
        }
      }

      throw new Error('Authentication failed: Invalid response');
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Execute method on Odoo model using HTTP JSON (no RPC)
   */
  async execute(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {}
  ): Promise<any> {
    // For search_read, use custom endpoint (handles its own auth)
    if (method === 'search_read') {
      return this.searchRead(model, args[0] || [], kwargs.fields || [], kwargs.limit);
    }

    // For create, use custom endpoint (handles its own auth)
    if (method === 'create') {
      return this.create(model, args[0]?.[0] || {});
    }

    // For other methods, authenticate first then use Odoo's web endpoint
    await this.authenticate();

    // For other methods, use Odoo's web endpoint (still HTTP, but may need jsonrpc format)
    try {
      const response = await fetch(`${this.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.cookies,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: model,
            method: method,
            args: args,
            kwargs: kwargs,
          },
          id: Math.floor(Math.random() * 1000000000),
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      return data.result || data;
    } catch (error: any) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Search and read records using custom HTTP endpoint (no auth required)
   */
  async searchRead(
    model: string,
    domain: any[] = [],
    fields: string[] = [],
    limit?: number
  ): Promise<any[]> {
    // No authentication needed - endpoint uses sudo

    try {
      const response = await fetch(`${this.url}/lynq/api/search_read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          domain: domain,
          fields: fields,
          limit: limit,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Check if it's HTML (login page)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Authentication required - please check your credentials');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return Array.isArray(data.result) ? data.result : [];
    } catch (error: any) {
      throw new Error(`Search read failed: ${error.message}`);
    }
  }

  /**
   * Create record using custom HTTP endpoint (no auth required)
   */
  async create(model: string, values: any): Promise<number> {
    // No authentication needed - endpoint uses sudo

    try {
      const response = await fetch(`${this.url}/lynq/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          values: values,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Check if it's HTML (login page)
        if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
          throw new Error('Authentication required - please check your credentials');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result;
    } catch (error: any) {
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  /**
   * Update record
   */
  async write(model: string, ids: number[], values: any): Promise<boolean> {
    return this.execute(model, 'write', [[ids, values]]);
  }

  /**
   * Delete record
   */
  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.execute(model, 'unlink', [[ids]]);
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate: Date, endDate: Date): Promise<any[]> {
    const domain = [
      ['start', '>=', startDate.toISOString()],
      ['stop', '<=', endDate.toISOString()],
    ];

    return this.searchRead('calendar.event', domain, [
      'name',
      'start',
      'stop',
      'allday',
      'location',
      'description',
    ]);
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(event: {
    name: string;
    start: string;
    stop: string;
    partner_ids?: number[];
    location?: string;
    description?: string;
  }): Promise<number> {
    return this.create('calendar.event', event);
  }

  /**
   * Create lead
   */
  async createLead(lead: {
    name: string;
    contact_name?: string;
    email_from?: string;
    phone?: string;
    description?: string;
    source_id?: number;
  }): Promise<number> {
    return this.create('crm.lead', lead);
  }

  /**
   * Create contact (res.partner)
   */
  async createContact(contact: {
    name: string;
    email?: string;
    phone?: string;
    company_name?: string;
  }): Promise<number> {
    return this.create('res.partner', contact);
  }
}
