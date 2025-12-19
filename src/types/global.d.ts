declare global {
  namespace NodeJS {
    interface Timeout {
      _id: number;
    }
  }
  
  interface NotificationAction {
    action: string;
    title: string;
  }
  
  interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    image?: string;
    data?: any;
    requireInteraction?: boolean;
    silent?: boolean;
    tag?: string;
    timestamp?: number;
    vibrate?: number[];
    actions?: NotificationAction[];
  }
}

export {};