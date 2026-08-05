import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEvent } from 'react-native';

/**
 * Bottom overlap from the software keyboard (native) or visual viewport (web).
 * Use as paddingBottom on a sticky footer shell so CTAs stay above the keyboard.
 *
 * Android: Expo defaults to window resize (`adjustResize`) — the layout already
 * shrinks above the keyboard, so we must NOT add a second inset.
 */
export function useKeyboardBottomInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      setInset(0);
      return;
    }

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.visualViewport) {
        return;
      }
      const viewport = window.visualViewport;
      const update = () => {
        // Mobile browsers shrink visualViewport when the keyboard opens.
        const overlap = Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        );
        setInset(Math.round(overlap));
      };
      update();
      viewport.addEventListener('resize', update);
      viewport.addEventListener('scroll', update);
      window.addEventListener('resize', update);
      return () => {
        viewport.removeEventListener('resize', update);
        viewport.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
      };
    }

    const onShow = (event: KeyboardEvent) => {
      setInset(Math.max(0, Math.round(event.endCoordinates.height)));
    };
    const onHide = () => setInset(0);

    const showSub = Keyboard.addListener('keyboardWillShow', onShow);
    const hideSub = Keyboard.addListener('keyboardWillHide', onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return inset;
}
