export type EventStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export interface EventSummary {
  id: number;
  title: string;
  eventDate: string;
  city: string;
  status: EventStatus;
  eventCode: string;
  guestCount: number;
  paidOrderCount: number;
  totalRevenue: number;
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  city: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  status: EventStatus;
  eventCode: string;
  hostId: number;
  hostName: string;
  guestCount: number;
  orderCount: number;
  revenue: number;
  numberOfGroups: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  numberOfGroups?: number;
  coverImageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  coverImageUrl?: string;
  status?: EventStatus;
  numberOfGroups?: number;
}

export type RsvpStatus = 'PENDING' | 'GOING' | 'MAYBE' | 'DECLINED';

export interface Guest {
  id: number;
  eventId: number;
  fullName: string;
  email: string;
  phone: string;
  invitationToken: string | null;
  invitationSent: boolean;
  invitationViewed: boolean;
  rsvpStatus: RsvpStatus;
  createdAt: string;
}

export interface AddGuestRequest {
  fullName: string;
  email?: string;
  phone?: string;
}

export interface UpdateGuestRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  invitationSent?: boolean;
  rsvpStatus?: RsvpStatus;
}

export interface GuestStats {
  totalGuests: number;
  invitationsSent: number;
  invitationsViewed: number;
  rsvpGoing: number;
  rsvpMaybe: number;
  rsvpDeclined: number;
  rsvpPending: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Groups & Packages
export interface EventGroup {
  id: number;
  eventId: number;
  name: string;
  description: string;
  currency: string;
  privacy: string;
  packages: EventPackage[];
  createdAt: string;
}

export interface EventPackage {
  id: number;
  groupId: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  quantity: number;
  deliveryType: string;
  packageSize: string;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  currency?: string;
  privacy: string;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantity?: number;
  deliveryType: string;
  packageSize?: string;
}

// Payment Setup
export interface PaymentSetup {
  id: number;
  eventId: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentDeadlineDate: string;
  paymentDeadlineTime: string;
  timezone: string;
  createdAt: string;
}

export interface CreatePaymentSetupRequest {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  paymentDeadlineDate?: string;
  paymentDeadlineTime?: string;
  timezone?: string;
}

// Pickup Details
export interface PickupDetails {
  id: number;
  eventId: number;
  contactName: string;
  contactPhone: string;
  pickupLocation: string;
  state: string;
  city: string;
  pickupStartDate: string;
  pickupStartTime: string;
  timezone: string;
  createdAt: string;
}

export interface CreatePickupDetailsRequest {
  contactName?: string;
  contactPhone?: string;
  pickupLocation?: string;
  state?: string;
  city?: string;
  pickupStartDate?: string;
  pickupStartTime?: string;
  timezone?: string;
}

// ── Orders ──

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  eventPackageId: number;
  packageName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  eventId: number;
  eventTitle: string;
  guestId: number | null;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  totalAmount: number;
  paymentStatus: OrderStatus;
  paystackReference: string;
  paidAt: string | null;
  hostCreated: boolean;
  items: OrderItem[];
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryPhone: string | null;
  shipped: boolean;
  createdAt: string;
}

export interface OrderSummary {
  id: number;
  eventId: number;
  eventName: string;
  orderCode: string;
  guestName: string;
  totalAmount: number;
  paymentStatus: OrderStatus;
  paidAt: string | null;
  createdAt: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryPhone: string | null;
  shipped: boolean;
}

export interface CreateOrderRequest {
  eventCode: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  guestId?: number;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  eventPackageId: number;
  quantity: number;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

// ── Transactions ──

export interface TransactionSummary {
  id: number;
  orderId: number;
  orderCode: string;
  eventId: number;
  eventTitle: string;
  guestName: string;
  guestPayment: number;
  amountReceived: number;
  platformFee: number;
  paymentStatus: OrderStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface TransactionStats {
  overallSales: number;
  overallSalesUsd: number;
  netSales: number;
  netSalesUsd: number;
}