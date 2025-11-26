# CabBooking Pro - Corporate Cab Booking Portal

A comprehensive cab booking platform for corporate offices with vendor collaboration and open market features.

## 🚀 Features

### For Companies
- **Create Bookings**: Book cabs for employees with guest details and trip information
- **Real-time Tracking**: Track all bookings with status updates (Pending, Upcoming, Ongoing, Completed, Cancelled)
- **Vendor Network**: Manage associated vendors for reliable service
- **Dashboard**: Visual statistics and comprehensive booking management

### For Vendors
- **Booking Requests**: Receive and manage booking requests from associated companies
- **Accept/Reject/Open Market**: Flexible options to handle booking requests
- **Driver Management**: Add, view, and manage driver details with complete information
- **Vehicle Management**: Track vehicle availability, condition, and assignments
- **Manual Bookings**: Create bookings from walk-ins, calls, or WhatsApp
- **Trip Management**: Start and end trips with real-time status updates

### Open Market Feature
- **30-Minute Exclusive Window**: Associated vendors get first priority
- **Network-wide Access**: After 30 minutes, available to all vendors
- **First-Come-First-Served**: Fair distribution with SLA tracking
- **Fallback Mechanism**: Ensures maximum booking fulfillment

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS + Shadcn/UI
- **Backend**: Next.js API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Role-based access control
- **Real-time**: Polling-based updates (5-second intervals)
- **Styling**: Tailwind CSS with custom design system

## 📋 Prerequisites

- Node.js 18+ and Yarn
- Supabase account and project
- Modern web browser

## 🚀 Setup Instructions

### 1. Database Setup

The database schema is in `/app/lib/db-init.sql`. You need to execute it in your Supabase project:

1. Go to your Supabase dashboard: https://uxxutyvtoovenbbhovhf.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Create a **New Query**
4. Copy the contents of `/app/lib/db-init.sql`
5. Paste and click **Run**

This creates the following tables:
- `users` - User authentication and roles
- `companies` - Company profiles
- `vendors` - Vendor profiles
- `drivers` - Driver information with full details
- `vehicles` - Vehicle fleet management
- `bookings` - Booking records with status tracking
- `company_vendor_associations` - Many-to-many company-vendor relationships
- `vendor_vendor_associations` - Vendor partnerships for open market
- `invoices` - Billing and invoice management

### 2. Environment Variables

Already configured in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://uxxutyvtoovenbbhovhf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
```

### 3. Install Dependencies

```bash
cd /app
yarn install
```

### 4. Start Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 👤 User Roles

### Company User
- Create and track bookings
- View booking history
- Monitor booking status
- Manage vendor relationships

### Vendor User
- Receive booking requests
- Accept/Reject bookings
- Assign drivers and vehicles
- Create manual bookings
- Access open market
- Manage drivers and vehicles
- Track trip progress

## 📊 Database Schema

### Key Relationships
- Users → Companies/Vendors (one-to-one)
- Companies ↔ Vendors (many-to-many via `company_vendor_associations`)
- Vendors ↔ Vendors (many-to-many via `vendor_vendor_associations` for open market)
- Bookings → Company, Vendor, Driver, Vehicle (foreign keys)
- Invoices → Bookings, Vendors

## 🔄 Booking Workflow

1. **Company creates booking** → Status: `pending`
2. **Vendor receives request** → Can:
   - **Accept** → Assign driver/vehicle → Status: `upcoming`
   - **Reject** → Status: `cancelled`
   - **Open Market** → Available to other vendors

3. **Open Market Flow**:
   - First 30 minutes: Only associated vendors can see
   - After 30 minutes: All vendors in network can see
   - First vendor to accept gets the booking

4. **Trip Execution**:
   - **Start Trip** → Status: `ongoing`
   - **End Trip** → Status: `completed`, vehicle becomes available

## 🎨 Design System

- **Primary Color**: Blue (#0070F3)
- **Secondary Color**: Purple (#7C3AED)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Typography**: Inter font family
- **Components**: Shadcn/UI component library

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token stored in localStorage
- Protected routes with middleware

## 📱 Responsive Design

- Mobile-first approach
- Responsive tables and cards
- Touch-friendly interface
- Optimized for all screen sizes

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Company Endpoints
- `POST /api/company/bookings/create` - Create new booking
- `POST /api/company/bookings` - Get all company bookings

### Vendor Endpoints
- `POST /api/vendor/bookings/pending` - Get pending requests
- `POST /api/vendor/bookings/all` - Get all vendor bookings
- `POST /api/vendor/bookings/accept` - Accept and assign booking
- `POST /api/vendor/bookings/reject` - Reject booking
- `POST /api/vendor/bookings/open-market` - Place in open market
- `POST /api/vendor/bookings/start-trip` - Start trip
- `POST /api/vendor/bookings/end-trip` - End trip
- `POST /api/vendor/bookings/manual` - Create manual booking
- `POST /api/vendor/drivers` - Get drivers
- `POST /api/vendor/drivers/create` - Add driver
- `POST /api/vendor/drivers/delete` - Delete driver
- `POST /api/vendor/vehicles` - Get vehicles
- `POST /api/vendor/vehicles/create` - Add vehicle
- `POST /api/vendor/vehicles/delete` - Delete vehicle
- `POST /api/vendor/open-market/bookings` - Get open market bookings

## 🧪 Testing the Application

### 1. Register Users

**Register a Company:**
1. Go to http://localhost:3000
2. Click "Register"
3. Select role: "Company"
4. Fill in: Name, Email, Password, Company Name
5. Click "Create Account"

**Register a Vendor:**
1. Open incognito/private window
2. Go to http://localhost:3000
3. Click "Register"
4. Select role: "Vendor"
5. Fill in: Name, Email, Password, Vendor Name
6. Click "Create Account"

### 2. Create Company-Vendor Association

In Supabase SQL Editor, run:
```sql
-- Get IDs first
SELECT id, company_name FROM companies;
SELECT id, vendor_name FROM vendors;

