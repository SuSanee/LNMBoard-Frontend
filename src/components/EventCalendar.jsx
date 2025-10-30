import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EventCalendar = ({ events, onEventClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);

  // Check if current date is in the past (before current month)
  const isPastMonth = () => {
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonthStart < todayMonthStart;
  };

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Group events by date
  const eventsByDate = {};
  events.forEach((event) => {
    const eventDate = new Date(event.eventDate);
    const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return eventsByDate[dateKey] || [];
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    const newMonthStart = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Prevent navigating to past months
    if (newMonthStart >= todayMonthStart) {
      setCurrentDate(newDate);
      setSelectedDate(null);
    }
  };

  const handleDateClick = (day) => {
    const events = getEventsForDate(day);
    if (events.length > 0) {
      const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate({ day, date: fullDate, events });
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-lnmiit-maroon">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigateMonth(-1)} 
                variant="outline" 
                size="sm"
                disabled={isPastMonth()}
              >
                ‹
              </Button>
              <Button onClick={() => navigateMonth(1)} variant="outline" size="sm">
                ›
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDate && selectedDate.day === day;
              
              return (
                <div
                  key={idx}
                  className={`min-h-[60px] border rounded p-1 cursor-pointer transition-colors ${
                    day 
                      ? hasEvents 
                        ? isSelected 
                          ? 'bg-lnmiit-maroon text-white' 
                          : 'bg-lnmiit-gold hover:bg-lnmiit-gold/80 text-lnmiit-maroon'
                        : 'hover:bg-gray-100'
                      : ''
                  }`}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <div className="text-xs font-medium mb-1">{day}</div>
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-lnmiit-maroon'}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className={`text-[8px] ${isSelected ? 'text-white' : 'text-lnmiit-maroon'}`}>
                              +{dayEvents.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal dialog for selected date events */}
      {selectedDate && selectedDate.events.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDate(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-lnmiit-maroon">
                  {selectedDate.date.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedDate(null)}
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                {selectedDate.events.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => { onEventClick(event); setSelectedDate(null); }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  >
                    <div className="font-medium text-gray-900">{event.title}</div>
                    {event.time && <div className="text-sm text-gray-600 mt-1">🕐 {event.time}</div>}
                    {event.venue && <div className="text-sm text-gray-600">📍 {event.venue}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default EventCalendar;

