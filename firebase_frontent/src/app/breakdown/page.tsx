import { BreakdownPage } from '@/components/pages/BreakdownPage';
import { mockTrip } from '@/data/mock-trip';

export default function Breakdown() {
  // This page is now the duplicate/copy page, but we can reuse the breakdown component for now.
  return <BreakdownPage trip={mockTrip} />;
}
