import { useEffect, useRef } from 'react';

/**
 * Returns stable display props based on the provided props and unmounting flag.
 * If the unmounting flag is true, it returns the previous props, otherwise it
 * returns the current props.
 * This is used to ensure that the display props are available during the
 * unmounting phase. Useful for exit animations.
 * 
 * @param {Object} options - The options object.
 * @param {T} options.props - The current props.
 * @param {boolean} options.unmounting - The unmounting flag.
 *
 * @returns {T} - The stable display props.
 */
export function useStableDisplayProps<T>({
  props,
  unmounting
}: {
  props: T;
  unmounting: boolean;
}): T {
  const prevProps = useRef(props);

  useEffect(() => {
    if (!unmounting) {
      prevProps.current = props;
    }
  }, [unmounting, props]);

  return unmounting ? prevProps.current : props;
}
