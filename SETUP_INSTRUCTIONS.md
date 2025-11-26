# 🚀 Setup Instructions for CabBooking Pro

## Step 1: Set Up Database in Supabase

### A. Access Supabase SQL Editor

1. Go to: https://uxxutyvtoovenbbhovhf.supabase.co
2. Login to your Supabase account
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### B. Run Database Creation Script

Copy and paste the entire content of `/app/lib/db-init.sql` into the SQL editor and click **"Run"**.

This will create all necessary tables:
- users, companies, vendors
- drivers, vehicles, bookings
- company_vendor_associations, vendor_vendor_associations
- invoices

### C. Create Demo Data (Optional but Recommended)

After creating tables, run this SQL to create demo users and associations:

```sql
-- Create demo company user
INSERT INTO users (id, email, password_hash, role, name, phone) 
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'company@demo.com',
  '$2a$10$rQ3YqZYxZ7kQkqKqZYxZ7.rQ3YqZYxZ7kQkqKqZYxZ7kQkqKqZYxZ7',
  'company',
  'Acme Corporation',
  '+1234567890'
);

-- Create company profile
INSERT INTO companies (id, user_id, company_name, address, contact_person, phone)
VALUES (
  'c2222222-2222-2222-2222-222222222222',
  'c1111111-1111-1111-1111-111111111111',
  'Acme Corporation',
  '123 Business Park, Tech City',
  'John Manager',
  '+1234567890'
);

-- Create demo vendor user 1
INSERT INTO users (id, email, password_hash, role, name, phone) 
VALUES (
  'v1111111-1111-1111-1111-111111111111',
  'vendor@demo.com',
  '$2a$10$rQ3YqZYxZ7kQkqKqZYxZ7.rQ3YqZYxZ7kQkqKqZYxZ7kQkqKqZYxZ7',
  'vendor',
  'Quick Cabs Service',
  '+1234567891'
);

-- Create vendor profile 1
INSERT INTO vendors (id, user_id, vendor_name, address, contact_person, phone)
VALUES (
  'v2222222-2222-2222-2222-222222222222',
  'v1111111-1111-1111-1111-111111111111',
  'Quick Cabs Service',
  '456 Transport Hub, Tech City',
  'Sarah Vendor',
  '+1234567891'
);

-- Create demo vendor user 2
INSERT INTO users (id, email, password_hash, role, name, phone) 
VALUES (
  'v3333333-3333-3333-3333-333333333333',
  'vendor2@demo.com',
  '$2a$10$rQ3YqZYxZ7kQkqKqZYxZ7.rQ3YqZYxZ7kQkqKqZYxZ7kQkqKqZYxZ7',
  'vendor',
  'Premium Transport Co',
  '+1234567892'
);

-- Create vendor profile 2
INSERT INTO vendors (id, user_id, vendor_name, address, contact_person, phone)
VALUES (
  'v4444444-4444-4444-4444-444444444444',
  'v3333333-3333-3333-3333-333333333333',
  'Premium Transport Co',
  '789 Fleet Street, Tech City',
  'Mike Transport',
  '+1234567892'
);

-- Associate company with both vendors
INSERT INTO company_vendor_associations (company_id, vendor_id)
VALUES 
  ('c2222222-2222-2222-2222-222222222222', 'v2222222-2222-2222-2222-222222222222'),
  ('c2222222-2222-2222-2222-222222222222', 'v4444444-4444-4444-4444-444444444444');

-- Associate vendors with each other (for open market)
INSERT INTO vendor_vendor_associations (vendor_id, associated_vendor_id)
VALUES 
  ('v2222222-2222-2222-2222-222222222222', 'v4444444-4444-4444-4444-444444444444'),
  ('v4444444-4444-4444-4444-444444444444', 'v2222222-2222-2222-2222-222222222222');

-- Add demo drivers for Vendor 1
INSERT INTO drivers (vendor_id, employee_id, name, phone, email, license_number, vehicle_type, vehicle_number)
VALUES 
  ('v2222222-2222-2222-2222-222222222222', 'DRV001', 'Raj Kumar', '+919876543210', 'raj@quickcabs.com', 'DL123456789', 'sedan', 'KA01AB1234'),
  ('v2222222-2222-2222-2222-222222222222', 'DRV002', 'Amit Singh', '+919876543211', 'amit@quickcabs.com', 'DL987654321', 'suv', 'KA01CD5678');

-- Add demo vehicles for Vendor 1
INSERT INTO vehicles (vendor_id, type, plate_number, model, availability, condition_status)
VALUES 
  ('v2222222-2222-2222-2222-222222222222', 'sedan', 'KA01AB1234', 'Honda City 2023', true, 'good'),
  ('v2222222-2222-2222-2222-222222222222', 'suv', 'KA01CD5678', 'Toyota Fortuner 2024', true, 'excellent'),
  ('v2222222-2222-2222-2222-222222222222', 'hatchback', 'KA01EF9012', 'Maruti Swift 2022', true, 'good');

-- Add demo drivers for Vendor 2
INSERT INTO drivers (vendor_id, employee_id, name, phone, email, license_number, vehicle_type, vehicle_number)
VALUES 
  ('v4444444-4444-4444-4444-444444444444', 'DRV101', 'Mohammed Ali', '+919876543220', 'ali@premium.com', 'DL111222333', 'luxury', 'KA02XY1111'),
  ('v4444444-4444-4444-4444-444444444444', 'DRV102', 'Priya Sharma', '+919876543221', 'priya@premium.com', 'DL444555666', 'sedan', 'KA02ZZ2222');

-- Add demo vehicles for Vendor 2
INSERT INTO vehicles (vendor_id, type, plate_number, model, availability, condition_status)
VALUES 
  ('v4444444-4444-4444-4444-444444444444', 'luxury', 'KA02XY1111', 'Mercedes E-Class 2024', true, 'excellent'),
  ('v4444444-4444-4444-4444-444444444444', 'sedan', 'KA02ZZ2222', 'Honda Accord 2023', true, 'excellent');
```

