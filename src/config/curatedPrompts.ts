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
      id: 'std-weekend-value',
      label: 'Weekend value finds',
      textTemplate: 'Show great weekend dining and shopping offers near me',
    },
    {
      id: 'std-everyday-cashback',
      label: 'Everyday cashback',
      textTemplate: 'Find everyday cashback offers for grocery, fuel, and pharmacy',
    },
    {
      id: 'std-points-use',
      label: 'Use my points smartly',
      textTemplate: 'Best ways to use my {points} points this month',
    },
  ],
  Premium: [
    {
      id: 'prm-boutique-hotels',
      label: 'Boutique hotel perks',
      textTemplate: 'Show premium boutique hotel perks and late checkout offers',
    },
    {
      id: 'prm-city-dining',
      label: 'City dining rewards',
      textTemplate: 'Recommend premium dining rewards in major cities',
    },
    {
      id: 'prm-points-upgrades',
      label: 'Points for upgrades',
      textTemplate: 'How can I use {points} points for travel and experience upgrades?',
    },
  ],
  Black: [
    {
      id: 'blk-ultra-luxury-stays',
      label: 'Ultra-luxury stays',
      textTemplate: 'Recommend ultra-luxury stays with VIP amenities and upgrades',
    },
    {
      id: 'blk-fine-dining-elite',
      label: 'Fine dining elite access',
      textTemplate: 'Find invite-only or elite fine dining rewards near me',
    },
    {
      id: 'blk-high-value-redemptions',
      label: 'High-value redemptions',
      textTemplate: 'Show the highest value ways to redeem my {points} points',
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
