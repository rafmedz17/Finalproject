-- Car Rental System Seed Data
-- Note: All passwords are hashed using bcrypt. Default password for all users: "password123"

-- Insert Users
-- Admin user: admin@example.com / password123
-- Customer users: Use their email addresses with password: password123
INSERT INTO users (email, password, name, role) VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin'),
('john.doe@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'customer'),
('jane.smith@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', 'customer'),
('mike.johnson@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike Johnson', 'customer'),
('sarah.williams@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Williams', 'customer'),
('robert.brown@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert Brown', 'customer'),
('emily.davis@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily Davis', 'customer'),
('david.wilson@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Wilson', 'customer'),
('lisa.martinez@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa Martinez', 'customer');

-- Insert Vehicles
INSERT INTO vehicles (id, name, brand, category, price_per_day, image, seats, transmission, fuel, available, description, year, mileage, features) VALUES
(1, 'Rolls-Royce Phantom', 'Rolls-Royce', 'Luxury Sedan', 1500.00, '/placeholder.svg', 5, 'Automatic', 'Gasoline', TRUE,
'The Rolls-Royce Phantom represents the pinnacle of automotive luxury. This masterpiece combines timeless elegance with cutting-edge technology, featuring a hand-crafted interior with the finest leather and wood veneers. Experience unparalleled comfort and prestige with whisper-quiet cabin and effortless V12 power.',
2024, 'Unlimited',
'["Premium Sound System", "Starlight Headliner", "Massage Seats", "Champagne Cooler", "Rear Entertainment", "Suicide Doors", "Hand-Crafted Interior", "Advanced Safety Systems"]'),

(2, 'Bentley Continental GT', 'Bentley', 'Luxury Coupe', 1200.00, '/placeholder.svg', 4, 'Automatic', 'Gasoline', TRUE,
'The Bentley Continental GT is the ultimate grand tourer, blending breathtaking performance with handcrafted luxury. Powered by a mighty W12 engine, this British icon delivers exhilarating speed while cocooning passengers in sumptuous comfort. Perfect for those who demand both power and prestige.',
2024, 'Unlimited',
'["W12 Twin-Turbo Engine", "Diamond-Quilted Leather", "Rotating Display", "Naim Audio System", "Adaptive Cruise Control", "Night Vision", "Heated & Ventilated Seats", "Panoramic Sunroof"]'),

(3, 'Mercedes-Benz S-Class', 'Mercedes-Benz', 'Luxury Sedan', 800.00, '/placeholder.svg', 5, 'Automatic', 'Hybrid', TRUE,
'The Mercedes-Benz S-Class sets the benchmark for luxury sedans worldwide. This plug-in hybrid combines eco-conscious engineering with opulent comfort and cutting-edge technology. Experience the future of luxury mobility with intelligent drive systems and a serene, tech-forward cabin.',
2024, 'Unlimited',
'["Plug-in Hybrid System", "MBUX Infotainment", "Burmester 3D Sound", "Executive Rear Seats", "Ambient Lighting (64 colors)", "Active Suspension", "Head-Up Display", "Wireless Charging"]'),

(4, 'Porsche 911 Turbo', 'Porsche', 'Sports Car', 1000.00, '/placeholder.svg', 4, 'Automatic', 'Gasoline', FALSE,
'The legendary Porsche 911 Turbo delivers pure driving exhilaration with its twin-turbocharged flat-six engine and iconic design. This sports car icon offers blistering acceleration, precise handling, and everyday usability. Experience automotive perfection with German engineering at its finest.',
2024, 'Limited to 200km/day',
'["Twin-Turbo Flat-Six Engine", "PDK Transmission", "Sport Chrono Package", "PASM Suspension", "Porsche Track Precision App", "Sport Exhaust System", "Adaptive Sport Seats", "Launch Control"]'),

(5, 'Range Rover Autobiography', 'Land Rover', 'Luxury SUV', 900.00, '/placeholder.svg', 7, 'Automatic', 'Diesel', TRUE,
'The Range Rover Autobiography represents the pinnacle of luxury SUVs, offering unmatched refinement, capability, and prestige. Whether navigating city streets or exploring off-road terrain, this flagship SUV delivers supreme comfort with its spacious cabin and advanced technology.',
2024, 'Unlimited',
'["Terrain Response 2", "Air Suspension", "Windsor Leather Interior", "Meridian Sound System", "Configurable Ambient Lighting", "Panoramic Roof", "Powered Gesture Tailgate", "Wade Sensing"]'),

(6, 'Lamborghini Urus', 'Lamborghini', 'Super SUV', 1800.00, '/placeholder.svg', 5, 'Automatic', 'Gasoline', TRUE,
'The Lamborghini Urus redefines the super SUV category with Italian flair and supercar performance. This bold statement on wheels combines the soul of a sports car with the versatility of an SUV, featuring a powerful V8 engine and unmistakable Lamborghini design language.',
2024, 'Limited to 150km/day',
'["Twin-Turbo V8 Engine", "Anima Drive Modes", "Carbon Ceramic Brakes", "Tamburo Driving Mode Selector", "Premium Alcantara Interior", "Bang & Olufsen Audio", "Active Aerodynamics", "Rear-Wheel Steering"]');

-- Insert Bookings
-- Note: user_id references the users table. Matching emails from users table above.
INSERT INTO bookings (booking_number, user_id, vehicle_id, customer_name, customer_email, vehicle_name, start_date, end_date, total_days, price_per_day, total_amount, status, created_at) VALUES
('BK-2024-001', 2, 1, 'John Doe', 'john.doe@example.com', 'Rolls-Royce Phantom', '2024-01-20', '2024-01-25', 5, 1500.00, 7500.00, 'confirmed', '2024-01-15 10:00:00'),
('BK-2024-002', 3, 2, 'Jane Smith', 'jane.smith@example.com', 'Bentley Continental GT', '2024-01-18', '2024-01-22', 4, 1200.00, 4800.00, 'active', '2024-01-14 14:30:00'),
('BK-2024-003', 4, 3, 'Mike Johnson', 'mike.johnson@example.com', 'Mercedes-Benz S-Class', '2024-01-25', '2024-01-28', 3, 800.00, 2400.00, 'pending', '2024-01-16 09:15:00'),
('BK-2024-004', 5, 5, 'Sarah Williams', 'sarah.williams@example.com', 'Range Rover Autobiography', '2024-01-10', '2024-01-15', 5, 900.00, 4500.00, 'completed', '2024-01-08 11:20:00'),
('BK-2024-005', 6, 6, 'Robert Brown', 'robert.brown@example.com', 'Lamborghini Urus', '2024-01-22', '2024-01-24', 2, 1800.00, 3600.00, 'confirmed', '2024-01-17 16:45:00'),
('BK-2024-006', 7, 4, 'Emily Davis', 'emily.davis@example.com', 'Porsche 911 Turbo', '2024-01-15', '2024-01-18', 3, 1000.00, 3000.00, 'cancelled', '2024-01-12 13:00:00'),
('BK-2024-007', 8, 1, 'David Wilson', 'david.wilson@example.com', 'Rolls-Royce Phantom', '2024-01-28', '2024-02-02', 5, 1500.00, 7500.00, 'pending', '2024-01-18 08:30:00'),
('BK-2024-008', 9, 3, 'Lisa Martinez', 'lisa.martinez@example.com', 'Mercedes-Benz S-Class', '2024-01-19', '2024-01-21', 2, 800.00, 1600.00, 'active', '2024-01-16 15:20:00');
