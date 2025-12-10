'use client';

import type { Trip } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const filterChips = [
  { label: 'romantic', color: 'bg-pink-100 text-pink-800' },
  { label: 'trip for 2', color: 'bg-purple-100 text-purple-800' },
  { label: 'April 10th-20th', color: 'bg-blue-100 text-blue-800' },
  { label: 'for $3000', color: 'bg-green-100 text-green-800' },
  { label: 'exploring food and wine', color: 'bg-yellow-100 text-yellow-800' },
];

export function SummaryPage({ trip }: { trip: Trip }) {
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
      <main className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-12 gap-6" style={{ gridAutoRows: '80px' }}>
          {/* Most Instagrammable Places */}
          <Card className="col-span-4 row-span-5 rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-full w-full">
              <Image src="https://images.unsplash.com/photo-1594504676910-332adf9716a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxpc3RhbmJ1bCUyMHN0cmVldHxlbnwwfHx8fDE3NTYxMTEzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Instagrammable places in Istanbul" data-ai-hint="istanbul street" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-3xl font-bold leading-tight drop-shadow-md">the most instagrammable places in Istanbul</h3>
              </div>
            </div>
          </Card>

          {/* Pierre Loti Hotel */}
          <Card className="col-span-3 row-span-3 rounded-full flex items-center justify-center p-2 shadow-lg bg-background">
            <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1570206986634-afd7cccb68d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxob3RlbCUyMGV4dGVyaW9yfGVufDB8fHx8MTc1NjExMTMzMHww&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Pierre Loti Hotel" data-ai-hint="hotel exterior" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-4 left-4 right-4 text-center text-white">
                  <h4 className="font-semibold text-lg">Pierre Loti Hotel</h4>
                  <p className="text-sm">$134 per night</p>
                </div>
            </div>
          </Card>

          {/* Altan Şekerleme */}
          <Card className="col-span-3 row-span-4 rounded-3xl p-4 shadow-lg bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/30">
            <CardContent className="p-0">
                <h4 className="font-bold text-pink-900 dark:text-pink-100">Altan Şekerleme</h4>
                <p className="text-sm text-pink-700 dark:text-pink-200 mt-1 mb-3">This historical candy shop has been serving authentic Turkish candy, called lokum for decades.</p>
                <div className="relative h-40 w-full rounded-2xl overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1601314198338-113aecb40531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYW5keSUyMHNob3B8ZW58MHx8fHwxNzU2MTExMzI5fDA&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Altan Şekerleme candy shop" data-ai-hint="candy shop" />
                </div>
            </CardContent>
          </Card>

           {/* Where to eat */}
           <Card className="col-span-2 row-span-2 rounded-3xl overflow-hidden shadow-lg">
             <div className="relative h-full w-full">
              <Image src="https://images.unsplash.com/photo-1617806501553-d3a6a3a7b227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHx0dXJraXNoJTIwZm9vZHxlbnwwfHx8fDE3NTYxMTEzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Food in Istanbul" data-ai-hint="turkish food" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-semibold">Where to eat in Istanbul</h4>
                <p className="text-xs opacity-90">12 restaurants</p>
              </div>
            </div>
          </Card>

          {/* Todo List */}
          <Card className="col-span-2 row-span-3 rounded-3xl p-4 shadow-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30">
            <CardContent className="p-0">
                <h4 className="font-bold text-yellow-900 dark:text-yellow-100">Todo list for Istanbul</h4>
                <ul className="mt-2 space-y-1.5 text-sm text-yellow-800 dark:text-yellow-200">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Call dog sitter</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Drop of keys at Jen's</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Water the plants</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />Shopping</li>
                </ul>
            </CardContent>
          </Card>
        
          {/* New Content */}
          <Card className="col-span-3 row-span-4 rounded-3xl p-4 shadow-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
            <CardContent className="p-0">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Bosphorus Ferry Tour</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1 mb-3">Experience the city's beautiful coastline and see historical landmarks from the water.</p>
                <div className="relative h-40 w-full rounded-2xl overflow-hidden">
                    <Image src="https://images.unsplash.com/photo-1693752504790-db08085b96b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxpc3RhbmJ1bCUyMGZlcnJ5fGVufDB8fHx8MTc1NjExNDIwOXww&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Bosphorus Ferry" data-ai-hint="istanbul ferry" />
                </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 row-span-2 rounded-3xl overflow-hidden shadow-lg">
             <div className="relative h-full w-full">
              <Image src="https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx0dXJraXNoJTIwYmF0aCUyMGhhbW1hbXxlbnwwfHx8fDE3NTYxMTQyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Turkish bath" data-ai-hint="turkish bath hammam" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-semibold">Relax at a Hammam</h4>
                <p className="text-xs opacity-90">Traditional Turkish Bath</p>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 row-span-5 rounded-3xl overflow-hidden shadow-lg">
            <div className="relative h-full w-full">
              <Image src="https://images.unsplash.com/photo-1524754271100-b16fa3ad4906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c3RyZWV0JTIwYXJ0fGVufDB8fHx8MTc1NjExNDIwOXww&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Street art in Karakoy" data-ai-hint="street art" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white text-3xl font-bold leading-tight drop-shadow-md">Discover Street Art in Karaköy and Balat</h3>
              </div>
            </div>
          </Card>

          <Card className="col-span-3 row-span-3 rounded-full flex items-center justify-center p-2 shadow-lg bg-background">
            <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1658416439082-02fdbf7fb61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0dXJraXNoJTIwY29mZmVlfGVufDB8fHx8MTc1NjExNDIwOXww&ixlib=rb-4.1.0&q=80&w=1080" layout="fill" objectFit="cover" alt="Turkish coffee" data-ai-hint="turkish coffee" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-4 left-4 right-4 text-center text-white">
                  <h4 className="font-semibold text-lg">Coffee fortune telling</h4>
                  <p className="text-sm">A unique cultural experience</p>
                </div>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
