import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventAPI } from '@/api/events';
import { toast } from 'react-toastify';
import EventCalendar from '@/components/EventCalendar';
import logo from '@/assets/lnmiit-logo.png';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const canComment = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    
    const threeDaysBefore = new Date(event);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    
    const threeDaysAfter = new Date(event);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);
    
    return today >= threeDaysBefore && today <= threeDaysAfter;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !viewingEvent) return;
    
    try {
      setIsSubmitting(true);
      const response = await eventAPI.addComment(viewingEvent._id, commentText);
      toast.success('Comment added successfully');
      setCommentText('');
      
      // Update the viewing event with new comments
      if (response.event) {
        setViewingEvent(response.event);
      }
      
      // Refresh all events
      await fetchEvents();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEvents = getActiveEvents();

  return (
    <div className="min-h-screen bg-white ">
      {/* Header */}
      <header className="bg-lnmiit-maroon text-white py-4 px-4 sm:px-8 md:px-24 shadow-md">
        <div className="container mx-auto flex flex-row justify-between items-center">
          <img src={logo} alt="LNMIIT Logo" className="h-12 md:h-16 bg-white p-2 rounded" />
          <div className="flex gap-6 items-center">
            <button
              onClick={() => setShowCalendar(true)}
              className="text-white hover:text-gray-200 font-medium"
            >
              Calendar
            </button>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-white hover:text-gray-200 font-medium"
            >
              Events
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
        {showCalendar ? (
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-8">
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Event Calendar</h2>
            </div>
            <div className="flex justify-center">
              <EventCalendar events={events} onEventClick={(event) => { setViewingEvent(event); setShowViewModal(true); }} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Events</h2>
              <p className="text-gray-600 text-sm sm:text-base">Stay updated with our latest events and activities</p>
            </div>
          {/* Tabs for all screen sizes, smaller on mobile */}
          <div className="mb-6">
            <div className="flex justify-between bg-gray-50 p-1 w-full rounded-full mx-auto border border-gray-200 gap-1">
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 px-2 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-xs md:text-sm ${activeTab === 'past' ? 'bg-gray-500 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Past ({past.length})
              </button>
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 px-2 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-xs md:text-sm ${activeTab === 'current' ? 'bg-green-500 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Current ({current.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 px-2 py-1.5 rounded-full font-semibold transition-all flex items-center justify-center gap-1 text-xs md:text-sm ${activeTab === 'upcoming' ? 'bg-blue-500 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Upcoming ({upcoming.length})
              </button>
            </div>
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
        )}

        {/* View Event Details Modal */}
        {showViewModal && viewingEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
            <Card className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              {/* Close X icon button */}
              <button
                className="absolute top-3 right-3 bg-white hover:bg-gray-100 rounded-full p-2 shadow focus:outline-none z-10"
                aria-label="Close"
                onClick={() => setShowViewModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable content wrapper (image + header + details + comments) */}
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

                    {/* Comments Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-base font-semibold text-gray-800 mb-3">Comments ({viewingEvent.comments?.length || 0})</h3>
                      
                      {/* Comments List */}
                      {viewingEvent.comments && viewingEvent.comments.length > 0 && (
                        <div className="space-y-2 mb-3 max-h-[160px] overflow-y-auto">
                          {viewingEvent.comments.map((comment, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Form */}
                      {canComment(viewingEvent.eventDate) ? (
                        <form onSubmit={handleCommentSubmit} className="space-y-2">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lnmiit-maroon resize-none"
                            rows="2"
                            required
                          />
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90 text-white"
                          >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                          </Button>
                        </form>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          Comments can only be added 3 days before or 3 days after the event.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

