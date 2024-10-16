import React, { useEffect, useMemo, useState } from 'react';
import {
  chakra,
  Box,
  usePrevious,
  List,
  ListItem,
  Text
} from '@chakra-ui/react';
import {
  differenceInDays,
  endOfDay,
  isWithinInterval,
  lastDayOfMonth,
  startOfDay
} from 'date-fns';

import { PopoverAnchored } from '../popover-anchored';
import {
  TimelineData,
  TimelineDataLoading,
  TimelineDataSuccess
} from './types';
import { DAY_WIDTH, formatMonthYear } from './utils';
import { useSizes } from './use-sizes';
import { usePanZoomControlled } from './use-pan-and-zoom-controlled';
import { useDateRenders } from './use-date-renders';
import { useScales } from './use-scales';
import { Gradients } from './gradients';
import { DataPointsMasks, LoadingRect } from './data-points';
import { SlidingBox } from './sliding-box';
import { AxisY } from './axis-y';
import { AxisX } from './axis-x';
import { usePopover } from './popover-hooks';

import { clamp, round } from '$utils/format';
import { IndicatorLegend } from '$components/aois/data-indicator';
import { ReferenceLine } from '$components/aois/reference-line';

interface TimelineProps {
  dateDomain: [Date, Date];
  selectedDay?: Date;
  data: TimelineData[];
  legend: IndicatorLegend;
  onDaySelect: (day: Date) => void;
  onPanEnd: (v: Date[]) => void;
  panZoomValue: { x: number; y: number; zoom: number };
  onPanZoomValueChange: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; zoom: number }>
  >;
  onPanZoomExtentChange?: (v: {
    minZoom: number;
    maxZoom: number;
    minY: number;
    maxY: number;
    minX: number;
    maxX: number;
  }) => void;
}

const toDomainExtent = (scale) => {
  const [start, end] = scale.domain();
  return [startOfDay(start), endOfDay(end)];
};

export function Timeline(props: TimelineProps) {
  const { observe, dataArea, timeline } = useSizes();

  // Ensure the timeline only renders when we have the sizes to use.
  return (
    <Box ref={observe} position='relative' w='100%' minH='36'>
      {dataArea.width > 0 && (
        <TimelineContent {...props} dataArea={dataArea} timeline={timeline} />
      )}
    </Box>
  );
}

