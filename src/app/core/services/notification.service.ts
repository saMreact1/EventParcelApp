import { Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';

declare const Pusher: any;

export interface Notification {
  id: number;
  type: 'new_order' | 'rsvp' | 'new_guest';
  title: string;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private pusher: any = null;
  private channel: any = null;
  private idCounter = 0;

  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = signal(0);

  connect(hostId: number): void {
    if (this.pusher || !environment.pusherKey || environment.pusherKey.startsWith('YOUR_')) return;

    this.pusher = new Pusher(environment.pusherKey, {
      cluster: environment.pusherCluster,
      encrypted: true,
    });

    this.channel = this.pusher.subscribe(`host-${hostId}`);

    this.channel.bind('new-order', (data: any) => {
      this.addNotification({
        type: 'new_order',
        title: 'New Order',
        message: `${data.guestName} placed an order for ${data.eventTitle} — ${data.amount}`,
      });
    });

    this.channel.bind('rsvp-update', (data: any) => {
      this.addNotification({
        type: 'rsvp',
        title: 'RSVP Update',
        message: `${data.guestName} responded "${data.status}" to ${data.eventTitle}`,
      });
    });

    this.channel.bind('new-guest', (data: any) => {
      this.addNotification({
        type: 'new_guest',
        title: 'New Guest',
        message: `${data.guestName} was added to ${data.eventTitle}`,
      });
    });
  }

  disconnect(): void {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channel = null;
    }
  }

  private addNotification(data: Omit<Notification, 'id' | 'timestamp'>): void {
    const notification: Notification = {
      ...data,
      id: ++this.idCounter,
      timestamp: new Date(),
    };
    this.notifications.update(n => [notification, ...n].slice(0, 20));
    this.unreadCount.update(c => c + 1);
  }

  markAllRead(): void {
    this.unreadCount.set(0);
  }

  dismiss(id: number): void {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}
