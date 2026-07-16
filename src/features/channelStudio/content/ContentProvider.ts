/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ContentProvider — the single seam for future API integrations.
 *
 * The studio UI only ever depends on this interface. Swapping mocked content
 * for real content (Braze, Dynamic Yield, OpenAI, SFMC, Iterable, Adobe Journey
 * Optimizer, or a custom REST API) is a matter of registering a new provider
 * that returns the same normalized ChannelContent — no UI changes required.
 */

import type { ChannelContent, ChannelId, GenerationContext } from '../types';
import { generateContent } from './heuristics';

export interface GenerateRequest {
  channel: ChannelId;
  context: GenerationContext;
  variant: number;
  senderName: string;
}

export interface ChannelContentProvider {
  id: string;
  label: string;
  generate(request: GenerateRequest): Promise<ChannelContent>;
}

/**
 * v1 provider — deterministic heuristics with simulated latency so the studio
 * shows its "personalizing…" shimmer. Fully offline, no external calls.
 */
export const MockContentProvider: ChannelContentProvider = {
  id: 'mock',
  label: 'Mock (Heuristics)',
  async generate({ channel, context, variant, senderName }) {
    // Simulated generation latency purely for the demo shimmer.
    await new Promise((resolve) => setTimeout(resolve, 520));
    return generateContent(channel, context, variant, senderName);
  },
};

const registry: Record<string, ChannelContentProvider> = {
  [MockContentProvider.id]: MockContentProvider,
};

export function getProvider(id: string = MockContentProvider.id): ChannelContentProvider {
  return registry[id] ?? MockContentProvider;
}

export function registerProvider(provider: ChannelContentProvider): void {
  registry[provider.id] = provider;
}
