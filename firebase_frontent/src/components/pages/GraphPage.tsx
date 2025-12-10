
'use client';

import type { Trip, Activity } from '@/types';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const filterChips = [
  { label: 'romantic', color: 'bg-pink-100 text-pink-800' },
  { label: 'trip for 2', color: 'bg-purple-100 text-purple-800' },
  { label: 'April 10th-20th', color: 'bg-blue-100 text-blue-800' },
  { label: 'for $3000', color: 'bg-green-100 text-green-800' },
  { label: 'exploring food and wine', color: 'bg-yellow-100 text-yellow-800' },
];

const ActivityCard = ({ activity, className }: { activity: Activity, className?: string }) => (
  <div className={`absolute ${className}`}>
    <Card className="rounded-2xl w-40 h-28 overflow-hidden shadow-lg relative group transform transition-transform hover:scale-105">
       <Image src={activity.image} alt={activity.title} layout="fill" objectFit="cover" data-ai-hint="travel activity" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
       <div className="absolute bottom-2 left-3 right-3 text-white">
          <h4 className="font-semibold text-sm leading-tight">{activity.title}</h4>
          <p className="text-xs opacity-90">{activity.description.split(' ').slice(0, 5).join(' ')}...</p>
       </div>
    </Card>
  </div>
);

export function GraphPage({ trip }: { trip: Trip }) {
  
  const quadrants = {
    popularBudget: trip.itinerary.filter(a => a.popularity === 'Popular' && a.budget === 'Budget'),
    popularUpscale: trip.itinerary.filter(a => a.popularity === 'Popular' && a.budget !== 'Budget'),
    nicheBudget: trip.itinerary.filter(a => a.popularity === 'Niche' && a.budget === 'Budget'),
    nicheUpscale: trip.itinerary.filter(a => a.popularity === 'Niche' && a.budget !== 'Budget'),
  };

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
       <header className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 bg-background rounded-full p-2 shadow-sm border">
            <Image
                src="https://images.unsplash.com/photo-1584467541268-b040f83be3fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w7NDE5ODJ8MHwxfHNlYXJjaHwyfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbnxlbnwwfHx8fDE3NTYxMTE3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
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
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="relative w-full h-[800px]">
          {/* Axes Lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2" />

          {/* Axes Labels */}
          <div className="absolute top-1/4 -left-8 -translate-y-1/2 rotate-[-90deg] text-muted-foreground text-sm">Budget</div>
          <div className="absolute top-3/4 -left-8 -translate-y-1/2 rotate-[-90deg] text-muted-foreground text-sm">Upscale</div>
          <div className="absolute top-0 left-1/4 -translate-x-1/2 text-muted-foreground text-sm">Popular</div>
          <div className="absolute top-0 left-3/4 -translate-x-1/2 text-muted-foreground text-sm">Niche</div>

          {/* Quadrant Content */}
          <div className="w-full h-full grid grid-cols-2 grid-rows-2">
            
            {/* Top-Left: Popular & Budget */}
            <div className="relative p-4">
                {quadrants.popularBudget[0] && <ActivityCard activity={quadrants.popularBudget[0]} className="top-1/4 left-1/4" />}
            </div>

            {/* Top-Right: Niche & Budget */}
            <div className="relative p-4">
               {quadrants.nicheBudget[0] && <ActivityCard activity={quadrants.nicheBudget[0]} className="top-20 right-1/3" />}
               {quadrants.nicheBudget[1] && <ActivityCard activity={quadrants.nicheBudget[1]} className="top-1/2 right-1/2" />}
               {quadrants.nicheBudget[2] && <ActivityCard activity={quadrants.nicheBudget[2]} className="bottom-1/4 right-1/4" />}
            </div>

            {/* Bottom-Left: Popular & Upscale */}
            <div className="relative p-4">
              {quadrants.popularUpscale[0] && <ActivityCard activity={quadrants.popularUpscale[0]} className="bottom-1/4 left-1/2" />}
              {quadrants.popularUpscale[1] && <ActivityCard activity={quadrants.popularUpscale[1]} className="top-10 left-10" />}
            </div>

            {/* Bottom-Right: Niche & Upscale */}
            <div className="relative p-4">
              {quadrants.nicheUpscale[0] && <ActivityCard activity={quadrants.nicheUpscale[0]} className="bottom-1/2 right-1/2" />}
              {quadrants.nicheUpscale[1] && <ActivityCard activity={quadrants.nicheUpscale[1]} className="bottom-1/4 right-1/4" />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
