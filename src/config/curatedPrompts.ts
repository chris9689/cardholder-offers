import type { CardType } from '../contexts/CardContext';

export interface CuratedPromptTemplate {
  id: string;
  label: string;
  textTemplate: string;
}

export interface CuratedPrompt {
  id: string;
  label: string;
  text: string;
}

const FALLBACK_CURATED_PROMPTS: CuratedPromptTemplate[] = [
  {
    id: 'fallback-hotel-upgrades',
    label: 'Hotel upgrades & custom stays',
    textTemplate: 'Hotel upgrades and VIP luxury stays',
  },
  {
    id: 'fallback-fine-dining',
    label: 'Michelin & dining rewards',
    textTemplate: 'Michelin star dining perks and nearby rewards',
  },
  {
    id: 'fallback-points-redemption',
    label: 'Redeem with my points',
    textTemplate: 'Offers redeemable with my points balance of {points}',
  },
];

// NOTE: This file is the single source of truth for prompt chips used on:
// 1) Homepage under search bar
// 2) Curated page preset chips
// 3) Agent Drawer suggested requests
// Legacy `musePrompts.ts` has been removed to avoid split configuration.

// Edit this object to control homepage curated prompts per card tier.
// Use {points} in textTemplate when you want runtime points injected.
export const CURATED_PROMPTS_BY_TIER: Record<CardType, CuratedPromptTemplate[]> = {
  Standard: [
    {
      id: 'std-weekend-deals',
      label: 'Weekend Deals',
      textTemplate: 'Show me the best offers for my plans this weekend.',
    },
    {
      id: 'std-family-entertainment',
      label: 'Family Entertainment',
      textTemplate: 'Recommend offers suitable for families looking for entertainment.',
    },
    {
      id: 'std-smart-shopping',
      label: 'Smart Shopping',
      textTemplate: 'Show me offers that provide the best value for money.',
    },
    {
      id: 'std-seasonal-savings',
      label: 'Seasonal Savings',
      textTemplate: 'Recommend offers related to current seasonal promotions and events.',
    },
  ],
  Premium: [
    {
      id: 'prm-shopping-privileges',
      label: 'Shopping Privileges',
      textTemplate: 'Show me exclusive retail offers and premium shopping benefits.',
    },
    {
      id: 'prm-dining-offers',
      label: 'Dining Offers',
      textTemplate: 'Recommend dining offers available with my card.',
    },
    {
      id: 'prm-wellness-fitness',
      label: 'Wellness & Fitness',
      textTemplate: 'Recommend offers for spas, fitness memberships, and wellness experiences.',
    },
    {
      id: 'prm-reward-maximization',
      label: 'Reward Maximization',
      textTemplate: 'Find offers that help me maximize savings.',
    },
  ],
  Black: [
    {
      id: 'blk-curated-lifestyle',
      label: 'Curated Lifestyle',
      textTemplate: 'Recommend the lifestyle offers currently available.',
    },
    {
      id: 'blk-exclusive-value',
      label: 'Exceptional Value',
      textTemplate: 'Find the highest-value offers available for Black cardholders.',
    },
    {
      id: 'blk-luxury-travel',
      label: 'Luxury Travel',
      textTemplate: 'Recommend premium travel experiences, suites, and exclusive hotel benefits.',
    },
    {
      id: 'blk-expiring-soon',
      label: 'Expiring Soon',
      textTemplate: 'Show offers that are ending soon and worth using.',
    },
  ],
};

function injectPromptVariables(template: string, points?: number): string {
  if (!points || points === 0) {
    // Remove {points} placeholder if no points provided
    return template.replace(/\s*\{points\}/g, '').replace(/\s+/g, ' ').trim();
  }
  return template.replace(/\{points\}/g, points.toLocaleString());
}

export function getCuratedHomepagePrompts(cardType: CardType, points?: number): CuratedPrompt[] {
  const templates = CURATED_PROMPTS_BY_TIER[cardType] ?? FALLBACK_CURATED_PROMPTS;

  return templates.map((template) => ({
    id: template.id,
    label: template.label,
    text: injectPromptVariables(template.textTemplate, points),
  }));
}
