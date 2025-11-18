import { create } from 'zustand';
import { Car } from '@/features/cars/types/car';
import { vehiclesApi, ApiError } from '@/api/client';
import { toast } from 'sonner';

interface VehicleState {
  vehicles: Car[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Car, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Car>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  deleteMultipleVehicles: (ids: string[]) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehiclesApi.getAll();
      set({ vehicles: response.vehicles, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to fetch vehicles';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  addVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehiclesApi.create(vehicleData);
      set((state) => ({
        vehicles: [...state.vehicles, response.vehicle],
        isLoading: false,
      }));
      toast.success('Vehicle added successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to add vehicle';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateVehicle: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehiclesApi.update(id, updates);
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === id ? response.vehicle : vehicle
        ),
        isLoading: false,
      }));
      toast.success('Vehicle updated successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to update vehicle';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await vehiclesApi.delete(id);
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id),
        isLoading: false,
      }));
      toast.success('Vehicle deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to delete vehicle';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteMultipleVehicles: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      // Delete each vehicle sequentially
      await Promise.all(ids.map((id) => vehiclesApi.delete(id)));
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => !ids.includes(vehicle.id)),
        isLoading: false,
      }));
      toast.success(`${ids.length} vehicles deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Failed to delete vehicles';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },
}));
