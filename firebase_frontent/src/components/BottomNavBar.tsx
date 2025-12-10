'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart, Map, Calendar, Palette, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  { href: '/canvas', icon: Palette },
  { href: '/map', icon: Map },
  { href: '/graph', icon: BarChart },
  { href: '/calendar', icon: Calendar },
  { href: '/breakdown', icon: Copy },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-background border rounded-full shadow-lg flex items-center gap-2 p-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              asChild
              variant={'ghost'}
              size="icon"
              className={cn(
                "rounded-full w-12 h-12 transition-all text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                isClient && (pathname === item.href || (item.href === '/canvas' && pathname === '/')) && 'bg-gray-200 text-foreground'
              )}
            >
              <item.icon className="h-6 w-6" />
            </Button>
          </Link>
        ))}
      </div>
    </footer>
  );
}
