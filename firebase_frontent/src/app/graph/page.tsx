import { GraphPage } from '@/components/pages/GraphPage';
import { mockTrip } from '@/data/mock-trip';

export default function Graph() {
  return <GraphPage trip={mockTrip} />;
}
