import { User, Driver, Vehicle, RideRequest, RideOffer, Ride, Rating } from "@prisma/client";

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: "CUSTOMER" | "DRIVER" | "ADMIN";
  profilePhoto?: string;
  driverStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
}

export interface RideRequestWithDetails extends RideRequest {
  customer: User;
  vehicle: Vehicle;
  offers: (RideOffer & { driver: Driver & { user: User } })[];
  ride?: Ride | null;
}

export interface RideOfferWithDetails extends RideOffer {
  driver: Driver & { user: User };
  request: RideRequest & { customer: User; vehicle: Vehicle };
}

export interface RideWithDetails extends Ride {
  request: RideRequest & { customer: User; vehicle: Vehicle };
  offer: RideOffer;
  driver: Driver & { user: User };
  photos: any[];
  payment?: any;
  ratings: Rating[];
}

export interface DriverStats {
  totalRides: number;
  totalEarnings: number;
  ratingAvg: number;
  ratingCount: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  pendingDrivers: number;
  totalRides: number;
  completedRides: number;
  totalRevenue: number;
  platformRevenue: number;
  activeRequests: number;
  openDisputes: number;
  openTickets: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}