-- Create association
INSERT INTO company_vendor_associations (company_id, vendor_id)
VALUES ('company_id_here', 'vendor_id_here');
```

### 3. Test Booking Flow

1. **Company Dashboard**: Create a new booking
2. **Vendor Dashboard**: See pending request
3. **Vendor**: Add drivers and vehicles
4. **Vendor**: Accept booking and assign driver/vehicle
5. **Both**: See status updated to "Upcoming"
6. **Vendor**: Start trip → Status: "Ongoing"
7. **Vendor**: End trip → Status: "Completed"

### 4. Test Open Market

1. **Vendor**: Create vendor-vendor association in database
2. **Vendor**: Place booking in open market
3. **Other Vendor**: See booking in open market tab
4. **Other Vendor**: Accept from open market

## 🗺️ Future Enhancements

### Map Integration (Ready for Mapbox)
The application is architected to easily add Mapbox:
1. Get Mapbox API key
2. Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local`
3. Install: `yarn add mapbox-gl react-map-gl`
4. Integrate map components in booking forms

### RabbitMQ Integration
For true real-time messaging:
1. Set up CloudAMQP or local RabbitMQ
2. Add connection string to env
3. Replace polling with RabbitMQ pub/sub
4. Instant notifications for vendors

### Additional Features
- Invoice generation and billing
- Payment gateway integration
- SMS/Email notifications
- Analytics dashboard
- Custom reporting tables
- Driver mobile app
- GPS tracking
- Route optimization

## 📝 Notes

- Auto-refresh: Dashboards poll every 5 seconds for updates
- Vehicle availability: Automatically managed during booking lifecycle
- Open market timer: 30-minute window for associated vendors
- Status flow: pending → upcoming → ongoing → completed
- All timestamps in ISO format

## 🐛 Troubleshooting

**Issue**: Login fails
- **Solution**: Ensure database tables are created in Supabase

**Issue**: Bookings not showing
- **Solution**: Create company-vendor association in database

**Issue**: Can't assign driver/vehicle
- **Solution**: Add drivers and vehicles first in vendor dashboard

**Issue**: API returns 401
- **Solution**: Token expired, logout and login again

## 📞 Support

For issues or questions:
1. Check database setup in Supabase
2. Verify environment variables
3. Check browser console for errors
4. Review API logs in Next.js terminal

## 🎯 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js  # All API endpoints
│   ├── company/dashboard/         # Company dashboard
│   ├── vendor/dashboard/          # Vendor dashboard
│   ├── page.js                    # Landing & auth page
│   └── layout.js                  # Root layout
├── components/ui/                 # Shadcn components
├── lib/
│   ├── supabase.js               # Supabase client
│   ├── auth.js                   # Auth utilities
│   └── db-init.sql               # Database schema
├── .env.local                    # Environment variables
└── package.json                  # Dependencies
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Works on AWS, Heroku, Railway, etc.
- Ensure Node.js 18+ support
- Set environment variables
- Run `yarn build && yarn start`

---

**Built with ❤️ for Enterprise Cab Booking**
