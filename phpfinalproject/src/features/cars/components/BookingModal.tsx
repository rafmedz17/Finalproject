import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { Car } from '../types/car';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useBookingStore } from '@/features/admin/stores/bookingStore';
import { toast } from 'sonner';

// Booking schema
const bookingSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return start >= today;
}, {
  message: 'Start date cannot be in the past',
  path: ['startDate'],
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car;
}

export function BookingModal({ open, onOpenChange, car }: BookingModalProps) {
  const { user } = useAuthStore();
  const { createBooking } = useBookingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate total days and amount when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setTotalDays(diffDays);
      setTotalAmount(diffDays * car.pricePerDay);
    } else {
      setTotalDays(0);
      setTotalAmount(0);
    }
  }, [startDate, endDate, car.pricePerDay]);

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast.error('Please login to make a booking');
      return;
    }

    setIsLoading(true);
    try {
      createBooking({
        customerName: user.name,
        customerEmail: user.email,
        vehicleId: car.id,
        vehicleName: car.name,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        pricePerDay: car.pricePerDay,
        totalAmount,
      });

      toast.success(`Booking confirmed for ${car.name}!`);
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book {car.name}</DialogTitle>
          <DialogDescription>
            Select your rental dates and confirm your booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Vehicle Summary */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vehicle</span>
              <span className="font-medium">{car.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price per day</span>
              <span className="font-bold text-primary">₱{car.pricePerDay.toLocaleString()}</span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || today}
                {...register('endDate')}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          {totalDays > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground">Booking Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Total Days
                  </span>
                  <span className="font-medium">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">₱{car.pricePerDay.toLocaleString()} × {totalDays}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-primary">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          {user && (
            <div className="bg-secondary/30 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground mb-1">Booking for:</p>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary"
              disabled={isLoading || totalDays === 0}
            >
              {isLoading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
