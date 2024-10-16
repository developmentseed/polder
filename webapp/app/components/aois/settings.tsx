import { useCallback, useEffect, useState } from 'react';
import { scaleSequential } from 'd3';

import { colorInterpolators } from '$utils/colormaps';

interface SettingsParams {
  indicatorId: string;
  valueDomain: [number, number];
}

export type SettingsChangeCallback = {
  (what: 'rescale', payload: [number, number]): void;
  (what: 'colorScale', payload: string): void;
};

export function useSettings({ indicatorId, valueDomain }: SettingsParams) {
  const [rescaleValue, setRescaleValue] = useState(valueDomain);
  const [colorScale, setColorScale] = useState('viridis');

  useEffect(() => {
    // Reset on indicator change
    setRescaleValue(valueDomain);
  }, [valueDomain]);

  useEffect(() => {
    // Reset on indicator change
    setColorScale('viridis');
  }, [indicatorId]);

  const onSettingsChange = useCallback<SettingsChangeCallback>((what, payload) => {
    if (what === 'rescale') {
      setRescaleValue(payload);
    } else if (what === 'colorScale') {
      setColorScale(payload);
    }
  }, []);

  return {
    onSettingsChange,
    rescale: rescaleValue,
    colorName: colorScale,
    colorFn: scaleSequential(colorInterpolators[colorScale])
  };
}
