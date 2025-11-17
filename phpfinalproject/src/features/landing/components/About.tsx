import { Crown, Star, Users, Car } from 'lucide-react';

export function About() {
  const stats = [
    { icon: Car, value: '200+', label: 'Premium Vehicles' },
    { icon: Users, value: '50K+', label: 'Happy Clients' },
    { icon: Star, value: '4.9', label: 'Average Rating' },
    { icon: Crown, value: '15+', label: 'Years Experience' },
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Pinnacle of
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Luxury Car Rentals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            For over a decade, Lord of the Rims has been the premier destination for discerning 
            clients seeking extraordinary automotive experiences. Our meticulously curated fleet 
            represents the finest in automotive excellence.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all group"
            >
              <stat.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Exceptional Service',
              description: 'White-glove treatment from booking to return, with personalized concierge support.',
            },
            {
              title: 'Pristine Vehicles',
              description: 'Every vehicle is meticulously maintained and detailed to perfection before delivery.',
            },
            {
              title: 'Flexible Terms',
              description: 'Whether for a day or a month, we offer flexible rental periods to suit your needs.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card p-8 rounded-xl border border-border hover:shadow-gold transition-all"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
