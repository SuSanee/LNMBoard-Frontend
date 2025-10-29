import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventAPI } from '@/api/events';
import { toast } from 'react-toastify';
import logo from '@/assets/lnmiit-logo.png';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventAPI.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const categorizeEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const past = [];
    const current = [];
    const upcoming = [];

    events.forEach((event) => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        past.push(event);
      } else if (eventDate.getTime() === today.getTime()) {
        current.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return { past, current, upcoming };
  };

  const { past, current, upcoming } = categorizeEvents();

  const getActiveEvents = () => {
    switch (activeTab) {
      case 'past':
        return past;
      case 'current':
        return current;
      case 'upcoming':
        return upcoming;
      default:
        return current;
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

  const activeEvents = getActiveEvents();

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <header className="bg-lnmiit-maroon text-white py-4 px-24 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <img src={logo} alt="LNMIIT Logo" className="h-12 md:h-16 bg-white p-2 rounded" />
          <Button
            onClick={() => navigate('/super-admin/login')}
            className="bg-white text-lnmiit-maroon hover:bg-gray-100"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto pt-8 px-24">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Events</h2>
            <p className="text-gray-600">Stay updated with our latest events and activities</p>
          </div>

        {/* Tabs */}
        <div className="flex justify-between mb-8 bg-gray-50 p-2 px-4 w-full rounded-full mx-auto border border-gray-200">
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-gray-500 text-white shadow-lg'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past Events ({past.length})
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'current'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Current Events ({current.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Upcoming Events ({upcoming.length})
          </button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading events...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No {activeTab} events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow">
                {event.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-lnmiit-maroon">
                    {event.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{formatDate(event.eventDate)}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Events;

