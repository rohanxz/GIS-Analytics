'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  suggestItineraryImprovements,
  SuggestItineraryImprovementsOutput,
} from '@/ai/flows/suggest-itinerary-improvements';
import type { Trip } from '@/types';
import { ScrollArea } from '../ui/scroll-area';

export function ItineraryEnhancer({ trip }: { trip: Trip }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestItineraryImprovementsOutput | null>(null);
  const { toast } = useToast();

  const handleEnhance = async () => {
    setIsGenerating(true);
    setSuggestions(null);

    const itineraryString = trip.itinerary
      .map((item) => `Day ${item.day}: ${item.title} - ${item.description}`)
      .join('\n');

    try {
      const result = await suggestItineraryImprovements({
        itinerary: itineraryString,
        preferences,
      });
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate suggestions. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSuggestions(null);
      setPreferences('');
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button onClick={() => setIsOpen(true)}>
        <Wand2 className="mr-2 h-4 w-4" />
        Enhance with AI
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enhance Your Itinerary</DialogTitle>
          <DialogDescription>
            Let our AI assistant suggest improvements for your trip. Add any preferences below to get tailored recommendations.
          </DialogDescription>
        </DialogHeader>

        {!suggestions && (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="preferences">Preferences (optional)</Label>
              <Textarea
                id="preferences"
                placeholder="e.g., family-friendly activities, budget-conscious, love historical sites..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your trip...</p>
          </div>
        )}

        {suggestions && (
          <ScrollArea className="max-h-[60vh] my-4">
            <div className="space-y-6 pr-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Suggestions</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border p-4">
                  {suggestions.suggestions}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Reasoning</h3>
                 <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border p-4 bg-secondary/50">
                  {suggestions.reasoning}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          {!suggestions && (
            <Button onClick={handleEnhance} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Get Suggestions'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
