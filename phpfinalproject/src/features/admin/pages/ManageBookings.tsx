import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useBookingStore } from '@/features/admin/stores/bookingStore';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { Booking } from '@/features/admin/types/booking';
import { Search, X, Eye, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ManageBookings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { bookings, updateBookingStatus, cancelBooking } = useBookingStore();

  // Modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('pending');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/adminlogin');
    }
  }, [isAuthenticated, user, navigate]);

  // Filter bookings - split into active and historical
  const activeBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Only show active statuses (pending, confirmed, active)
      const isActive = ['pending', 'confirmed', 'active'].includes(booking.status);
      if (!isActive) return false;

      const matchesSearch =
        searchTerm === '' ||
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const historicalBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Only show historical statuses (completed, cancelled)
      const isHistorical = ['completed', 'cancelled'].includes(booking.status);
      if (!isHistorical) return false;

      const matchesSearch =
        searchTerm === '' ||
        booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Open update status modal
  const handleStatusClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsStatusModalOpen(true);
  };

  // Save new status
  const handleStatusUpdate = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, newStatus);
      toast.success(`Booking ${selectedBooking.bookingNumber} status updated to ${newStatus}`);
      setIsStatusModalOpen(false);
    }
  };

  // Open cancel confirmation
  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  // Confirm cancel
  const handleCancelConfirm = () => {
    if (selectedBooking) {
      cancelBooking(selectedBooking.id);
      toast.success(`Booking ${selectedBooking.bookingNumber} has been cancelled`);
      setIsCancelModalOpen(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content - Offset by sidebar width */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Bookings</h1>
                <p className="text-sm text-muted-foreground">View and manage all rental bookings</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{bookings.length}</span> bookings
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by booking #, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active: {activeBookings.length}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Historical: {historicalBookings.length}
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Total: {bookings.length}
              </Badge>
            </div>
          </div>

          {/* Active Bookings Table */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">Active Bookings</h2>
              <Badge className="bg-green-500">{activeBookings.length}</Badge>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.vehicleName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{booking.startDate}</div>
                          <div className="text-muted-foreground">to {booking.endDate}</div>
                          <div className="text-xs text-muted-foreground">({booking.totalDays} days)</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">₱{booking.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusClick(booking)}
                            disabled={booking.status === 'cancelled'}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelClick(booking)}
                            disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {activeBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No active bookings found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Historical Bookings Table */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-muted-foreground">Completed & Cancelled Bookings</h2>
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">{historicalBookings.length}</Badge>
            </div>
            <div className="bg-card/50 border border-border/50 rounded-lg overflow-hidden opacity-90">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-muted-foreground">Booking #</TableHead>
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Vehicle</TableHead>
                    <TableHead className="text-muted-foreground">Dates</TableHead>
                    <TableHead className="text-muted-foreground">Total</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalBookings.map((booking) => (
                    <TableRow key={booking.id} className="opacity-80">
                      <TableCell className="font-medium text-muted-foreground">{booking.bookingNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-muted-foreground">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground/70">{booking.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{booking.vehicleName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-muted-foreground">{booking.startDate}</div>
                          <div className="text-muted-foreground/70">to {booking.endDate}</div>
                          <div className="text-xs text-muted-foreground/70">({booking.totalDays} days)</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-muted-foreground">₱{booking.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusClick(booking)}
                            disabled={booking.status === 'cancelled'}
                            className="opacity-50"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={true}
                            className="text-red-500/50 opacity-50 cursor-not-allowed"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {historicalBookings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No historical bookings found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Update Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Update the status for booking {selectedBooking?.bookingNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value: Booking['status']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} className="bg-primary">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.bookingNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-500 hover:bg-red-600">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
