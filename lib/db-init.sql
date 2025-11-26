-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('company', 'vendor')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendor_name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  employee_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  license_number VARCHAR(100),
  pan_number VARCHAR(50),
  aadhar_number VARCHAR(50),
  address TEXT,
  date_of_joining DATE,
  department VARCHAR(100),
  salary DECIMAL(10, 2),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(50),
  vehicle_type VARCHAR(50),
  vehicle_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sedan', 'hatchback', 'suv', 'luxury')),
  plate_number VARCHAR(50) UNIQUE NOT NULL,
  model VARCHAR(100),
  availability BOOLEAN DEFAULT true,
  condition_status VARCHAR(50) DEFAULT 'good',
  insurance_expiry DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  vendor_id UUID REFERENCES vendors(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_contact VARCHAR(50) NOT NULL,
  guest_location TEXT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_time TIMESTAMP NOT NULL,
  dropoff_time TIMESTAMP,
  car_category VARCHAR(50) NOT NULL CHECK (car_category IN ('sedan', 'hatchback', 'suv', 'luxury')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  reference_name VARCHAR(255),
  trip_details TEXT,
  in_open_market BOOLEAN DEFAULT false,
  open_market_time TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Company-Vendor associations (many-to-many)
CREATE TABLE IF NOT EXISTS company_vendor_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, vendor_id)
);

-- Vendor-Vendor associations for open market (whitelisted partners)
CREATE TABLE IF NOT EXISTS vendor_vendor_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  associated_vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vendor_id, associated_vendor_id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  vendor_id UUID REFERENCES vendors(id),
  invoice_number VARCHAR(100) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  op_km DECIMAL(10, 2),
  total_km DECIMAL(10, 2),
  toll_parking DECIMAL(10, 2),
  fuel_office DECIMAL(10, 2),
  fuel_cash DECIMAL(10, 2),
  road_tax DECIMAL(10, 2),
  expenses DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_open_market ON bookings(in_open_market);
CREATE INDEX IF NOT EXISTS idx_drivers_vendor ON drivers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vendor ON vehicles(vendor_id);
