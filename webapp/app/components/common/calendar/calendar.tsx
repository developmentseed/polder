import React from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import {
  CollecticonChevronLeftSmall,
  CollecticonChevronRightSmall
} from '@devseed-ui/collecticons-chakra';
import { RenderProps } from 'dayzed';
import { format } from 'date-fns/format.js';

const getLabel = (calendars) => {
  if (calendars.length === 1) {
    return format(calendars[0].firstDayOfMonth, 'MMMM yyyy');
  }

  const start = calendars[0].firstDayOfMonth;
  const end = calendars.last.firstDayOfMonth;

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
  }

  return `${format(start, 'MMM yy')} - ${format(end, 'MMM yy')}`;
};

interface CalendarProps extends RenderProps {
  renderToolbarExtra?: () => React.ReactNode;
  isLoading?: boolean;
  isDaySelectable?: (date: Date) => boolean;
}

export function Calendar(props: CalendarProps) {
  const {
    calendars,
    getBackProps,
    getForwardProps,
    getDateProps,
    renderToolbarExtra,
    isLoading,
    isDaySelectable = () => true
  } = props;

  if (!calendars.length) return null;

  const backProps = getBackProps({ calendars });
  const forwardProps = getForwardProps({ calendars });

  return (
    <Flex bg='#fff' flexFlow='column' p={4} gap={2}>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading as='span' size='sm'>
          {getLabel(calendars)}
        </Heading>
        <Flex>
          <IconButton
            {...backProps}
            isDisabled={backProps.disabled}
            variant='ghost'
            size='sm'
            aria-label='Previous month'
            icon={<CollecticonChevronLeftSmall />}
          />
          <IconButton
            {...forwardProps}
            isDisabled={forwardProps.disabled}
            variant='ghost'
            size='sm'
            aria-label='Next month'
            icon={<CollecticonChevronRightSmall />}
          />
          {renderToolbarExtra?.()}
        </Flex>
      </Flex>
      <Flex gap={4}>
        {calendars.map((calendar) => (
          <Box key={`${calendar.year}${calendar.month}`}>
            <Grid templateColumns='repeat(7, 1fr)' gap={1}>
              {calendar.weeks[1].map(
                (dateObj) =>
                  dateObj && (
                    <GridItem
                      key={dateObj.date.toISOString()}
                      textAlign='center'
                    >
                      <Heading as='span' fontSize='xs'>
                        {format(dateObj.date, 'iiiii')}
                      </Heading>
                    </GridItem>
                  )
              )}
            </Grid>
            <Grid
              templateColumns='repeat(7, 1fr)'
              templateRows='repeat(6, 1fr)'
              gap={1}
              position='relative'
            >
              {calendar.weeks.map((week, weekIndex) =>
                week.map((dateObj, index) => {
                  if (!dateObj) return null;

                  const key = `${calendar.year}${calendar.month}${weekIndex}${index}`;
                  const { date, selected, selectable } = dateObj;

                  const selectableDay = selectable && isDaySelectable(date);

                  return (
                    <GridItem key={key} colStart={index + 1} textAlign='center'>
                      <Button
                        {...getDateProps({ dateObj })}
                        isDisabled={!selectableDay}
                        size='sm'
                        borderRadius='md'
                        isActive={selected}
                        variant='ghost'
                        color={selected ? 'primary.500' : 'base.500'}
                      >
                        {format(date, 'dd')}
                      </Button>
                    </GridItem>
                  );
                })
              )}
              {isLoading && (
              <Flex
                position='absolute'
                inset={0}
                bg='rgba(255,255,255,0.88)'
                alignItems='center'
                justifyContent='center'
                zIndex={1}
                gap={2}
                fontWeight='600'
                fontSize='sm'
              >
                <Spinner size='sm' /> Loading
              </Flex>
              )}
            </Grid>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
