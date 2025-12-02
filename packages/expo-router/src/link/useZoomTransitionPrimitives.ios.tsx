'use client';

import { nanoid } from 'nanoid/non-secure';
import React, { useMemo, type PropsWithChildren } from 'react';

import { INTERNAL_EXPO_ROUTER_ZOOM_TRANSITION_SOURCE_ID_PARAM_NAME } from '../navigationParams';
import { isZoomTransitionEnabled } from './ZoomTransitionEnabler';
import { useIsPreview } from './preview/PreviewRouteContext';
import { LinkZoomTransitionSource } from './preview/native';
import { LinkProps } from './useLinkHooks';
import { ZoomSourceContext } from './zoom';

const NOOP_COMPONENT = (props: { children: React.ReactNode }) => {
  return props.children;
};

export function useZoomTransitionPrimitives({
  unstable_transition,
  unstable_transitionAlignmentRect,
  unstable_customTransitionSource,
  href,
}: LinkProps) {
  const isPreview = useIsPreview();
  const zoomTransitionId = useMemo(
    () =>
      unstable_transition === 'zoom' &&
      !isPreview &&
      process.env.EXPO_OS === 'ios' &&
      isZoomTransitionEnabled()
        ? nanoid()
        : undefined,
    []
  );
  const ZoomTransitionWrapper = useMemo(() => {
    if (!zoomTransitionId) {
      return NOOP_COMPONENT;
    }
    const value = unstable_customTransitionSource
      ? { identifier: zoomTransitionId, alignment: unstable_transitionAlignmentRect }
      : undefined;
    const Wrapper = (props: PropsWithChildren) => (
      <ZoomSourceContext value={value}>{props.children}</ZoomSourceContext>
    );
    console.log(
      'useZoomTransitionPrimitives creating Wrapper with custom source:',
      unstable_customTransitionSource,
      value
    );
    if (unstable_customTransitionSource) {
      return Wrapper;
    }
    return (props: { children: React.ReactNode }) => (
      <Wrapper>
        <LinkZoomTransitionSource
          identifier={zoomTransitionId}
          alignment={unstable_transitionAlignmentRect}>
          {props.children}
        </LinkZoomTransitionSource>
      </Wrapper>
    );
  }, [
    zoomTransitionId,
    unstable_transitionAlignmentRect?.x,
    unstable_transitionAlignmentRect?.y,
    unstable_transitionAlignmentRect?.width,
    unstable_transitionAlignmentRect?.height,
    unstable_customTransitionSource,
  ]);
  const computedHref = useMemo(() => {
    if (!zoomTransitionId) {
      return href;
    }
    if (typeof href === 'string') {
      return {
        pathname: href,
        params: {
          [INTERNAL_EXPO_ROUTER_ZOOM_TRANSITION_SOURCE_ID_PARAM_NAME]: zoomTransitionId,
        },
      };
    }
    return {
      pathname: href.pathname,
      params: {
        ...(href.params ?? {}),
        [INTERNAL_EXPO_ROUTER_ZOOM_TRANSITION_SOURCE_ID_PARAM_NAME]: zoomTransitionId,
      },
    };
  }, [href, zoomTransitionId]);
  return { ZoomTransitionWrapper, href: computedHref };
}
