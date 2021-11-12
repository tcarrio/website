import lottie from 'lottie-web';
import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function useLottie({ lottieOptions, useInViewOptions = {}, events = {}, isInView }) {
  const shouldWaitForImagesToLoad = !!lottieOptions.animationData.assets.find(
    (asset) => asset.p?.includes('.png') || asset.p?.includes('.jpg')
  );

  const animationRef = useRef();
  const [animation, setAnimation] = useState();
  const [isAnimationReady, setIsAnimationReady] = useState(!shouldWaitForImagesToLoad);
  const [animationVisibilityRef, isInViewInternal] = useInView({
    threshold: 0.4,
    triggerOnce: !lottieOptions.loop,
    ...useInViewOptions,
  });

  useEffect(() => {
    const lottieAnimation = lottie.loadAnimation({
      renderer: 'svg',
      container: animationRef.current,
      autoplay: false,
      loop: false,
      ...lottieOptions,
    });

    Object.entries({
      loaded_images() {
        setIsAnimationReady(true);
      },
      ...events,
    }).forEach(([eventName, callback]) => {
      lottieAnimation.addEventListener(eventName, callback.bind(lottieAnimation));
    });

    setAnimation(lottieAnimation);

    return () => lottieAnimation.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (animation && isAnimationReady) {
      if (isInViewInternal || isInView) {
        animation.play();
      } else {
        animation.pause();
      }
    }
  }, [animation, isAnimationReady, isInViewInternal, isInView]);

  return { animation, isAnimationReady, animationRef, animationVisibilityRef };
}