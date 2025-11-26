'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Car, Plus, LogOut, RefreshCw, Users, Truck, Bell, Play, Square, ShoppingCart, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Data states
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [openMarketBookings, setOpenMarketBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  
  // Driver form
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    employee_id: '',
    name: '',
    phone: '',
    email: '',
    license_number: '',
    pan_number: '',
    aadhar_number: '',
    address: '',
    date_of_joining: '',
    department: '',
    salary: '',
    account_number: '',
    ifsc_code: '',
    vehicle_type: '',
    vehicle_number: '',
  });
  
  // Vehicle form
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    type: 'sedan',
    plate_number: '',
    model: '',
    condition_status: 'good',
    insurance_expiry: '',
  });
  
  // Manual booking form
  const [manualBookingOpen, setManualBookingOpen] = useState(false);
  const [manualBooking, setManualBooking] = useState({
    guestName: '',
    guestContact: '',
    guestLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    carCategory: 'sedan',
    driverId: '',
    vehicleId: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'vendor') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchAllData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingBookings(),
      fetchAllBookings(),
      fetchOpenMarketBookings(),
      fetchDrivers(),
      fetchVehicles(),
    ]);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch('/api/vendor/bookings/pending', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('/api/vendor/bookings/all', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    }
  };

  const fetchOpenMarketBookings = async () => {
    try {
      const response = await fetch('/api/vendor/open-market/bookings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        setOpenMarketBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching open market bookings:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/vendor/drivers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vendor/vehicles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleAcceptBooking = async () => {
    if (!selectedDriver || !selectedVehicle) {
      toast.error('Please select both driver and vehicle');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor/bookings/accept', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        }),
      });

      if (!response.ok) throw new Error('Failed to accept booking');

      toast.success('Booking accepted successfully!');
      setAcceptDialogOpen(false);
      setSelectedBooking(null);
      setSelectedDriver('');
      setSelectedVehicle('');
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendor/bookings/reject', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bookingId,
          reason: rejectReason || 'No vehicles available',
        }),
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      toast.success('Booking rejected');
      setRejectReason('');
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMarket = async (bookingId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendor/bookings/open-market', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) throw new Error('Failed to place in open market');

      toast.success('Booking placed in open market!');
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (bookingId) => {
    try {
      const response = await fetch('/api/vendor/bookings/start-trip', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) throw new Error('Failed to start trip');

      toast.success('Trip started!');
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEndTrip = async (bookingId) => {
    try {
      const response = await fetch('/api/vendor/bookings/end-trip', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) throw new Error('Failed to end trip');

      toast.success('Trip completed!');
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vendor/drivers/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newDriver),
      });

      if (!response.ok) throw new Error('Failed to create driver');

      toast.success('Driver added successfully!');
      setDriverDialogOpen(false);
      setNewDriver({
        employee_id: '',
        name: '',
        phone: '',
        email: '',
        license_number: '',
        pan_number: '',
        aadhar_number: '',
        address: '',
        date_of_joining: '',
        department: '',
        salary: '',
        account_number: '',
        ifsc_code: '',
        vehicle_type: '',
        vehicle_number: '',
      });
      fetchDrivers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    try {
      const response = await fetch('/api/vendor/drivers/delete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ driverId }),
      });

      if (!response.ok) throw new Error('Failed to delete driver');

      toast.success('Driver deleted');
      fetchDrivers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vendor/vehicles/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newVehicle),
      });

      if (!response.ok) throw new Error('Failed to create vehicle');

      toast.success('Vehicle added successfully!');
      setVehicleDialogOpen(false);
      setNewVehicle({
        type: 'sedan',
        plate_number: '',
        model: '',
        condition_status: 'good',
        insurance_expiry: '',
      });
      fetchVehicles();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch('/api/vendor/vehicles/delete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ vehicleId }),
      });

      if (!response.ok) throw new Error('Failed to delete vehicle');

      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleManualBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/vendor/bookings/manual', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(manualBooking),
      });

      if (!response.ok) throw new Error('Failed to create manual booking');

      toast.success('Manual booking created!');
      setManualBookingOpen(false);
      setManualBooking({
        guestName: '',
        guestContact: '',
        guestLocation: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupTime: '',
        carCategory: 'sedan',
        driverId: '',
        vehicleId: '',
      });
      fetchAllData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      upcoming: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      ongoing: 'bg-green-100 text-green-800 hover:bg-green-100',
      completed: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-100',
    };
    return <Badge className={variants[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  const filterBookingsByStatus = (status) => {
    if (status === 'all') return allBookings;
    return allBookings.filter((b) => b.status === status);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchAllData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Pending Requests
              </CardDescription>
              <CardTitle className="text-3xl">{pendingBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Open Market
              </CardDescription>
              <CardTitle className="text-3xl">{openMarketBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Drivers
              </CardDescription>
              <CardTitle className="text-3xl">{drivers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Vehicles
              </CardDescription>
              <CardTitle className="text-3xl">{vehicles.filter(v => v.availability).length}/{vehicles.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="bookings">All Bookings</TabsTrigger>
            <TabsTrigger value="open-market">Open Market</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Booking Requests</CardTitle>
                <CardDescription>
                  Accept, reject, or place bookings in open market
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <Card key={booking.id} className="border-2 border-yellow-200">
                        <CardContent className="pt-6">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Guest</p>
                              <p className="font-semibold">{booking.guest_name}</p>
                              <p className="text-sm">{booking.guest_contact}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Company</p>
                              <p className="font-semibold">{booking.company?.company_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Pickup</p>
                              <p className="font-medium">{booking.pickup_location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dropoff</p>
                              <p className="font-medium">{booking.dropoff_location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Pickup Time</p>
                              <p className="font-medium">
                                {format(new Date(booking.pickup_time), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Car Category</p>
                              <p className="font-medium capitalize">{booking.car_category}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setAcceptDialogOpen(true);
                              }}
                              className="flex-1"
                            >
                              Accept & Assign
                            </Button>
                            <Button
                              onClick={() => handleRejectBooking(booking.id)}
                              variant="destructive"
                              className="flex-1"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleOpenMarket(booking.id)}
                              variant="outline"
                              className="flex-1"
                            >
                              Open Market
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>Manage all your bookings</CardDescription>
                </div>
                <Dialog open={manualBookingOpen} onOpenChange={setManualBookingOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Manual Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Manual Booking</DialogTitle>
                      <DialogDescription>
                        For walk-ins, calls, or WhatsApp bookings
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleManualBooking} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Guest Name *</Label>
                          <Input
                            value={manualBooking.guestName}
                            onChange={(e) =>
                              setManualBooking({ ...manualBooking, guestName: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Guest Contact *</Label>
                          <Input
                            value={manualBooking.guestContact}
                            onChange={(e) =>
                              setManualBooking({ ...manualBooking, guestContact: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Pickup Location *</Label>
                        <Input
                          value={manualBooking.pickupLocation}
                          onChange={(e) =>
                            setManualBooking({ ...manualBooking, pickupLocation: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Dropoff Location *</Label>
                        <Input
                          value={manualBooking.dropoffLocation}
                          onChange={(e) =>
                            setManualBooking({ ...manualBooking, dropoffLocation: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Pickup Time *</Label>
                          <Input
                            type="datetime-local"
                            value={manualBooking.pickupTime}
                            onChange={(e) =>
                              setManualBooking({ ...manualBooking, pickupTime: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label>Car Category *</Label>
                          <Select
                            value={manualBooking.carCategory}
                            onValueChange={(value) =>
                              setManualBooking({ ...manualBooking, carCategory: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="hatchback">Hatchback</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Assign Driver</Label>
                          <Select
                            value={manualBooking.driverId}
                            onValueChange={(value) =>
                              setManualBooking({ ...manualBooking, driverId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Assign Vehicle</Label>
                          <Select
                            value={manualBooking.vehicleId}
                            onValueChange={(value) =>
                              setManualBooking({ ...manualBooking, vehicleId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles
                                .filter((v) => v.availability)
                                .map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.plate_number} ({vehicle.type})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                          Create Booking
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setManualBookingOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>

                  {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                    <TabsContent key={status} value={status}>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Guest</TableHead>
                              <TableHead>Pickup</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Driver</TableHead>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filterBookingsByStatus(status).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  No bookings found
                                </TableCell>
                              </TableRow>
                            ) : (
                              filterBookingsByStatus(status).map((booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell>
                                    <div className="font-medium">{booking.guest_name}</div>
                                    <div className="text-sm text-gray-500">{booking.guest_contact}</div>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {booking.pickup_location}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(booking.pickup_time), 'MMM dd, HH:mm')}
                                  </TableCell>
                                  <TableCell>
                                    {booking.driver ? booking.driver.name : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {booking.vehicle ? booking.vehicle.plate_number : '-'}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                  <TableCell>
                                    {booking.status === 'upcoming' && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleStartTrip(booking.id)}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start
                                      </Button>
                                    )}
                                    {booking.status === 'ongoing' && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleEndTrip(booking.id)}
                                      >
                                        <Square className="h-3 w-3 mr-1" />
                                        End
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Market Tab */}
          <TabsContent value="open-market">
            <Card>
              <CardHeader>
                <CardTitle>Open Market Bookings</CardTitle>
                <CardDescription>
                  Available bookings from other vendors (30-min exclusive for partners)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {openMarketBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No open market bookings available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {openMarketBookings.map((booking) => (
                      <Card key={booking.id} className="border-2 border-blue-200">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="grid md:grid-cols-3 gap-4 flex-1">
                              <div>
                                <p className="text-sm text-gray-500">Guest</p>
                                <p className="font-semibold">{booking.guest_name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Pickup</p>
                                <p className="font-medium">{booking.pickup_location}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Time</p>
                                <p className="font-medium">
                                  {format(new Date(booking.pickup_time), 'MMM dd, HH:mm')}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {booking.car_category}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setAcceptDialogOpen(true);
                            }}
                            className="w-full"
                          >
                            Accept from Open Market
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Driver Management</CardTitle>
                  <CardDescription>Add, view, and manage drivers</CardDescription>
                </div>
                <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Driver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Driver</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateDriver} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Employee ID</Label>
                          <Input
                            value={newDriver.employee_id}
                            onChange={(e) => setNewDriver({ ...newDriver, employee_id: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newDriver.name}
                            onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={newDriver.phone}
                            onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newDriver.email}
                            onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>License Number</Label>
                          <Input
                            value={newDriver.license_number}
                            onChange={(e) => setNewDriver({ ...newDriver, license_number: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>PAN Number</Label>
                          <Input
                            value={newDriver.pan_number}
                            onChange={(e) => setNewDriver({ ...newDriver, pan_number: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Aadhar Number</Label>
                          <Input
                            value={newDriver.aadhar_number}
                            onChange={(e) => setNewDriver({ ...newDriver, aadhar_number: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Date of Joining</Label>
                          <Input
                            type="date"
                            value={newDriver.date_of_joining}
                            onChange={(e) => setNewDriver({ ...newDriver, date_of_joining: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Vehicle Type</Label>
                          <Input
                            value={newDriver.vehicle_type}
                            onChange={(e) => setNewDriver({ ...newDriver, vehicle_type: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Vehicle Number</Label>
                          <Input
                            value={newDriver.vehicle_number}
                            onChange={(e) => setNewDriver({ ...newDriver, vehicle_number: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={newDriver.address}
                          onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                          Add Driver
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDriverDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No drivers added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        drivers.map((driver) => (
                          <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>{driver.phone}</TableCell>
                            <TableCell>{driver.email || '-'}</TableCell>
                            <TableCell>{driver.license_number || '-'}</TableCell>
                            <TableCell>{driver.vehicle_number || '-'}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDriver(driver.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vehicle Management</CardTitle>
                  <CardDescription>Add, view, and manage vehicles</CardDescription>
                </div>
                <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateVehicle} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vehicle Type *</Label>
                          <Select
                            value={newVehicle.type}
                            onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="hatchback">Hatchback</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Plate Number *</Label>
                          <Input
                            value={newVehicle.plate_number}
                            onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Model</Label>
                          <Input
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Condition</Label>
                          <Select
                            value={newVehicle.condition_status}
                            onValueChange={(value) =>
                              setNewVehicle({ ...newVehicle, condition_status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Insurance Expiry</Label>
                          <Input
                            type="date"
                            value={newVehicle.insurance_expiry}
                            onChange={(e) =>
                              setNewVehicle({ ...newVehicle, insurance_expiry: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                          Add Vehicle
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setVehicleDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No vehicles added yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                            <TableCell className="capitalize">{vehicle.type}</TableCell>
                            <TableCell>{vehicle.model || '-'}</TableCell>
                            <TableCell>
                              <Badge className={vehicle.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {vehicle.availability ? 'Available' : 'In Use'}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{vehicle.condition_status}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Accept Booking Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Booking & Assign</DialogTitle>
            <DialogDescription>
              Select a driver and vehicle to confirm this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-semibold">Guest:</span> {selectedBooking.guest_name}</p>
                <p><span className="font-semibold">Pickup:</span> {selectedBooking.pickup_location}</p>
                <p><span className="font-semibold">Time:</span> {format(new Date(selectedBooking.pickup_time), 'MMM dd, yyyy HH:mm')}</p>
              </div>

              <div>
                <Label>Select Driver *</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Vehicle *</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.availability).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number} ({vehicle.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleAcceptBooking} disabled={loading} className="flex-1">
                  {loading ? 'Processing...' : 'Confirm & Accept'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAcceptDialogOpen(false);
                    setSelectedBooking(null);
                    setSelectedDriver('');
                    setSelectedVehicle('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
