import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken, getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Helper function to handle CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// Main API handler
export async function POST(request) {
  try {
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/', '');
    const body = await request.json();

    // Auth routes
    if (path === 'auth/register') {
      return handleRegister(body);
    }
    if (path === 'auth/login') {
      return handleLogin(body);
    }

    // Protected routes - require authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Company routes
    if (path === 'company/bookings/create') {
      return handleCreateBooking(body, user);
    }
    if (path === 'company/bookings') {
      return handleGetCompanyBookings(user);
    }
    if (path === 'company/vendors') {
      return handleGetAssociatedVendors(user);
    }

    // Vendor routes
    if (path === 'vendor/bookings/pending') {
      return handleGetPendingBookings(user);
    }
    if (path === 'vendor/bookings/all') {
      return handleGetVendorBookings(user);
    }
    if (path === 'vendor/bookings/accept') {
      return handleAcceptBooking(body, user);
    }
    if (path === 'vendor/bookings/reject') {
      return handleRejectBooking(body, user);
    }
    if (path === 'vendor/bookings/open-market') {
      return handleOpenMarketBooking(body, user);
    }
    if (path === 'vendor/bookings/start-trip') {
      return handleStartTrip(body, user);
    }
    if (path === 'vendor/bookings/end-trip') {
      return handleEndTrip(body, user);
    }
    if (path === 'vendor/drivers') {
      return handleGetDrivers(user);
    }
    if (path === 'vendor/drivers/create') {
      return handleCreateDriver(body, user);
    }
    if (path === 'vendor/drivers/delete') {
      return handleDeleteDriver(body, user);
    }
    if (path === 'vendor/vehicles') {
      return handleGetVehicles(user);
    }
    if (path === 'vendor/vehicles/create') {
      return handleCreateVehicle(body, user);
    }
    if (path === 'vendor/vehicles/delete') {
      return handleDeleteVehicle(body, user);
    }
    if (path === 'vendor/bookings/manual') {
      return handleManualBooking(body, user);
    }

    // Open market routes
    if (path === 'vendor/open-market/bookings') {
      return handleGetOpenMarketBookings(user);
    }

    return NextResponse.json(
      { error: 'Route not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(request) {
  try {
    const { pathname, searchParams } = new URL(request.url);
    const path = pathname.replace('/api/', '');

    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (path === 'company/bookings') {
      return handleGetCompanyBookings(user);
    }
    if (path === 'vendor/bookings') {
      return handleGetVendorBookings(user);
    }
    if (path === 'vendor/drivers') {
      return handleGetDrivers(user);
    }
    if (path === 'vendor/vehicles') {
      return handleGetVehicles(user);
    }

    return NextResponse.json(
      { error: 'Route not found' },
      { status: 404, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Auth handlers
async function handleRegister(body) {
  const { email, password, role, name, phone, companyName, vendorName, address } = body;

  if (!email || !password || !role || !name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      role,
      name,
      phone,
    })
    .select()
    .single();

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Create company or vendor profile
  if (role === 'company') {
    await supabase.from('companies').insert({
      user_id: user.id,
      company_name: companyName || name,
      address,
      contact_person: name,
      phone,
    });
  } else if (role === 'vendor') {
    await supabase.from('vendors').insert({
      user_id: user.id,
      vendor_name: vendorName || name,
      address,
      contact_person: name,
      phone,
    });
  }

  const token = generateToken(user);

  return NextResponse.json(
    { token, user: { id: user.id, email: user.email, role: user.role, name: user.name } },
    { headers: corsHeaders() }
  );
}

async function handleLogin(body) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing email or password' },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401, headers: corsHeaders() }
    );
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401, headers: corsHeaders() }
    );
  }

  const token = generateToken(user);

  return NextResponse.json(
    { token, user: { id: user.id, email: user.email, role: user.role, name: user.name } },
    { headers: corsHeaders() }
  );
}

// Company handlers
async function handleCreateBooking(body, user) {
  if (user.role !== 'company') {
    return NextResponse.json(
      { error: 'Only companies can create bookings' },
      { status: 403, headers: corsHeaders() }
    );
  }

  // Get company ID
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const {
    guestName,
    guestContact,
    guestLocation,
    pickupLocation,
    dropoffLocation,
    pickupTime,
    carCategory,
    referenceName,
    tripDetails,
  } = body;

  // Create booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      company_id: company.id,
      guest_name: guestName,
      guest_contact: guestContact,
      guest_location: guestLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pickup_time: pickupTime,
      car_category: carCategory,
      reference_name: referenceName,
      trip_details: tripDetails,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // In a real system, we would send this to vendors via RabbitMQ
  // For MVP, vendors will poll for pending bookings

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

async function handleGetCompanyBookings(user) {
  if (user.role !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      vendor:vendors(vendor_name),
      driver:drivers(name, phone, vehicle_number),
      vehicle:vehicles(plate_number, type, model)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ bookings }, { headers: corsHeaders() });
}

async function handleGetAssociatedVendors(user) {
  if (user.role !== 'company') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: associations, error } = await supabase
    .from('company_vendor_associations')
    .select(`
      vendor:vendors(
        id,
        vendor_name,
        contact_person,
        phone
      )
    `)
    .eq('company_id', company.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  const vendors = associations.map((a) => a.vendor);
  return NextResponse.json({ vendors }, { headers: corsHeaders() });
}

// Vendor handlers
async function handleGetPendingBookings(user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  // Get bookings for companies associated with this vendor
  const { data: associations } = await supabase
    .from('company_vendor_associations')
    .select('company_id')
    .eq('vendor_id', vendor.id);

  const companyIds = associations?.map((a) => a.company_id) || [];

  if (companyIds.length === 0) {
    return NextResponse.json({ bookings: [] }, { headers: corsHeaders() });
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      company:companies(company_name, contact_person, phone)
    `)
    .in('company_id', companyIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ bookings }, { headers: corsHeaders() });
}

async function handleGetVendorBookings(user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      company:companies(company_name, contact_person, phone),
      driver:drivers(name, phone, vehicle_number),
      vehicle:vehicles(plate_number, type, model)
    `)
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ bookings }, { headers: corsHeaders() });
}

