import React from 'react';
import { Input, InputProps } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

import {
  StressedField,
  StressedFieldProps
} from '$components/common/stressed-field';

const shake = keyframes`
  8%, 41% {
    transform: translateX(-0.5rem);
  }

  25%, 58% {
    transform: translateX(0.5rem);
  }

  75% {
    transform: translateX(-0.25rem);
  }

  92% {
    transform: translateX(0.25rem);
  }

  0%, 100% {
    transform: translateX(0);
  }
`;

export interface StressedInputProps
  extends Pick<StressedFieldProps, 'value' | 'validate' | 'onChange'>,
    Omit<InputProps, 'value' | 'onKeyPress' | 'onBlur' | 'onChange'> {}

export function StressedInput(props: StressedInputProps) {
  const { value = '', validate, onChange, ...rest } = props;

  return (
    <StressedField
      value={value.toString()}
      validate={validate}
      onChange={onChange}
      render={({ ref, errored, value, handlers }) => (
        <Input
          ref={ref}
          isInvalid={errored}
          value={value}
          animation={errored ? `${shake} 0.5s linear` : undefined}
          {...handlers}
          {...rest}
        />
      )}
    />
  );
}
