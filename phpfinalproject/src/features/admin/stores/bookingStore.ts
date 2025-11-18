import { create } from 'zustand';
import { Booking } from '../types/booking';
import { bookingsApi, ApiError } from '@/api/client';
import { toast } from 'sonner';

interface CreateBookingData {
  vehicleId: string;
  startDate: string;
  endDate: string;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (data: CreateBookingData) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingsApi.getAll();
      set({ bookings: response.bookings, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to fetch bookings';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingsApi.create(data);
      set((state) => ({
        bookings: [response.booking, ...state.bookings],
        isLoading: false,
      }));
      toast.success('Booking created successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to create booking';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateBookingStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingsApi.updateStatus(id, status);
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? response.booking : booking
        ),
        isLoading: false,
      }));
      toast.success('Booking status updated');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to update booking';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  cancelBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await bookingsApi.cancel(id);
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        ),
        isLoading: false,
      }));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to cancel booking';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
}));
