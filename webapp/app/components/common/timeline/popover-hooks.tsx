import { useEffect, useRef, useState } from 'react';

import { ScaleTime, bisectCenter, pointer } from 'd3';
import { TimelineDataSuccess } from './types';

export function usePopover(params: {
  xScale: ScaleTime<number, number>;
  data: TimelineDataSuccess[];
}) {
  const { xScale, data } = params;

  const svgRef = useRef<SVGSVGElement>(null);

  const [bisectingDay, setBisectingDay] = useState<
    TimelineDataSuccess | undefined
  >(undefined);

  const [popoverRefPoint, setPopoverRefPoint] = useState<[number, number]>([
    0, 0
  ]);

  const {
    coords: { inside, x, y },
    pointRef
  } = useMousePointInRef();

  useEffect(() => {
    if (!inside || !x || !svgRef.current) return setBisectingDay(undefined);
    const date = xScale.invert(x);
    const idx = bisectCenter(
      data.map((d) => d.date),
      date
    );
    const day = data[idx];
    setBisectingDay(day);

    if (!day) return;

    const elBounds = svgRef.current.getBoundingClientRect();

    const pX = xScale(day.date) + elBounds.x;
    const pY = elBounds.y + elBounds.height / 2;
    setPopoverRefPoint([pX, pY]);
  }, [inside, x, y, data, xScale]);

  return { svgRef, pointRef, bisectingDay, refPoint: popoverRefPoint };
}

// Get the coordinates of the mouse pointer relative to a given element.
function useMousePointInRef() {
  const elRef = useRef(null);
  const [coords, setCoords] = useState<{
    inside: boolean;
    x?: number;
    y?: number;
  }>({
    inside: false,
    x: undefined,
    y: undefined
  });

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      try {
        const [elX, elY] = pointer(event, elRef.current);
        const onTarget = document
          .elementsFromPoint(event.x, event.y)
          .some((el) => el === elRef.current);
  
        if (onTarget) {
          setCoords({ inside: true, x: elX, y: elY });
        } else {
          setCoords({ inside: false, x: undefined, y: undefined });
        }
      } catch (error) {
        // If the user is moving the mouse as the page loads it causes an error
        // due to a missing node. We ignore it!
      }
    };

    document.addEventListener('mousemove', handler);

    return () => document.removeEventListener('mousemove', handler);
  }, []);

  return { pointRef: elRef, coords };
}
