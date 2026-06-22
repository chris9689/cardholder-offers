export interface MusePresetPrompt {
  id: string;
  label: string;
  prompt: string;
}

// Central prompt config used by all Shopping Muse entry points.
export const MUSE_PRESET_PROMPTS: MusePresetPrompt[] = [
  {
    id: 'culture-activities',
    label: 'Culture activities',
    prompt: 'Which culture activities are available?',
  },
  {
    id: 'france-dining',
    label: 'Dining rewards in France',
    prompt: 'Show me premium dining rewards in France',
  },
  {
    id: 'us-shopping',
    label: 'US shopping offers',
    prompt: 'I want shopping offers in the US',
  },
  {
    id: 'travel-tier',
    label: 'Travel perks by tier',
    prompt: 'What travel perks match my card tier?',
  },
  {
    id: 'luxury-hotels',
    label: 'Ultra-luxury hotels',
    prompt: 'Recommend ultra-luxury hotels',
  },
  {
    id: 'nyc-fine-dining',
    label: 'Fine dining near NYC',
    prompt: 'Show me fine dining rewards near NYC',
  },
  {
    id: 'high-end-shopping-credit',
    label: 'High-end shopping credits',
    prompt: 'Where can I get high-end shopping statement credits?',
  },
];
