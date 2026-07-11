import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing-page').then(m => m.LandingPage),
        title: 'Event Parcel — Simplify Aso-Ebi Management',
      },
      {
        path: 'features',
        loadComponent: () => import('./features/landing/landing-page').then(m => m.LandingPage),
        title: 'Features — Event Parcel',
      },
      {
        path: 'about',
        loadComponent: () => import('./features/landing/landing-page').then(m => m.LandingPage),
        title: 'About — Event Parcel',
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/landing/landing-page').then(m => m.LandingPage),
        title: 'FAQs — Event Parcel',
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/auth/auth-layout').then(m => m.AuthLayout),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login-page').then(m => m.LoginPage),
        title: 'Login — Event Parcel',
      },
      {
        path: 'signup',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/signup/signup-page').then(m => m.SignupPage),
        title: 'Create Account — Event Parcel',
      },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/forgot-password/forgot-password-page').then(m => m.ForgotPasswordPage),
        title: 'Reset Password — Event Parcel',
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/dashboard/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-page').then(m => m.DashboardPage),
        title: 'Dashboard — Event Parcel',
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/event-list/event-list-page').then(m => m.EventListPage),
        title: 'Events — Event Parcel',
      },
      {
        path: 'events/new',
        loadComponent: () => import('./features/events/event-create/event-create-page').then(m => m.EventCreatePage),
        title: 'Create Event — Event Parcel',
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/events/event-detail/event-detail-page').then(m => m.EventDetailPage),
        title: 'Event — Event Parcel',
      },
      {
        path: 'events/:id/edit',
        loadComponent: () => import('./features/events/event-edit/event-edit-page').then(m => m.EventEditPage),
        title: 'Edit Event — Event Parcel',
      },
      {
        path: 'events/:eventId/groups',
        loadComponent: () => import('./features/events/event-groups/event-groups-page').then(m => m.EventGroupsPage),
        title: 'Event Groups — Event Parcel',
      },
      {
        path: 'events/:eventId/payment-setup',
        loadComponent: () => import('./features/events/payment-setup/payment-setup-page').then(m => m.PaymentSetupPage),
        title: 'Payment Setup — Event Parcel',
      },
      {
        path: 'events/:eventId/pickup-details',
        loadComponent: () => import('./features/events/pickup-details/pickup-details-page').then(m => m.PickupDetailsPage),
        title: 'Pickup Details — Event Parcel',
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders-page').then(m => m.OrdersPage),
        title: 'Orders — Event Parcel',
      },
      {
        path: 'orders/:orderCode',
        loadComponent: () => import('./features/orders/order-detail-page').then(m => m.OrderDetailPage),
        title: 'Order Details — Event Parcel',
      },
      {
        path: 'delivery',
        loadComponent: () => import('./features/delivery/delivery-page').then(m => m.DeliveryPage),
        title: 'Delivery — Event Parcel',
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/transactions-page').then(m => m.TransactionsPage),
        title: 'Transactions — Event Parcel',
      },
      {
        path: 'co-host',
        loadComponent: () => import('./features/co-host/co-host-page').then(m => m.CoHostPage),
        title: 'Co-Hosts — Event Parcel',
      },
      {
        path: 'discounts',
        loadComponent: () => import('./features/discounts/discounts-page').then(m => m.DiscountsPage),
        title: 'Discounts — Event Parcel',
      },
    ],
  },
  // ── GUEST: Public event/order pages ── NO GUARDS ──
  {
    path: 'event/:code',
    loadComponent: () => import('./features/guest/guest-event-page').then(m => m.GuestEventPage),
    title: 'View Event — Event Parcel',
  },
  {
    path: 'event/:code/checkout',
    loadComponent: () => import('./features/guest/guest-checkout-page').then(m => m.GuestCheckoutPage),
    title: 'Checkout — Event Parcel',
  },
  {
    path: 'event/:code/confirmation',
    loadComponent: () => import('./features/guest/guest-confirmation-page').then(m => m.GuestConfirmationPage),
    title: 'Order Confirmed — Event Parcel',
  },
  {
    path: 'rsvp/:token',
    loadComponent: () => import('./features/guest/rsvp-page').then(m => m.RsvpPage),
    title: 'RSVP — Event Parcel',
  },
  {
    path: '**',
    redirectTo: '',
  },
];