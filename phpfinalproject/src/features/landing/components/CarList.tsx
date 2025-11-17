import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Gauge, Fuel, Lock } from 'lucide-react';
import { mockCars } from '@/features/cars/data/mockCars';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { LoginModal } from '@/features/auth/components/LoginModal';
import { toast } from 'sonner';

export function CarList() {
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleRentClick = (carName: string) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      toast.info('Please login to rent a vehicle');
    } else {
      toast.success(`Rental request initiated for ${carName}`);
    }
  };

  return (
    <>
      <section id="cars" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Exclusive
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Vehicle Collection
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our handpicked selection of luxury vehicles, each offering 
              unmatched performance and sophistication.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCars.map((car) => (
              <div
                key={car.id}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-gold transition-all"
              >
                {/* Car Image */}
                <div className="relative h-56 overflow-hidden bg-secondary">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    {car.available ? (
                      <Badge className="bg-primary text-primary-foreground">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Rented
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">{car.name}</h3>
                    <p className="text-sm text-muted-foreground">{car.category}</p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{car.seats}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>{car.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span>{car.fuel}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">₱{car.pricePerDay}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                    <Button
                      onClick={() => handleRentClick(car.name)}
                      disabled={!car.available}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {!isAuthenticated ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Rent
                        </>
                      ) : car.available ? (
                        'Rent Now'
                      ) : (
                        'Unavailable'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
