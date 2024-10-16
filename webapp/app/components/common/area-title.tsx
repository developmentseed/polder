import React from 'react';
import { Badge, Heading } from '@chakra-ui/react';
import { CollecticonChevronLeftSmall } from '@devseed-ui/collecticons-chakra';

import SmartLink from '$components/common/smart-link';

interface AreaTitleProps {
  volume?: number;
  name: string;
  isRoot?: boolean;
}

export function AreaTitle(props: AreaTitleProps) {
  const { volume, name, isRoot } = props;

  return (
    <Heading as='h1' size='sm' display='flex' alignItems='center' gap={2}>
      <SmartLink
        to='/'
        display='flex'
        alignItems='center'
        gap={2}
        color='currentcolor'
        pointerEvents='all'
      >
        {!isRoot && <CollecticonChevronLeftSmall />} {name}
      </SmartLink>
      {!!volume && (
        <Badge>
          {volume} hm<sup>3</sup>
        </Badge>
      )}
    </Heading>
  );
}