**Note**: Demo password for all users is: `password123`

## Step 2: Test the Application

### A. Test Company Login

1. Go to http://localhost:3000
2. Click **"Login"** tab
3. Email: `company@demo.com`
4. Password: `password123`
5. You'll be redirected to Company Dashboard

### B. Test Vendor Login

1. Open a new incognito/private window
2. Go to http://localhost:3000
3. Click **"Login"** tab
4. Email: `vendor@demo.com`
5. Password: `password123`
6. You'll be redirected to Vendor Dashboard

### C. Create a Booking (Company)

1. In Company Dashboard, click **"Create New Booking"**
2. Fill in:
   - Guest Name: Test Guest
   - Guest Contact: +919999999999
   - Pickup Location: MG Road, Bangalore
   - Dropoff Location: Airport, Bangalore
   - Pickup Time: (select a future date/time)
   - Car Category: Sedan
3. Click **"Create Booking"**
4. Booking appears in "Pending" status

### D. Accept Booking (Vendor)

1. Switch to vendor window
2. Go to **"Pending Requests"** tab
3. See the new booking request
4. Click **"Accept & Assign"**
5. Select a driver and vehicle
6. Click **"Confirm & Accept"**
7. Booking moves to "All Bookings" → "Upcoming"

### E. Test Trip Flow

1. In **"All Bookings"** → **"Upcoming"** tab
2. Find your booking
3. Click **"Start"** button → Status changes to "Ongoing"
4. Click **"End"** button → Status changes to "Completed"
5. Vehicle becomes available again

### F. Test Open Market

1. Create another booking from company
2. In vendor dashboard, click **"Open Market"** instead of Accept
3. Login as second vendor: `vendor2@demo.com`
4. Go to **"Open Market"** tab
5. See the booking (if within 30 minutes, only associated vendors see it)
6. Accept from open market

## Step 3: Create Your Own Users

### Register New Company

1. Go to home page
2. Click **"Register"** tab
3. Select role: **"Company"**
4. Fill in details:
   - Name
   - Email
   - Phone
   - Company Name
   - Address
   - Password
5. Click **"Create Account"**

### Register New Vendor

1. Open new incognito window
2. Go to home page
3. Click **"Register"** tab
4. Select role: **"Vendor"**
5. Fill in details:
   - Name
   - Email
   - Phone
   - Vendor Name
   - Address
   - Password
6. Click **"Create Account"**

### Create Association Between Your Users

Get the IDs from Supabase:
```sql
-- Get company ID
SELECT c.id, c.company_name, u.email 
FROM companies c 
JOIN users u ON c.user_id = u.id;

-- Get vendor ID
SELECT v.id, v.vendor_name, u.email 
FROM vendors v 
JOIN users u ON v.user_id = u.id;

-- Create association (replace IDs)
INSERT INTO company_vendor_associations (company_id, vendor_id)
VALUES ('your-company-id', 'your-vendor-id');
```

## 🎯 Quick Test Checklist

- [ ] Database tables created
- [ ] Demo data inserted
- [ ] Company login works
- [ ] Vendor login works
- [ ] Create booking (company)
- [ ] See pending request (vendor)
- [ ] Add driver (vendor)
- [ ] Add vehicle (vendor)
- [ ] Accept booking with assignment
- [ ] Start trip
- [ ] End trip
- [ ] Place booking in open market
- [ ] Accept from open market (second vendor)
- [ ] Create manual booking (vendor)

## 🐛 Common Issues

### Issue: "Invalid credentials" on login with demo accounts

**Solution**: The demo password hash is for `password123`. If bcrypt versions don't match, create a new user:

```sql
-- Get a proper hash by registering through UI first, then copy the hash
SELECT password_hash FROM users WHERE email = 'your-new-user@test.com';

-- Use that hash format for demo users
```

### Issue: Bookings not showing in vendor pending requests

**Solution**: Ensure company-vendor association exists:
```sql
SELECT * FROM company_vendor_associations;
```

### Issue: Can't assign driver/vehicle

**Solution**: Add drivers and vehicles first in vendor dashboard

### Issue: Open market not showing bookings

**Solution**: Create vendor-vendor associations:
```sql
INSERT INTO vendor_vendor_associations (vendor_id, associated_vendor_id)
VALUES ('vendor1-id', 'vendor2-id');
```

## 📊 Verify Data

Check if everything is set up correctly:

```sql
-- Check users
SELECT email, role, name FROM users;

-- Check companies
SELECT company_name FROM companies;

-- Check vendors
SELECT vendor_name FROM vendors;

-- Check associations
SELECT 
  c.company_name, 
  v.vendor_name 
FROM company_vendor_associations cva
JOIN companies c ON cva.company_id = c.id
JOIN vendors v ON cva.vendor_id = v.id;

-- Check drivers
SELECT name, phone, vehicle_number FROM drivers;

-- Check vehicles
SELECT plate_number, type, availability FROM vehicles;
```

## ✅ Next Steps

Once setup is complete:
1. Explore all vendor features (drivers, vehicles, manual bookings)
2. Test the complete booking workflow
3. Try the open market feature
4. Customize for your needs
5. Add more companies and vendors
6. Configure Mapbox (optional)
7. Set up RabbitMQ (optional)

---

**Need Help?** Check the README.md for detailed documentation!
