/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Channel Studio — public entry point. Mount <ChannelStudio /> once inside the
 * app layout (inside the Router). It renders its own trigger and overlay and
 * touches no existing app state.
 */

import React from 'react';
import { ChannelStudioProvider } from './ChannelStudioProvider';
import ChannelStudioOverlay from './components/ChannelStudioOverlay';
import ChannelStudioFab from './components/ChannelStudioFab';

export { ChannelStudioProvider, useChannelStudio } from './ChannelStudioProvider';

export default function ChannelStudio() {
  return (
    <ChannelStudioProvider>
      <ChannelStudioFab />
      <ChannelStudioOverlay />
    </ChannelStudioProvider>
  );
}
