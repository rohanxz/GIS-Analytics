import { CalendarPage } from '@/components/pages/CalendarPage';
import { mockTrip } from '@/data/mock-trip';

export default function Calendar() {
  return <CalendarPage trip={mockTrip} />;
}
