import React, { useState } from 'react';
import { useMeetings } from '../../context/MeetingContext';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, Check, X, 
  ChevronLeft, ChevronRight, Video
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { slots, meetings, addAvailabilitySlot, deleteAvailabilitySlot, updateMeetingStatus } = useMeetings();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // URL Booking state
  const queryParams = new URLSearchParams(window.location.search);
  const hostIdParam = queryParams.get('hostId');
  const bookingHost = hostIdParam ? findUserById(hostIdParam) : null;
  const [isBookingOpen, setIsBookingOpen] = useState(!!bookingHost);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookDate, setBookDate] = useState(queryParams.get('date') || new Date().toISOString().split('T')[0]);
  const [bookStart, setBookStart] = useState('10:00');
  const [bookEnd, setBookEnd] = useState('11:00');
  
  // Slot creation state
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');

  if (!user) return null;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const days = [];
    
    // Add padding days from the previous month
    const startDayOfWeek = start.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false
      });
    }

    // Add days of the current month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Filter meetings where user is host or guest
  const userMeetings = meetings.filter(m => m.hostId === user.id || m.guestId === user.id);
  
  // Confirmed meetings on the selected date
  const selectedDateMeetings = userMeetings.filter(
    m => m.date === selectedDateStr && m.status === 'accepted'
  );

  // Availability slots of host (logged-in user) on selected date
  const selectedDateSlots = slots.filter(
    s => s.userId === user.id && s.date === selectedDateStr
  );

  // Incoming meeting requests
  const incomingRequests = userMeetings.filter(
    m => m.hostId === user.id && m.status === 'pending'
  );

  // Outgoing meeting requests sent by user
  const outgoingRequests = userMeetings.filter(
    m => m.guestId === user.id && m.status === 'pending'
  );

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slotStartTime >= slotEndTime) {
      alert('End time must be after start time');
      return;
    }
    addAvailabilitySlot(slotDate, slotStartTime, slotEndTime);
    setIsAddSlotOpen(false);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHost) return;
    if (bookStart >= bookEnd) {
      alert('End time must be after start time');
      return;
    }
    bookMeeting(bookingHost.id, bookTitle, bookDesc, bookDate, bookStart, bookEnd);
    setIsBookingOpen(false);
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Helper to check if a specific day has meetings or slots
  const getDayStatus = (dayDate: Date) => {
    const dayStr = dayDate.toISOString().split('T')[0];
    const hasMeeting = userMeetings.some(m => m.date === dayStr && m.status === 'accepted');
    const hasSlot = slots.some(s => s.userId === user.id && s.date === dayStr);
    const hasPending = userMeetings.some(m => m.date === dayStr && m.status === 'pending');
    return { hasMeeting, hasSlot, hasPending };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaboration Calendar</h1>
          <p className="text-gray-600">Set availability slots and manage investor-entrepreneur sync meetings</p>
        </div>
        
        <Button 
          leftIcon={<Plus size={18} />}
          onClick={() => {
            setSlotDate(selectedDateStr);
            setIsAddSlotOpen(true);
          }}
        >
          Add Availability Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Custom Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center py-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="text-primary-600" size={20} />
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={prevMonth}>
                  <ChevronLeft size={18} />
                </Button>
                <Button variant="ghost" size="sm" onClick={nextMonth}>
                  <ChevronRight size={18} />
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 text-center font-medium text-xs text-gray-500 uppercase tracking-wider mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dayStr = day.date.toISOString().split('T')[0];
                  const isSelected = selectedDateStr === dayStr;
                  const isToday = new Date().toISOString().split('T')[0] === dayStr;
                  const { hasMeeting, hasSlot, hasPending } = getDayStatus(day.date);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDateStr(dayStr)}
                      className={`h-24 p-1 flex flex-col justify-between border border-gray-100 rounded-md transition-all duration-150 hover:bg-primary-50 relative ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400 bg-gray-50/50'
                      } ${
                        isSelected ? 'ring-2 ring-primary-500 bg-primary-50/50 z-10' : ''
                      } ${
                        isToday ? 'border-primary-500 font-bold' : ''
                      }`}
                    >
                      <span className={`text-xs p-1 rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-primary-600 text-white' : ''
                      }`}>
                        {day.date.getDate()}
                      </span>
                      
                      {/* Dots indicating events */}
                      <div className="flex flex-col gap-1 w-full text-left mt-1">
                        {hasMeeting && (
                          <div className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-800 truncate leading-tight font-medium">
                            Meeting
                          </div>
                        )}
                        {hasSlot && (
                          <div className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate leading-tight font-medium">
                            Available
                          </div>
                        )}
                        {hasPending && (
                          <div className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-800 truncate leading-tight font-medium">
                            Pending ({userMeetings.filter(m => m.date === dayStr && m.status === 'pending').length})
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Pending Invitations list */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-800">Meeting Requests</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Incoming Requests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Incoming (To Respond)</h4>
                  {incomingRequests.length === 0 ? (
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">No incoming requests</p>
                  ) : (
                    <div className="space-y-3">
                      {incomingRequests.map(req => {
                        const guest = findUserById(req.guestId);
                        return (
                          <div key={req.id} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-sm text-gray-900">{req.title}</h5>
                                <p className="text-xs text-gray-600">With: {guest?.name} ({guest?.role})</p>
                              </div>
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Pending</span>
                            </div>
                            <p className="text-xs text-gray-650 italic">"{req.description}"</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CalendarIcon size={12} /> {req.date}
                              <Clock size={12} className="ml-1" /> {req.startTime} - {req.endTime}
                            </div>
                            <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="px-2 py-1 text-xs text-error-600 border-error-300 hover:bg-error-50"
                                onClick={() => updateMeetingStatus(req.id, 'declined')}
                                leftIcon={<X size={12} />}
                              >
                                Decline
                              </Button>
                              <Button 
                                size="sm" 
                                className="px-2 py-1 text-xs bg-success-500 hover:bg-success-600 text-white"
                                onClick={() => updateMeetingStatus(req.id, 'accepted')}
                                leftIcon={<Check size={12} />}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sent Requests</h4>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">No pending requests sent</p>
                  ) : (
                    <div className="space-y-3">
                      {outgoingRequests.map(req => {
                        const host = findUserById(req.hostId);
                        return (
                          <div key={req.id} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50/50">
                            <div>
                              <h5 className="font-semibold text-sm text-gray-900">{req.title}</h5>
                              <p className="text-xs text-gray-600">To: {host?.name} ({host?.role})</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <CalendarIcon size={12} /> {req.date}
                              <Clock size={12} className="ml-1" /> {req.startTime} - {req.endTime}
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-gray-150">
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Pending Response</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 text-error-600 hover:bg-error-50 text-xs"
                                onClick={() => updateMeetingStatus(req.id, 'declined')}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Panel: Selected Date Details */}
        <div className="space-y-6">
          {/* Selected Date Summary */}
          <Card className="border-l-4 border-l-primary-500">
            <CardHeader className="py-4">
              <h3 className="text-lg font-bold text-gray-800">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              
              {/* Availability slots for Host */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>My Availability Slots</span>
                  <span className="text-[10px] text-primary-600 font-medium">Host Role</span>
                </h4>
                {selectedDateSlots.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">No availability slots set for this day.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateSlots.map(slot => (
                      <div key={slot.id} className="flex justify-between items-center p-2 border border-gray-200 rounded-md bg-white">
                        <div className="flex items-center text-sm font-medium text-gray-800 gap-2">
                          <Clock size={16} className="text-primary-500" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1.5 text-error-600 hover:bg-error-50 rounded"
                          onClick={() => deleteAvailabilitySlot(slot.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmed Meetings */}
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Confirmed Meetings ({selectedDateMeetings.length})
                </h4>
                {selectedDateMeetings.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">No meetings scheduled for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateMeetings.map(meet => {
                      const otherUser = findUserById(meet.hostId === user.id ? meet.guestId : meet.hostId);
                      return (
                        <div key={meet.id} className="p-3 border border-success-200 bg-success-50 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-sm text-success-900">{meet.title}</h5>
                              <p className="text-xs text-success-800 font-medium">With: {otherUser?.name}</p>
                            </div>
                            <Badge variant="success">Confirmed</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{meet.description}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-success-200/50">
                            <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              <Clock size={12} /> {meet.startTime} - {meet.endTime}
                            </span>
                            <Link to={`/video?room=${meet.videoCallId}`}>
                              <Button 
                                size="sm" 
                                className="px-2 py-1 text-xs bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1.5"
                              >
                                <Video size={12} /> Join Call
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Add Slot Modal */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-primary-600" size={20} />
                Add Availability Slot
              </h3>
              <button 
                onClick={() => setIsAddSlotOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSlotSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <Input 
                  type="date" 
                  value={slotDate} 
                  onChange={(e) => setSlotDate(e.target.value)} 
                  fullWidth
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <Input 
                    type="time" 
                    value={slotStartTime} 
                    onChange={(e) => setSlotStartTime(e.target.value)} 
                    fullWidth
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <Input 
                    type="time" 
                    value={slotEndTime} 
                    onChange={(e) => setSlotEndTime(e.target.value)} 
                    fullWidth
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddSlotOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Meeting Modal */}
      {isBookingOpen && bookingHost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="text-primary-600" size={20} />
                Book Meeting with {bookingHost.name}
              </h3>
              <button 
                onClick={() => {
                  setIsBookingOpen(false);
                  window.history.replaceState({}, '', window.location.pathname);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBookSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Meeting Title</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Project Update / Investment Review"
                  value={bookTitle} 
                  onChange={(e) => setBookTitle(e.target.value)} 
                  fullWidth
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Tell them what you would like to discuss..."
                  value={bookDesc} 
                  onChange={(e) => setBookDesc(e.target.value)} 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                <Input 
                  type="date" 
                  value={bookDate} 
                  onChange={(e) => setBookDate(e.target.value)} 
                  fullWidth
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <Input 
                    type="time" 
                    value={bookStart} 
                    onChange={(e) => setBookStart(e.target.value)} 
                    fullWidth
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <Input 
                    type="time" 
                    value={bookEnd} 
                    onChange={(e) => setBookEnd(e.target.value)} 
                    fullWidth
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsBookingOpen(false);
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Send Booking Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
