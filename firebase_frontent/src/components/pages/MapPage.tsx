'use client';

import type { Trip } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Utensils, Camera, ShoppingBag, Wind } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const categoryIcons = {
  Dining: Utensils,
  Sightseeing: Camera,
  Shopping: ShoppingBag,
  Activity: Wind,
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

// A rough center of Istanbul
const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
};

const filterChips = [
  { label: 'romantic', color: 'bg-pink-100 text-pink-800' },
  { label: 'trip for 2', color: 'bg-purple-100 text-purple-800' },
  { label: 'April 10th-20th', color: 'bg-blue-100 text-blue-800' },
  { label: 'for $3000', color: 'bg-green-100 text-green-800' },
  { label: 'exploring food and wine', color: 'bg-yellow-100 text-yellow-800' },
];

export function MapPage({ trip }: { trip: Trip }) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const locations = trip.itinerary;
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const mapCenter = useMemo(() => {
    if (locations.length === 0) {
      return defaultCenter;
    }
    const totalLat = locations.reduce((sum, loc) => sum + loc.location.coordinates.lat, 0);
    const totalLng = locations.reduce((sum, loc) => sum + loc.location.coordinates.lng, 0);
    return {
      lat: totalLat / locations.length,
      lng: totalLng / locations.length,
    };
  }, [locations]);

  const handleMarkerClick = (id: string) => {
    setActiveMarker(id);
    setHoveredPin(id);
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading maps. Please check the API key.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
       <header className="p-4 border-b">
        <div className="flex items-center gap-4 bg-background rounded-full p-2 shadow-sm border">
            <Image
                src="https://images.unsplash.com/photo-1584467541268-b040f83be3fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbnxlbnwwfHx8fDE3NTYxMTE3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Trip to Istanbul"
                width={40}
                height={40}
                className="rounded-full"
                data-ai-hint="travel destination"
            />
            <span className="font-semibold whitespace-nowrap">Trip to Istanbul</span>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              <div className="flex gap-2 pr-2">
                {filterChips.map(chip => (
                  <Badge key={chip.label} variant="outline" className={`py-1 px-3 rounded-full border-transparent whitespace-nowrap ${chip.color}`}>
                    {chip.label}
                  </Badge>
                ))}
                <Badge variant="outline" className="py-1 px-3 rounded-full border-gray-300 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                  +4
                </Badge>
              </div>
            </div>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          <Card className="lg:col-span-2 h-full overflow-hidden relative shadow-lg">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
              >
                {locations.map((loc) => {
                  const Icon = categoryIcons[loc.category];
                  return (
                    <MarkerF
                      key={loc.id}
                      position={loc.location.coordinates}
                      title={loc.title}
                      onClick={() => handleMarkerClick(loc.id)}
                      onMouseOver={() => setHoveredPin(loc.id)}
                      onMouseOut={() => setHoveredPin(null)}
                      icon={{
                        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                        fillColor: hoveredPin === loc.id ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
                        fillOpacity: 1,
                        strokeWeight: 0,
                        rotation: 0,
                        scale: 1.5,
                        anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 24) : undefined,
                      }}
                    />
                  );
                })}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading Map...</p>
              </div>
            )}
          </Card>
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Planned Locations
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {locations.map((loc) => {
                    const Icon = categoryIcons[loc.category];
                    return (
                      <div
                        key={loc.id}
                        className={cn(
                          "p-3 rounded-lg border transition-colors cursor-pointer",
                          hoveredPin === loc.id || activeMarker === loc.id ? 'bg-secondary' : 'bg-transparent'
                        )}
                        onMouseEnter={() => setHoveredPin(loc.id)}
                        onMouseLeave={() => setHoveredPin(null)}
                        onClick={() => handleMarkerClick(loc.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/20 p-2 rounded-full">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{loc.title}</p>
                            <p className="text-xs text-muted-foreground">{loc.location.name}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
