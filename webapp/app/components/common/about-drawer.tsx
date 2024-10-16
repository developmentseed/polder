import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading
} from '@chakra-ui/react';

interface AboutDrawerProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function AboutDrawer(props: AboutDrawerProps) {
  const { onClose, isOpen } = props;

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size='xl'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>About</DrawerHeader>
        <DrawerBody display='flex' flexFlow='column' gap={4}>
          <Heading as='h2'>Welcome to Poldre</Heading>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            rhoncus ipsum et quam iaculis sodales.
          </p>

          <p>
            Fusce ornare, velit ac ultrices pretium, nibh odio finibus odio, eu
            pretium orci sapien in ipsum. Suspendisse dictum luctus arcu id
            dignissim. Cras lobortis mi neque, nec suscipit felis tempus et.
            Suspendisse hendrerit sem tortor, vel mollis nunc convallis eget.
          </p>

          <p>
            Fusce fermentum in enim non vehicula. Curabitur sapien nunc,
            pharetra nec congue sed, lobortis quis orci. Donec consequat congue
            laoreet. Morbi euismod dapibus mi, sed convallis ipsum pulvinar
            viverra.
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
