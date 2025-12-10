export type Activity = {
  id: string;
  day: number;
  time: string;
  title: string;
  description:string;
  category: 'Dining' | 'Sightseeing' | 'Activity' | 'Shopping';
  location: Location;
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  image: string;
  popularity: 'Popular' | 'Niche';
};

export type Location = {
  name: string;
  coordinates: { lat: number; lng: number };
};

export type Trip = {
  title: string;
  destination: string;
  duration: {
    start: string;
    end: string;
    days: number;
  };
  itinerary: Activity[];
};
