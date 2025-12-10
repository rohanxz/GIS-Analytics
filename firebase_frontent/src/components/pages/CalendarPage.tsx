
'use client';

import * as React from 'react';
import type { Trip, Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Utensils, Camera, ShoppingBag, Wind, ChevronLeft, ChevronRight, ListFilter, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryIcons = {
  Dining: <Utensils className="h-4 w-4" />,
  Sightseeing: <Camera className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Activity: <Wind className="h-4 w-4" />,
};

const filterChips = [
  { label: 'romantic', color: 'bg-pink-100 text-pink-800' },
  { label: 'trip for 2', color: 'bg-purple-100 text-purple-800' },
  { label: 'April 10th-20th', color: 'bg-blue-100 text-blue-800' },
  { label: 'for $3000', color: 'bg-green-100 text-green-800' },
  { label: 'exploring food and wine', color: 'bg-yellow-100 text-yellow-800' },
];

export function CalendarPage({ trip }: { trip: Trip }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9 AM to 9 PM

  React.useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the top initially.
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  const getActivitiesByDay = (dayIndex: number) => {
    // Note: This is a mock. In a real app, you'd map dates to days.
    // We'll just distribute the mock data across the week for display.
    const day = dayIndex + 1; // Assuming dayIndex 0 is Day 1 for mock data
    return trip.itinerary
      .filter((item) => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  const parseTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour + minute / 60;
  };
  
  const calculateGridPosition = (activity: Activity) => {
    const startTime = parseTime(activity.time);
    const endTime = startTime + 2; // Mock duration
    
    const startRow = (startTime - 9) * 2 + 3; // 30-min intervals, starts at 9am, offset for header
    const durationInIntervals = (endTime - startTime) * 2;

    return {
      gridColumnStart: activity.day + 1,
      gridRow: `${startRow} / span ${durationInIntervals}`,
    };
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900">
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

      <div className="flex-1 grid grid-cols-[1fr_280px] min-h-0">
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
                    <h2 className="text-xl font-semibold">April 2024</h2>
                    <Button variant="ghost" size="icon"><ChevronRight className="h-5 w-5" /></Button>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="week">
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2"><ListFilter className="h-4 w-4"/> Filter</Button>
                </div>
            </div>
            <ScrollArea className="flex-1" viewportRef={scrollRef}>
                <div className="grid grid-cols-[60px_repeat(7,1fr)] grid-rows-[auto_repeat(24,30px)] p-4 gap-x-2">
                    {/* Empty cell for timeline corner */}
                    <div />
                    {/* Day headers */}
                    {days.map((day, index) => (
                        <div key={day} className="text-center py-2">
                        <p className="text-xs text-muted-foreground">{day}</p>
                        <p className="text-2xl font-medium">{10 + index}</p>
                        </div>
                    ))}

                    {/* Timeline */}
                    {hours.map((hour) => (
                        <React.Fragment key={hour}>
                            <div className="row-start-2" style={{ gridRowStart: (hour - 9) * 2 + 3 }}>
                                <span className="text-xs text-muted-foreground -translate-y-1/2 relative top-1">{hour % 12 || 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}</span>
                            </div>
                        </React.Fragment>
                    ))}

                    {/* Grid lines */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={`v-line-${i}`} className="col-start-1 row-start-2 row-span-full h-full border-r" style={{gridColumnStart: i+2}} />
                    ))}
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={`h-line-${i}`} className="col-start-2 col-span-full w-full border-t" style={{gridRowStart: i+3}} />
                    ))}

                    {/* Activities */}
                    {trip.itinerary.map((activity) => {
                        const position = calculateGridPosition(activity);
                        if(position.gridRow.startsWith('NaN')) return null;
                        const hasImage = activity.id === '3' || activity.id === '7';
                        return (
                        <div key={activity.id} className="relative col-start-1 row-start-1 rounded-lg p-2 text-xs" style={position}>
                          <Card className={`h-full w-full overflow-hidden flex flex-col ${hasImage ? 'bg-black/50 text-white' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                           {hasImage && <Image src={activity.image} alt={activity.title} fill objectFit="cover" className="z-0" data-ai-hint="travel landmark" />}
                           <div className="relative z-10 p-2">
                            <p className="font-semibold">{activity.title}</p>
                            <p className={hasImage ? "opacity-80" : "text-muted-foreground"}>{activity.time}</p>
                           </div>
                          </Card>
                        </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
        <aside className="border-l flex flex-col">
          <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Places
              </h3>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                    {trip.itinerary.map(item => (
                        <Card key={item.id} className="overflow-hidden shadow-sm">
                            <div className="relative h-24 w-full">
                                <Image src={item.image} alt={item.title} fill objectFit="cover" data-ai-hint="travel destination" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 left-3 right-3 text-white">
                                    <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                                    <p className="text-xs opacity-90">{item.category}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
