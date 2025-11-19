import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventAPI } from '@/api/events';
import { toast } from 'react-toastify';
import logo from '@/assets/lnmiit-logo.png';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, noticesData] = await Promise.all([
        eventAPI.getAllEvents('event'),
        eventAPI.getAllEvents('notice')
      ]);
      setEvents(eventsData);
      setNotices(noticesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-lnmiit-maroon text-white py-4 px-4 sm:px-8 md:px-24 shadow-md">
        <div className="container mx-auto flex flex-row justify-between items-center">
          <img src={logo} alt="LNMIIT Logo" className="h-12 md:h-16 bg-white p-2 rounded" />
          <div className="flex gap-6 items-center">
            <button
              onClick={() => navigate('/events')}
              className="text-white hover:text-gray-200 font-medium"
            >
              Events
            </button>
            <button
              onClick={() => navigate('/notices')}
              className="text-white hover:text-gray-200 font-medium"
            >
              Notices
            </button>
            <Button
              onClick={() => navigate('/super-admin/login')}
              className="bg-white text-lnmiit-maroon hover:bg-gray-100"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto pt-8 px-2 sm:px-4 md:px-8">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Events & Notices</h2>
            <p className="text-gray-600 text-sm sm:text-base">Stay updated with our latest events and notices</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Events Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Events ({events.length})</h3>
                {events.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No events found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.slice(0, 6).map((event) => (
                      <Card key={event._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setViewingItem(event); setShowViewModal(true); }}>
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
                {events.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => navigate('/events')}
                      className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90 text-white"
                    >
                      View All Events
                    </Button>
                  </div>
                )}
              </div>

              {/* Notices Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Notices ({notices.length})</h3>
                {notices.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No notices found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notices.slice(0, 6).map((notice) => (
                      <Card key={notice._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setViewingItem(notice); setShowViewModal(true); }}>
                        <CardContent className="p-0">
                          {notice.image && (
                            <img 
                              src={notice.image} 
                              alt={notice.title}
                              className="w-full h-64 object-cover rounded-t-lg"
                            />
                          )}
                          <div className="p-4">
                            <CardTitle className="text-xl text-lnmiit-maroon mb-2">
                              {notice.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mb-1">{formatDate(notice.eventDate)}</p>
                            {notice.venue && <p className="text-xs text-gray-500 mb-1">📍 {notice.venue}</p>}
                            {notice.time && <p className="text-xs text-gray-500">🕐 {notice.time}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {notices.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => navigate('/notices')}
                      className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90 text-white"
                    >
                      View All Notices
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {showViewModal && viewingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
            <Card className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute top-3 right-3 bg-white hover:bg-gray-100 rounded-full p-2 shadow focus:outline-none z-10"
                aria-label="Close"
                onClick={() => setShowViewModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="max-h-[75vh] overflow-y-auto">
                {viewingItem.image && (
                  <img 
                    src={viewingItem.image} 
                    alt={viewingItem.title}
                    className="w-full max-h-[240px] object-contain mb-3 rounded-t-lg"
                  />
                )}

                <div className="p-6 pt-0">
                  <h3 className="text-xl text-lnmiit-maroon mb-4">{viewingItem.title}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="text-sm font-medium">{formatDate(viewingItem.eventDate)}</p>
                    </div>
                    {viewingItem.venue && (
                      <div>
                        <p className="text-xs text-gray-600">Venue</p>
                        <p className="text-sm font-medium">📍 {viewingItem.venue}</p>
                      </div>
                    )}
                    {viewingItem.time && (
                      <div>
                        <p className="text-xs text-gray-600">Time</p>
                        <p className="text-sm font-medium">🕐 {viewingItem.time}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600">Description</p>
                      <p className="text-sm">{viewingItem.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;


