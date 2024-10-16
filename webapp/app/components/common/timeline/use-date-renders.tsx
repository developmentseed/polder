import { useMemo } from 'react';
import { timeMonth } from 'd3';
import { add, eachDayOfInterval } from 'date-fns';

export function useDateRenders({
  scale
}: {
  scale: d3.ScaleTime<number, number>;
}) {
  const { daysToRender, monthsToRender } = useMemo(() => {
    const [firstDay, lastDay] = scale.domain();

    const daysToRender = eachDayOfInterval({
      start: firstDay,
      end: add(lastDay, { days: 1 })
    });

    const monthsToRender = daysToRender.reduce<Date[]>((acc, day) => {
      const month = timeMonth.floor(day);
      if (acc.last?.getTime() !== month.getTime()) {
        return [...acc, month];
      }
      return acc;
    }, []);

    return { daysToRender, monthsToRender };
  }, [scale]);

  return { daysToRender, monthsToRender };
}
