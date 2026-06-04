import React, { createContext, useState, useContext, useEffect } from 'react';
import { AvailabilitySlot, Meeting } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface MeetingContextType {
  slots: AvailabilitySlot[];
  meetings: Meeting[];
  addAvailabilitySlot: (date: string, startTime: string, endTime: string) => void;
  deleteAvailabilitySlot: (slotId: string) => void;
  bookMeeting: (hostId: string, title: string, description: string, date: string, startTime: string, endTime: string) => void;
  updateMeetingStatus: (meetingId: string, status: 'accepted' | 'declined') => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

const SLOTS_STORAGE_KEY = 'nexus_availability_slots';
const MEETINGS_STORAGE_KEY = 'nexus_meetings';

// Initial Mock Availability Slots
const initialSlots: AvailabilitySlot[] = [
  { id: 'slot-1', userId: 'i1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '10:00', endTime: '11:00' },
  { id: 'slot-2', userId: 'i1', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], startTime: '14:00', endTime: '15:00' },
  { id: 'slot-3', userId: 'i2', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '11:00', endTime: '12:00' },
  { id: 'slot-4', userId: 'e1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '09:00', endTime: '10:00' }
];

// Initial Mock Meetings
const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    hostId: 'i1',
    guestId: 'e1',
    title: 'Initial Pitch Review',
    description: 'Discussing TechWave AI Series A terms and financial projections.',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '16:00',
    endTime: '17:00',
    status: 'accepted',
    videoCallId: 'room-techwave-pitch'
  },
  {
    id: 'meet-2',
    hostId: 'e2',
    guestId: 'i2',
    title: 'CleanTech Supply Chain Sync',
    description: 'Analyzing supply chain dynamics and biodegradable packaging manufacturing costs.',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '11:00',
    endTime: '12:00',
    status: 'pending',
    videoCallId: 'room-cleantech-sync'
  }
];

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedSlots = localStorage.getItem(SLOTS_STORAGE_KEY);
    const savedMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);

    if (savedSlots) {
      setSlots(JSON.parse(savedSlots));
    } else {
      setSlots(initialSlots);
      localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(initialSlots));
    }

    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    } else {
      setMeetings(initialMeetings);
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(initialMeetings));
    }
  }, []);

  // Save to LocalStorage helper
  const saveSlots = (updatedSlots: AvailabilitySlot[]) => {
    setSlots(updatedSlots);
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(updatedSlots));
  };

  const saveMeetings = (updatedMeetings: Meeting[]) => {
    setMeetings(updatedMeetings);
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updatedMeetings));
  };

  // Add availability slot
  const addAvailabilitySlot = (date: string, startTime: string, endTime: string) => {
    if (!user) return;
    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      userId: user.id,
      date,
      startTime,
      endTime
    };
    saveSlots([...slots, newSlot]);
    toast.success('Availability slot added successfully!');
  };

  // Delete availability slot
  const deleteAvailabilitySlot = (slotId: string) => {
    const updated = slots.filter(s => s.id !== slotId);
    saveSlots(updated);
    toast.success('Availability slot removed');
  };

  // Book a meeting (Sends request)
  const bookMeeting = (
    hostId: string,
    title: string,
    description: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (!user) return;
    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      hostId,
      guestId: user.id,
      title,
      description,
      date,
      startTime,
      endTime,
      status: 'pending',
      videoCallId: `room-${Math.random().toString(36).substring(2, 10)}`
    };
    saveMeetings([...meetings, newMeeting]);
    toast.success('Meeting request sent successfully!');
  };

  // Accept or decline meeting
  const updateMeetingStatus = (meetingId: string, status: 'accepted' | 'declined') => {
    const updated = meetings.map(m => {
      if (m.id === meetingId) {
        return { ...m, status };
      }
      return m;
    });
    saveMeetings(updated);
    toast.success(`Meeting request ${status}`);
  };

  return (
    <MeetingContext.Provider value={{
      slots,
      meetings,
      addAvailabilitySlot,
      deleteAvailabilitySlot,
      bookMeeting,
      updateMeetingStatus
    }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
};
