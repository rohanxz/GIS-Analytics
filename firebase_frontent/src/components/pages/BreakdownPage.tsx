'use client';

import type { Trip, Activity } from '@/types';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Utensils, Camera, ShoppingBag, Wind } from 'lucide-react';

const categoryIcons = {
  Dining: <Utensils className="h-4 w-4" />,
  Sightseeing: <Camera className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Activity: <Wind className="h-4 w-4" />,
};

type Category = Activity['category'];

const filterChips = [
  { label: 'romantic', color: 'bg-pink-100 text-pink-800' },
  { label: 'trip for 2', color: 'bg-purple-100 text-purple-800' },
  { label: 'April 10th-20th', color: 'bg-blue-100 text-blue-800' },
  { label: 'for $3000', color: 'bg-green-100 text-green-800' },
  { label: 'exploring food and wine', color: 'bg-yellow-100 text-yellow-800' },
];

export function BreakdownPage({ trip }: { trip: Trip }) {
  const categories: Category[] = ['Sightseeing', 'Dining', 'Activity', 'Shopping'];

  const getActivitiesByCategory = (category: Category) => {
    return trip.itinerary.filter((item) => item.category === category);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <header className="p-4 border-b">
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
      <div className="flex-1 min-h-0">
        <div className="flex flex-col h-full px-8 pb-8 pt-4">
          <Tabs defaultValue="Sightseeing" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="gap-2">
                  {categoryIcons[category]} {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="flex-1 min-h-0 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getActivitiesByCategory(category).map((activity) => (
                      <Card key={activity.id} className="flex flex-col">
                        <Image
                          src={activity.image}
                          alt={activity.title}
                          width={400}
                          height={250}
                          className="w-full h-40 object-cover rounded-t-lg"
                          data-ai-hint="travel activity"
                        />
                        <CardHeader>
                          <CardTitle>{activity.title}</CardTitle>
                          <CardDescription>Day {activity.day} at {activity.time}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                           <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                           <Badge variant={activity.budget === 'Luxury' ? 'destructive' : activity.budget === 'Mid-range' ? 'secondary' : 'default'} className="self-start">
                             {activity.budget}
                           </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                   {getActivitiesByCategory(category).length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <p>No {category.toLowerCase()} activities planned.</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
