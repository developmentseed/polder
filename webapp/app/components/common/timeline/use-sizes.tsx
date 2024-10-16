import { useMemo, useState } from 'react';
import useDimensions from 'react-cool-dimensions';

import { PADDING } from './utils';

export function useSizes() {
  const [timelineSize, setTimelineSize] = useState({ width: 0, height: 0 });

  const { observe } = useDimensions({
    onResize: ({ width, height }) => {
      setTimelineSize({ width, height });
    }
  });

  const dataArea = useMemo(() => {
    const width = timelineSize.width - PADDING.left - PADDING.right;
    const height = timelineSize.height - PADDING.top - PADDING.bottom;
    return {
      x: PADDING.left,
      y: PADDING.top,
      x2: PADDING.left + width,
      y2: PADDING.top + height,
      width,
      height
    };
  }, [timelineSize]);

  return {
    dataArea,
    timeline: timelineSize,
    observe
  };
}
