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
import { Car, Plus, LogOut, RefreshCw, Calendar, MapPin, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newBooking, setNewBooking] = useState({
    guestName: '',
    guestContact: '',
    guestLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
    carCategory: 'sedan',
    referenceName: '',
    tripDetails: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'company') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    fetchBookings();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBooking),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      toast.success('Booking created! Sent to vendors.');
      setCreateDialogOpen(false);
      setNewBooking({
        guestName: '',
        guestContact: '',
        guestLocation: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupTime: '',
        carCategory: 'sedan',
        referenceName: '',
        tripDetails: '',
      });
      fetchBookings();
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
    if (status === 'all') return bookings;
    return bookings.filter((b) => b.status === status);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Company Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchBookings}>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl">{filterBookingsByStatus('pending').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Upcoming</CardDescription>
              <CardTitle className="text-3xl">{filterBookingsByStatus('upcoming').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ongoing</CardDescription>
              <CardTitle className="text-3xl">{filterBookingsByStatus('ongoing').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{filterBookingsByStatus('completed').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Cancelled</CardDescription>
              <CardTitle className="text-3xl">{filterBookingsByStatus('cancelled').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Create Booking Button */}
        <div className="mb-6">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new cab booking request
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBooking} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestName">Guest Name *</Label>
                    <Input
                      id="guestName"
                      value={newBooking.guestName}
                      onChange={(e) => setNewBooking({ ...newBooking, guestName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestContact">Guest Contact *</Label>
                    <Input
                      id="guestContact"
                      value={newBooking.guestContact}
                      onChange={(e) => setNewBooking({ ...newBooking, guestContact: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guestLocation">Guest Location</Label>
                  <Input
                    id="guestLocation"
                    placeholder="e.g., Office Building A"
                    value={newBooking.guestLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, guestLocation: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="pickupLocation">Pickup Location *</Label>
                  <Input
                    id="pickupLocation"
                    placeholder="e.g., 123 Main St, City"
                    value={newBooking.pickupLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, pickupLocation: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dropoffLocation">Dropoff Location *</Label>
                  <Input
                    id="dropoffLocation"
                    placeholder="e.g., 456 Airport Rd, City"
                    value={newBooking.dropoffLocation}
                    onChange={(e) => setNewBooking({ ...newBooking, dropoffLocation: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupTime">Pickup Date & Time *</Label>
                    <Input
                      id="pickupTime"
                      type="datetime-local"
                      value={newBooking.pickupTime}
                      onChange={(e) => setNewBooking({ ...newBooking, pickupTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="carCategory">Car Category *</Label>
                    <Select
                      value={newBooking.carCategory}
                      onValueChange={(value) => setNewBooking({ ...newBooking, carCategory: value })}
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

                <div>
                  <Label htmlFor="referenceName">Reference Name</Label>
                  <Input
                    id="referenceName"
                    placeholder="e.g., Employee ID or Department"
                    value={newBooking.referenceName}
                    onChange={(e) => setNewBooking({ ...newBooking, referenceName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="tripDetails">Trip Details</Label>
                  <Textarea
                    id="tripDetails"
                    placeholder="Any additional information..."
                    value={newBooking.tripDetails}
                    onChange={(e) => setNewBooking({ ...newBooking, tripDetails: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Booking'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View and track all your booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({filterBookingsByStatus('pending').length})</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming ({filterBookingsByStatus('upcoming').length})</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing ({filterBookingsByStatus('ongoing').length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({filterBookingsByStatus('completed').length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({filterBookingsByStatus('cancelled').length})</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                <TabsContent key={status} value={status}>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guest</TableHead>
                          <TableHead>Pickup</TableHead>
                          <TableHead>Dropoff</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterBookingsByStatus(status).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                              <TableCell className="max-w-xs truncate">{booking.pickup_location}</TableCell>
                              <TableCell className="max-w-xs truncate">{booking.dropoff_location}</TableCell>
                              <TableCell>
                                {booking.pickup_time
                                  ? format(new Date(booking.pickup_time), 'MMM dd, yyyy HH:mm')
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="capitalize">{booking.car_category}</TableCell>
                              <TableCell>
                                {booking.vendor ? booking.vendor.vendor_name : '-'}
                              </TableCell>
                              <TableCell>
                                {booking.driver ? (
                                  <div>
                                    <div className="font-medium">{booking.driver.name}</div>
                                    <div className="text-sm text-gray-500">{booking.driver.vehicle_number}</div>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
      </main>
    </div>
  );
}
