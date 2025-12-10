import { SummaryPage } from '@/components/pages/SummaryPage';
import { mockTrip } from '@/data/mock-trip';

export default function Canvas() {
  return <SummaryPage trip={mockTrip} />;
}
