import React from 'react';
import {
  // Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Text
} from '@chakra-ui/react';
import {
  CollecticonClipboard,
  CollecticonShare
} from '@devseed-ui/collecticons-chakra';

import { CopyField } from '$components/common/copy-field';
// import { IndicatorDataRaw } from '$utils/loaders';

// const indicatorData2CSV = (data) => {
//   const columns = [
//     { id: 'date', fn: (d) => d.date.toISOString() },
//     'percent_valid_in_water_body',
//     'chlorophyll.mean',
//     'chlorophyll.stddev',
//     'chlorophyll.minimum',
//     'chlorophyll.maximum',
//     'tsm.mean',
//     'tsm.stddev',
//     'tsm.minimum',
//     'tsm.maximum'
//   ];

//   const header = columns
//     .map((c) => (typeof c === 'string' ? c : c.id))
//     .join(',');

//   const rows = data.map((row) => {
//     const values = columns.map((col) => {
//       const getter =
//         typeof col === 'string'
//           ? // quick get value from nested object
//             (r) => col.split('.').reduce((acc, segment) => acc[segment], r)
//           : col.fn;
//       return getter(row);
//     });
//     return values.join(',');
//   });

//   const csv = `${header}\n${rows.join('\n')}`;
//   return csv;
// };

// // Function to handle the download action
// const handleDownload = (data) => {
//   // Generate CSV content from data
//   const csvContent = indicatorData2CSV(data);

//   // Convert the CSV content to a Blob
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

//   // Create a URL for the Blob
//   const url = URL.createObjectURL(blob);

//   // Create an anchor element and trigger the download
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', 'data.csv'); // Name the file here
//   document.body.appendChild(link);
//   link.click();

//   // Clean up by revoking the Blob URL and removing the anchor element
//   URL.revokeObjectURL(url);
//   link.remove();
// };

interface ShareOptionsProps {
  tileEndpoint: string;
}

export function ShareOptions(props: ShareOptionsProps) {
  const { tileEndpoint } = props;

  return (
    <Popover placement='bottom-end'>
      <PopoverTrigger>
        <IconButton
          aria-label='Indicator settings'
          size='xs'
          variant='ghost'
          colorScheme='base'
          icon={<CollecticonShare />}
          ml='auto'
        />
      </PopoverTrigger>
      <PopoverContent p={4} fontSize='sm' maxW={60}>
        <PopoverArrow />
        <Flex gap={2} direction='column'>
          <Flex gap={2} direction='column'>
            <Text
              as='p'
              textTransform='uppercase'
              color='base.400'
              fontSize='xs'
            >
              Share
            </Text>
            <Flex gap={2} direction='column'>
              <Heading size='xs' as='p'>
                Tile endpoint
              </Heading>
              <CopyField value={tileEndpoint}>
                {({ ref, showCopiedMsg, containerRef }) => (
                  <InputGroup size='sm' ref={containerRef}>
                    <Input
                      value={showCopiedMsg ? 'Copied!' : tileEndpoint}
                      readOnly
                    />
                    <InputRightAddon>
                      <IconButton
                        ref={ref}
                        aria-label='Copy link to clipboard'
                        size='xs'
                        variant='ghost'
                        icon={<CollecticonClipboard />}
                      />
                    </InputRightAddon>
                  </InputGroup>
                )}
              </CopyField>
            </Flex>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  );
}
