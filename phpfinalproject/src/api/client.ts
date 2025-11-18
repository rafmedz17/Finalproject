/**
 * API Client
 *
 * Central API client for communicating with the PHP backend
 */

const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Important for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or parsing error
    throw new ApiError(
      'Network error. Please check your connection.',
      0
    );
  }
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Register new user
   */
  signup: async (email: string, password: string, name: string) => {
    return apiRequest('/auth/signup.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  /**
   * Logout current user
   */
  logout: async () => {
    return apiRequest('/auth/logout.php', {
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user
   */
  me: async () => {
    return apiRequest('/auth/me.php', {
      method: 'GET',
    });
  },
};

/**
 * Vehicles API
 */
export const vehiclesApi = {
  /**
   * Get all vehicles with optional filters
   */
  getAll: async (params?: {
    category?: string;
    available?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.available !== undefined)
      queryParams.append('available', params.available.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return apiRequest(`/vehicles/index.php${query ? `?${query}` : ''}`);
  },

  /**
   * Get single vehicle by ID
   */
  getById: async (id: string | number) => {
    return apiRequest(`/vehicles/show.php?id=${id}`);
  },

  /**
   * Create new vehicle (admin only)
   */
  create: async (vehicleData: any) => {
    return apiRequest('/vehicles/create.php', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  /**
   * Update vehicle (admin only)
   */
  update: async (id: string | number, vehicleData: any) => {
    return apiRequest('/vehicles/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...vehicleData }),
    });
  },

  /**
   * Delete vehicle (admin only)
   */
  delete: async (id: string | number) => {
    return apiRequest(`/vehicles/delete.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Bookings API
 */
export const bookingsApi = {
  /**
   * Get all bookings (admin sees all, customers see only theirs)
   */
  getAll: async (params?: { status?: string }) => {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return apiRequest(`/bookings/index.php${query ? `?${query}` : ''}`);
  },

  /**
   * Get single booking by ID
   */
  getById: async (id: string | number) => {
    return apiRequest(`/bookings/show.php?id=${id}`);
  },

  /**
   * Create new booking
   */
  create: async (bookingData: {
    vehicleId: string | number;
    startDate: string;
    endDate: string;
  }) => {
    return apiRequest('/bookings/create.php', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  /**
   * Update booking status (admin only)
   */
  updateStatus: async (
    id: string | number,
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  ) => {
    return apiRequest('/bookings/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
  },

  /**
   * Cancel booking
   */
  cancel: async (id: string | number) => {
    return apiRequest(`/bookings/cancel.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Export the ApiError for error handling in components
 */
export { ApiError };

/**
 * Export a default api object with all endpoints
 */
export const api = {
  auth: authApi,
  vehicles: vehiclesApi,
  bookings: bookingsApi,
};
