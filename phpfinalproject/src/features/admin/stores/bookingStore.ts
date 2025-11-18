import { create } from 'zustand';
import { Booking } from '../types/booking';
import { mockBookings } from '../data/mockBookings';

interface CreateBookingData {
  customerName: string;
  customerEmail: string;
  vehicleId: string;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
}

interface BookingState {
  bookings: Booking[];

  // Actions
  createBooking: (data: CreateBookingData) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [...mockBookings],

  createBooking: (data) => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      bookingNumber: `BK-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      pricePerDay: data.pricePerDay,
      totalAmount: data.totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));
  },

  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      ),
    }));
  },

  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' } : booking
      ),
    }));
  },
}));
