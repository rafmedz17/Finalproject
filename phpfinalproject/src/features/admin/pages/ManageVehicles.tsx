import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useVehicleStore } from '@/features/admin/stores/vehicleStore';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { Car } from '@/features/cars/types/car';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export function ManageVehicles() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicleStore();

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Car | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Car | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    pricePerDay: '',
    seats: '',
    transmission: 'Automatic' as 'Automatic' | 'Manual',
    fuel: '',
    available: true,
    description: '',
    year: new Date().getFullYear().toString(),
    mileage: '',
    features: '',
  });

  // Image state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/adminlogin');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch vehicles from API on mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Open add modal
  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      brand: '',
      category: '',
      pricePerDay: '',
      seats: '',
      transmission: 'Automatic',
      fuel: '',
      available: true,
      description: '',
      year: new Date().getFullYear().toString(),
      mileage: '',
      features: '',
    });
    setImagePreview('');
    setImageFile(null);
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleEdit = (vehicle: Car) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      brand: vehicle.brand,
      category: vehicle.category,
      pricePerDay: vehicle.pricePerDay.toString(),
      seats: vehicle.seats.toString(),
      transmission: vehicle.transmission,
      fuel: vehicle.fuel,
      available: vehicle.available,
      description: vehicle.description || '',
      year: vehicle.year?.toString() || new Date().getFullYear().toString(),
      mileage: vehicle.mileage || '',
      features: vehicle.features?.join(', ') || '',
    });
    setImagePreview(vehicle.image);
    setImageFile(null);
    setIsAddEditOpen(true);
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP, or SVG)');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview('');
    setImageFile(null);
  };

  // Save vehicle (add or edit)
  const handleSave = () => {
    // Simple validation
    if (!formData.name || !formData.brand || !formData.category || !formData.pricePerDay) {
      toast.error('Please fill in all required fields');
      return;
    }

    const vehicleData = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      pricePerDay: Number(formData.pricePerDay),
      seats: Number(formData.seats) || 4,
      transmission: formData.transmission,
      fuel: formData.fuel,
      available: formData.available,
      description: formData.description,
      image: imagePreview || '/placeholder.svg',
      year: Number(formData.year) || new Date().getFullYear(),
      mileage: formData.mileage || 'Unlimited',
      features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(f => f) : [],
      images: imagePreview ? [imagePreview] : ['/placeholder.svg'],
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
      toast.success(`${formData.name} updated successfully`);
    } else {
      addVehicle(vehicleData);
      toast.success(`${formData.name} added successfully`);
    }

    setIsAddEditOpen(false);
  };

  // Open delete confirmation
  const handleDeleteClick = (vehicle: Car) => {
    setDeletingVehicle(vehicle);
    setIsDeleteOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (deletingVehicle) {
      deleteVehicle(deletingVehicle.id);
      toast.success(`${deletingVehicle.name} deleted successfully`);
      setIsDeleteOpen(false);
      setDeletingVehicle(null);
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
                <h1 className="text-2xl font-bold text-foreground">Manage Vehicles</h1>
                <p className="text-sm text-muted-foreground">Add, edit, or remove vehicles from your fleet</p>
              </div>
              <Button onClick={handleAdd} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vehicle
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.category}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    ₱{vehicle.pricePerDay}
                  </TableCell>
                  <TableCell>
                    {vehicle.available ? (
                      <Badge className="bg-green-500">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Rented</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(vehicle)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles yet. Add your first vehicle!</p>
            </div>
          )}
        </div>
        </main>

        {/* Add/Edit Modal */}
        <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              Fill in the vehicle details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label>Vehicle Image</Label>
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-24 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* File Input */}
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload JPG, PNG, WebP or SVG (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rolls-Royce Phantom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Rolls-Royce"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Luxury Sedan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Day (₱) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                  placeholder="e.g., 1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: 'Automatic' | 'Manual') =>
                    setFormData({ ...formData, transmission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <Input
                  id="fuel"
                  value={formData.fuel}
                  onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                  placeholder="e.g., Gasoline"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="e.g., 50,000 km or Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="e.g., Leather Seats, Sunroof, GPS Navigation"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the vehicle..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="available">Available for rent</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary">
              {editingVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {deletingVehicle?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
