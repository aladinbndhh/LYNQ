declare module 'xmlrpc' {
  interface ClientOptions {
    host: string;
    port: number;
    path: string;
  }

  interface SecureClientOptions {
    host: string;
    port: number;
    path: string;
  }

  interface Client {
    methodCall(method: string, params: any[], callback: (error: any, value: any) => void): void;
  }

  interface SecureClient {
    methodCall(method: string, params: any[], callback: (error: any, value: any) => void): void;
  }

  export function createClient(options: ClientOptions): Client;
  export function createSecureClient(options: SecureClientOptions): SecureClient;
}
