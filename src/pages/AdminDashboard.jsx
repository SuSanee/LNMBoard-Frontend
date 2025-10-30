import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { superAdminAPI } from '@/api/superAdmin';
import { eventAPI } from '@/api/events';
import { toast } from 'react-toastify';
import logo from '@/assets/lnmiit-logo.png';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    venue: '',
    time: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if logged in
    if (!superAdminAPI.isAuthenticated()) {
      navigate('/super-admin/login');
      return;
    }

    // Get current admin
    const currentAdmin = superAdminAPI.getCurrentAdmin();
    
    // Verify role is admin (not super-admin)
    if (!currentAdmin || currentAdmin.role !== 'admin') {
      navigate('/super-admin/login');
      return;
    }

    setAdmin(currentAdmin);
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventAPI.getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    superAdminAPI.logout();
    navigate('/');
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      venue: '',
      time: '',
      image: null,
    });
    setImagePreview(null);
    setTimeStart('');
    setTimeEnd('');
    setShowAddModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      venue: event.venue || '',
      time: event.time || '',
      image: event.image || null,
    });
    setImagePreview(event.image || null);
    // Try to prefill start/end from saved time string
    if (event.time && event.time.includes('-')) {
      const [s, e] = event.time.split('-').map((t) => t.trim());
      // Convert 12h to 24h HH:MM if needed
      const to24 = (str) => {
        const m = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!m) return '';
        let h = parseInt(m[1], 10);
        const min = m[2];
        const ampm = (m[3] || '').toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${min}`;
      };
      setTimeStart(to24(s));
      setTimeEnd(to24(e));
    } else {
      setTimeStart('');
      setTimeEnd('');
    }
    setShowAddModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventAPI.deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Build formatted time string like "10:00 AM - 12:00 PM"
      const format12h = (hhmm) => {
        if (!hhmm) return '';
        const [hStr, m] = hhmm.split(':');
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${ampm}`;
      };
      const combinedTime = timeStart && timeEnd ? `${format12h(timeStart)} - ${format12h(timeEnd)}` : formData.time;
      const payload = { ...formData, time: combinedTime };

      if (editingEvent) {
        await eventAPI.updateEvent(editingEvent._id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventAPI.createEvent(payload);
        toast.success('Event created successfully');
      }
      setShowAddModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* LNMIIT Header */}
      <header className="bg-lnmiit-maroon text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="container mx-auto flex flex-row justify-between items-center">
          <img src={logo} alt="LNMIIT Logo" className="h-12 md:h-16 bg-white p-2 rounded" />
          <Button 
            onClick={handleLogout}
            className="bg-white text-lnmiit-maroon hover:bg-gray-100"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-2 sm:px-4 md:px-8">
        <div className="flex flex-row justify-between items-center mb-8">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-800">My Events</h2>
            <p className="text-gray-600">Manage your events</p>
          </div>
          <Button
            onClick={handleAddEvent}
            className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90 text-white"
          >
            + Add Event
          </Button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No events created yet</p>
            <Button
              onClick={handleAddEvent}
              className="mt-4 bg-lnmiit-maroon hover:bg-lnmiit-maroon/90"
            >
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setViewingEvent(event); setShowViewModal(true); }}>
                <CardContent className="p-0">
                  {event.image && (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <CardTitle className="text-xl text-lnmiit-maroon mb-2">
                      {event.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-1">{formatDate(event.eventDate)}</p>
                    {event.venue && <p className="text-xs text-gray-500 mb-1">📍 {event.venue}</p>}
                    {event.time && <p className="text-xs text-gray-500">🕐 {event.time}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Event Details Modal */}
      {showViewModal && viewingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md relative">
            {/* Close X icon button */}
            <button
              className="absolute top-3 right-3 bg-white hover:bg-gray-100 rounded-full p-2 shadow focus:outline-none"
              aria-label="Close"
              onClick={() => setShowViewModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="max-h-[75vh] overflow-y-auto">
              {viewingEvent.image && (
                <img 
                  src={viewingEvent.image} 
                  alt={viewingEvent.title}
                  className="w-full max-h-[240px] object-contain mb-3 rounded-t-lg"
                />
              )}
              <CardHeader className="pt-0 pb-2">
                <CardTitle className="text-xl text-lnmiit-maroon">
                  {viewingEvent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="text-sm font-medium">{formatDate(viewingEvent.eventDate)}</p>
                  </div>
                  {viewingEvent.venue && (
                    <div>
                      <p className="text-xs text-gray-600">Venue</p>
                      <p className="text-sm font-medium">📍 {viewingEvent.venue}</p>
                    </div>
                  )}
                  {viewingEvent.time && (
                    <div>
                      <p className="text-xs text-gray-600">Time</p>
                      <p className="text-sm font-medium">🕐 {viewingEvent.time}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600">Description</p>
                    <p className="text-sm">{viewingEvent.description}</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-lnmiit-maroon">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Enter event description"
                    className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lnmiit-maroon"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    required
                    placeholder="Enter event venue"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="timeStart" className="text-xs text-gray-600">Start</Label>
                      <Input
                        id="timeStart"
                        type="time"
                        value={timeStart}
                        onChange={(e) => setTimeStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="timeEnd" className="text-xs text-gray-600">End</Label>
                      <Input
                        id="timeEnd"
                        type="time"
                        value={timeEnd}
                        onChange={(e) => setTimeEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Times are interpreted in IST.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image (Optional)</Label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lnmiit-maroon transition-colors cursor-pointer">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label htmlFor="image" className="cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