async function handleAcceptBooking(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { bookingId, driverId, vehicleId } = body;

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  // Update booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      vendor_id: vendor.id,
      driver_id: driverId,
      vehicle_id: vehicleId,
      status: 'upcoming',
      in_open_market: false,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Update vehicle availability
  await supabase
    .from('vehicles')
    .update({ availability: false })
    .eq('id', vehicleId);

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

async function handleRejectBooking(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { bookingId, reason } = body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      rejection_reason: reason,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

async function handleOpenMarketBooking(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { bookingId } = body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      in_open_market: true,
      open_market_time: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

async function handleGetOpenMarketBookings(user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const currentTime = new Date();
  const thirtyMinutesAgo = new Date(currentTime - 30 * 60 * 1000);

  // Get associated vendors
  const { data: associations } = await supabase
    .from('vendor_vendor_associations')
    .select('associated_vendor_id')
    .eq('vendor_id', vendor.id);

  const associatedVendorIds = associations?.map((a) => a.associated_vendor_id) || [];

  // Get open market bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      company:companies(company_name, contact_person, phone)
    `)
    .eq('in_open_market', true)
    .eq('status', 'pending')
    .order('open_market_time', { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Filter based on 30-minute rule
  const filteredBookings = bookings.filter((booking) => {
    const openMarketTime = new Date(booking.open_market_time);
    const isRecent = openMarketTime > thirtyMinutesAgo;

    if (isRecent) {
      // Only show to associated vendors in first 30 minutes
      return associatedVendorIds.includes(vendor.id);
    } else {
      // After 30 minutes, show to all vendors
      return true;
    }
  });

  return NextResponse.json({ bookings: filteredBookings }, { headers: corsHeaders() });
}

async function handleStartTrip(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { bookingId } = body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'ongoing' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

async function handleEndTrip(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { bookingId } = body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      dropoff_time: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Make vehicle available again
  if (booking.vehicle_id) {
    await supabase
      .from('vehicles')
      .update({ availability: true })
      .eq('id', booking.vehicle_id);
  }

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}

// Driver handlers
async function handleGetDrivers(user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ drivers }, { headers: corsHeaders() });
}

async function handleCreateDriver(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: driver, error } = await supabase
    .from('drivers')
    .insert({
      vendor_id: vendor.id,
      ...body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ driver }, { headers: corsHeaders() });
}

async function handleDeleteDriver(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { driverId } = body;

  const { error } = await supabase.from('drivers').delete().eq('id', driverId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

// Vehicle handlers
async function handleGetVehicles(user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ vehicles }, { headers: corsHeaders() });
}

async function handleCreateVehicle(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({
      vendor_id: vendor.id,
      ...body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ vehicle }, { headers: corsHeaders() });
}

async function handleDeleteVehicle(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { vehicleId } = body;

  const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}

// Manual booking handler
async function handleManualBooking(body, user) {
  if (user.role !== 'vendor') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403, headers: corsHeaders() }
    );
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!vendor) {
    return NextResponse.json(
      { error: 'Vendor profile not found' },
      { status: 404, headers: corsHeaders() }
    );
  }

  const {
    guestName,
    guestContact,
    guestLocation,
    pickupLocation,
    dropoffLocation,
    pickupTime,
    carCategory,
    driverId,
    vehicleId,
  } = body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      vendor_id: vendor.id,
      guest_name: guestName,
      guest_contact: guestContact,
      guest_location: guestLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pickup_time: pickupTime,
      car_category: carCategory,
      driver_id: driverId,
      vehicle_id: vehicleId,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Update vehicle availability
  if (vehicleId) {
    await supabase
      .from('vehicles')
      .update({ availability: false })
      .eq('id', vehicleId);
  }

  return NextResponse.json({ booking }, { headers: corsHeaders() });
}
