import { MapPage } from '@/components/pages/MapPage';
import { mockTrip } from '@/data/mock-trip';

export default function Map() {
  return <MapPage trip={mockTrip} />;
}
