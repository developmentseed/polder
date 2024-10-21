import React, { useEffect, useMemo, useState } from 'react';
import { DateObj, useDayzed } from 'dayzed';
import {
  Button,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  useDisclosure
} from '@chakra-ui/react';
import {
  CollecticonChevronDownSmall,
  CollecticonXmarkSmall
} from '@devseed-ui/collecticons-chakra';
import { format } from 'date-fns/format.js';

import { Calendar } from './calendar';

interface DatePickerProps {
  selectedDay?: Date;
  onDaySelect: (day: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  getAllowedDays?: (args: { firstDay: Date; lastDay: Date }) => Promise<Date[]>;
}

export function DatePicker(props: DatePickerProps) {
  const { selectedDay, onDaySelect, minDate, maxDate, getAllowedDays } = props;

  const [offset, setOffset] = useState(0);
  const [allowedDays, setAllowedDays] = useState<Date[] | 'all'>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { onOpen, onClose, isOpen } = useDisclosure();

  const handleOnDateSelected = ({ date }) => {
    onDaySelect(date);
    onClose();
  };

  const handleOnOffsetChanged = (offset: number) => {
    setOffset(offset);
  };

  useEffect(() => {
    setOffset(0);
  }, [selectedDay]);

  const dayzedData = useDayzed({
    date: selectedDay,
    selected: selectedDay,
    onDateSelected: handleOnDateSelected,
    offset: offset,
    onOffsetChanged: handleOnOffsetChanged,
    minDate: minDate,
    maxDate: maxDate,
    firstDayOfWeek: 1
  });

  const [firstDay, lastDay] = useMemo(() => {
    if (dayzedData.calendars.length === 0) {
      return [undefined, undefined];
    }

    const firstDay = dayzedData.calendars[0].weeks[0]
      .find((d): d is DateObj => !!d)!
      .date.toISOString();

    /* eslint-disable-next-line fp/no-mutating-methods */
    const lastDay = [...dayzedData.calendars.last.weeks.last]
      .reverse()
      .find((d): d is DateObj => !!d)!
      .date.toISOString();

    return [firstDay, lastDay];
  }, [dayzedData.calendars]);

  // Load available days.
  useEffect(() => {
    if (!firstDay || !lastDay) return;

    async function load() {
      if (!getAllowedDays) return setAllowedDays('all');

      setIsLoading(true);
      try {
        const days = await getAllowedDays({
          firstDay: new Date(firstDay!),
          lastDay: new Date(lastDay!)
        });
        setAllowedDays(days);
      } catch (error) {
        setAllowedDays([]);
      }
      setIsLoading(false);
    }

    load();
  }, [firstDay, lastDay, getAllowedDays]);

  return (
    <Popover
      placement='top'
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      computePositionOnMount={false}
      closeOnBlur={false}
      isLazy
    >
      <PopoverTrigger>
        <Button
          aria-label='Selected date and date picker opener'
          size='md'
          variant='ghost'
          borderRadius='md'
          colorScheme='base'
          textTransform='none'
          rightIcon={<CollecticonChevronDownSmall />}
          isActive={isOpen}
        >
          {selectedDay ? format(selectedDay, 'MMM d, yyyy') : 'Select a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent width='auto'>
        <PopoverArrow />
        <Calendar
          {...dayzedData}
          isLoading={isLoading}
          isDaySelectable={(date) => {
            return allowedDays === 'all'
              ? true
              : allowedDays.some((d) => +d === +date);
          }}
          renderToolbarExtra={() => (
            <IconButton
              variant='ghost'
              size='sm'
              aria-label='Close'
              icon={<CollecticonXmarkSmall />}
              onClick={onClose}
            />
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