function TimelineContent(
  props: TimelineProps & {
    dataArea: ReturnType<typeof useSizes>['dataArea'];
    timeline: ReturnType<typeof useSizes>['timeline'];
  }
) {
  const {
    legend,
    selectedDay,
    dateDomain,
    data,
    onPanEnd,
    onDaySelect,
    panZoomValue,
    onPanZoomValueChange,
    onPanZoomExtentChange,
    dataArea,
    timeline
  } = props;

  const [hoveringDay, setHoveringDay] = useState<Date>();

  // Number of days in the date domain.
  const numDays = useMemo(
    () => differenceInDays(dateDomain[1], dateDomain[0]),
    [dateDomain]
  );
  const minPanX = -(numDays * DAY_WIDTH + DAY_WIDTH / 4 - dataArea.width);
  const panZoomExtent = useMemo(
    () => ({
      minZoom: 1,
      maxZoom: 1,
      minY: 0,
      maxY: 0,
      minX: minPanX,
      maxX: 0
    }),
    [minPanX]
  );

  // Make the panZoom controlled.
  useEffect(() => {
    onPanZoomExtentChange?.(panZoomExtent);
  }, [panZoomExtent]);

  const { pan, setContainer, panZoomHandlers } = usePanZoomControlled({
    ...panZoomExtent,
    onPanEnd: () => {
      onPanEnd(toDomainExtent(scalePartial));
    },
    value: panZoomValue,
    onChange: (event) => {
      if (event.userInitiated) {
        onPanZoomValueChange(event.value);
      } else {
        // A non user initiated event comes from setting the value property. We
        // need this to request data.
        onPanEnd(toDomainExtent(createScalePartial(-event.value.x)));
      }
    }
  });

  const { scaleFull, scalePartial, createScalePartial, yScale, yTicks } =
    useScales({
      dataArea,
      yDomain: [legend.stops[0].value, legend.stops.last.value],
      dateDomain,
      numDays,
      xTranslate: -pan.x
    });

  const { daysToRender, monthsToRender } = useDateRenders({
    scale: scalePartial
  });
  // Notify parent of initial domain to request data for the timeline.
  // But we can only do so once we the timeline size has been set.
  useEffect(() => {
    if (timeline.width <= 0) return;

    onPanEnd(toDomainExtent(scalePartial));
  }, [timeline]);

  // Reposition the timeline when a day is selected.
  // Only do so if the day is not already visible.
  const prevSelectedDay = usePrevious(selectedDay);
  useEffect(() => {
    if (selectedDay && prevSelectedDay?.getTime() !== selectedDay?.getTime()) {
      const visibleDays = {
        start: daysToRender[0],
        // There's one extra day that's rendered but it is not visible to avoid
        // flickering issues.
        end: daysToRender[daysToRender.length - 2]
      };

      if (!isWithinInterval(selectedDay, visibleDays)) {
        const centerAdjust = dataArea.width / 2;
        const newPanX = clamp(
          scaleFull(selectedDay) - centerAdjust,
          0,
          -minPanX
        );

        onPanZoomValueChange((v) => ({ ...v, x: -newPanX }));
        onPanEnd(toDomainExtent(createScalePartial(newPanX)));
      }
    }
  }, [
    prevSelectedDay,
    selectedDay,
    daysToRender,
    scaleFull,
    dataArea.width,
    onPanEnd,
    createScalePartial,
    minPanX
  ]);

  const [successData, loadingData] = useMemo(
    () => [
      data.filter((d): d is TimelineDataSuccess => d.status === 'success'),
      data.filter((d): d is TimelineDataLoading => d.status === 'loading')
    ],
    [data]
  );

  const { svgRef, pointRef, bisectingDay, refPoint } = usePopover({
    xScale: scalePartial,
    data: successData
  });

  // Update reference value when the indicator changes. (It will cause the
  // yScale to change)
  const [yMin, yMax] = yScale.domain();
  const refY = yMin + (yMax - yMin) * 3/4;
  const [referenceValue, setReferenceValue] = useState(refY);
  useEffect(() => setReferenceValue(refY), [refY]);

  return (
    <Box
      ref={(el) => {
        setContainer(el);
      }}
      style={{ touchAction: 'none' }}
      {...panZoomHandlers}
    >
      <chakra.svg
        ref={svgRef}
        width={timeline.width}
        height={timeline.height}
        display='block'
        fontFamily='body'
        userSelect='none'
      >
        <defs>
          <Gradients stops={legend.stops} />

          <clipPath id='data-width'>
            <rect
              x={dataArea.x - DAY_WIDTH / 2}
              y={0}
              width={dataArea.width + DAY_WIDTH / 2}
              height={timeline.height}
            />
          </clipPath>

          <DataPointsMasks
            xScale={scalePartial}
            yScale={yScale}
            data={successData}
          />
        </defs>

        <g>
          {loadingData.map(({ date }) => (
            <LoadingRect
              key={date.toISOString()}
              x={scalePartial(date) - DAY_WIDTH / 4}
              fill='base.100a'
              yRange={yScale.range()}
              delay={date.getTime() / 1000}
            />
          ))}
        </g>

        {/* <rect
            x={dataArea.x}
            y={dataArea.y}
            width={dataArea.width}
            height={dataArea.height}
            fillOpacity={0.5}
            fill='red'
          />
          <line
            x1={dataArea.width / 2}
            x2={dataArea.width / 2}
            y1={dataArea.y}
            y2={dataArea.y2}
            stroke='red'
          /> */}

        <AxisY ticks={yTicks} yScale={yScale} dataArea={dataArea} />

        <g clipPath='url(#data-width)'>
          <AxisX
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
            data={successData}
            ticks={daysToRender}
            xScale={scalePartial}
            dataArea={dataArea}
            onHoveringDayChange={setHoveringDay}
            hoveringDay={hoveringDay || bisectingDay?.date}
          />
        </g>

        <g clipPath='url(#data-width)'>
          {monthsToRender.map((month) => (
            <SlidingBox
              key={month.toISOString()}
              minX={dataArea.x}
              startX={scalePartial(month) - DAY_WIDTH / 2}
              endX={scalePartial(lastDayOfMonth(month)) + DAY_WIDTH / 2}
            >
              <chakra.text
                dy='1.2em'
                x={0}
                y={dataArea.y2}
                fontSize={12}
                fill='base.400'
              >
                {formatMonthYear(month)}
              </chakra.text>
            </SlidingBox>
          ))}
        </g>

        {/* The Rects take up the whole timeline and give a gradient effect to
              the data area. The data masks will then show the actual data. */}
        <rect
          x={dataArea.x - DAY_WIDTH / 2}
          y={dataArea.y - 4}
          width={dataArea.width + DAY_WIDTH / 2}
          height={dataArea.height + 8}
          fill='url(#data-gradient-bg)'
          mask='url(#data-rects-bg)'
        />

        <rect
          x={dataArea.x - DAY_WIDTH / 2}
          y={dataArea.y - 4}
          width={dataArea.width + DAY_WIDTH / 2}
          height={dataArea.height + 8}
          fill='url(#data-gradient)'
          mask='url(#data-rects)'
        />

        {bisectingDay && (
          <chakra.line
            x1={scalePartial(bisectingDay.date)}
            x2={scalePartial(bisectingDay.date)}
            y1={dataArea.y}
            y2={dataArea.y2}
            stroke='primary.400'
          />
        )}

        <rect
          ref={pointRef}
          x={dataArea.x - DAY_WIDTH / 2}
          y={dataArea.y}
          width={dataArea.width + DAY_WIDTH / 2}
          height={dataArea.height}
          fillOpacity={0}
          // fill='red'
        />

        {successData.map(({ date }) => (
          <chakra.rect
            key={date.toISOString()}
            x={scalePartial(date) - DAY_WIDTH / 4}
            y={dataArea.y}
            width={`${DAY_WIDTH / 2}px`}
            height={dataArea.height}
            fillOpacity={0}
            onClick={() => onDaySelect(date)}
          />
        ))}
        {!!successData && (
          <ReferenceLine
            value={referenceValue}
            onChange={setReferenceValue}
            yScale={yScale}
            dataArea={dataArea}
          />
        )}
      </chakra.svg>
      <PopoverAnchored
        refX={refPoint[0]}
        refY={refPoint[1]}
        isVisible={!!bisectingDay}
        boxShadow='lg'
        p={2}
        borderRadius='md'
      >
        {bisectingDay && (
          <Box fontSize='sm'>
            {bisectingDay.data.valid_percent > 0 ? (
              <>
                <List>
                  <ListItem display='flex' justifyContent='space-between'>
                    <Text>Min</Text> {round(bisectingDay.data.min, 3)}
                  </ListItem>
                  <ListItem display='flex' justifyContent='space-between'>
                    <Text>Mean</Text> {round(bisectingDay.data.value, 3)}
                  </ListItem>
                  <ListItem display='flex' justifyContent='space-between'>
                    <Text>Max</Text> {round(bisectingDay.data.max, 3)}
                  </ListItem>
                </List>
                <Text mt={4} fontWeight='bold' fontSize='xs'>
                  Data from {round(bisectingDay.data.valid_percent * 100, 0)}%
                  of the water body
                </Text>
              </>
            ) : (
              <Text fontWeight='bold' fontSize='xs'>
                No data available (likely cloudy)
              </Text>
            )}
          </Box>
        )}
      </PopoverAnchored>
    </Box>
  );
}
