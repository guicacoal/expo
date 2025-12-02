'use client';

import Constants from 'expo-constants';
import React, { Children, isValidElement, use, type PropsWithChildren } from 'react';

import { BaseExpoRouterLink } from './BaseExpoRouterLink';
import { LinkWithPreview } from './LinkWithPreview';
import { isZoomTransitionEnabled } from './ZoomTransitionEnabler';
import { LinkMenu, LinkPreview } from './elements';
import { useIsPreview } from './preview/PreviewRouteContext';
import {
  LinkZoomTransitionSource,
  ZoomTransitionSourceAlignmentRectProvider,
} from './preview/native';
import { LinkProps } from './useLinkHooks';
import { useZoomTransitionPrimitives } from './useZoomTransitionPrimitives';
import { ZoomContext, ZoomSourceContext } from './zoom';
import { shouldLinkExternally } from '../utils/url';

export function ExpoLink(props: LinkProps) {
  const isPreview = useIsPreview();
  const { ZoomTransitionWrapper, href } = useZoomTransitionPrimitives(props);
  const shouldUseLinkWithPreview =
    process.env.EXPO_OS === 'ios' &&
    isLinkWithPreview(props) &&
    !isPreview &&
    Constants?.expoConfig?.newArchEnabled !== false;
  if (shouldUseLinkWithPreview) {
    return (
      <ZoomTransitionWrapper>
        <LinkWithPreview {...props} href={href} hrefForPreviewNavigation={props.href} />
      </ZoomTransitionWrapper>
    );
  }
  let children = props.children;
  if (React.Children.count(props.children) > 1) {
    const arrayChildren = React.Children.toArray(props.children).filter(
      (child) => !isValidElement(child) || (child.type !== LinkPreview && child.type !== LinkMenu)
    );
    children = arrayChildren.length === 1 ? arrayChildren[0] : props.children;
  }

  return (
    <ZoomTransitionWrapper>
      <BaseExpoRouterLink {...props} href={href} children={children} />
    </ZoomTransitionWrapper>
  );
}

function isLinkWithPreview(props: LinkProps): boolean {
  const isExternal = shouldLinkExternally(String(props.href));
  return Children.toArray(props.children).some(
    (child) =>
      isValidElement(child) &&
      ((!isExternal && child.type === LinkPreview) || child.type === LinkMenu)
  );
}

export function LinkZoomTransitionTarget({ children }: PropsWithChildren) {
  const { identifier } = use(ZoomContext);
  if (Children.count(children) > 1) {
    console.warn(
      '[expo-router] Link.ZoomTransitionTarget only accepts a single child component. Please wrap multiple children in a View or another container component.'
    );
    return null;
  }
  if (!identifier) {
    return children;
  }
  return (
    <ZoomTransitionSourceAlignmentRectProvider identifier={identifier}>
      {children}
    </ZoomTransitionSourceAlignmentRectProvider>
  );
}

export function LinkZoomTransitionSourceWrapper({ children }: PropsWithChildren) {
  if (!isZoomTransitionEnabled()) {
    return children;
  }
  const value = use(ZoomSourceContext);
  if (!value) {
    throw new Error(
      '[expo-router] Link.ZoomTransitionSource must be used within a Link component with unstable_transition="zoom" and unstable_customTransitionSource={true}.'
    );
  }
  const { identifier, alignment } = value;
  console.log('Link.ZoomTransitionSourceWrapper rendering with identifier:', identifier);
  if (Children.count(children) > 1) {
    console.warn(
      '[expo-router] Link.ZoomTransitionSource only accepts a single child component. Please wrap multiple children in a View or another container component.'
    );
    return null;
  }

  return (
    <LinkZoomTransitionSource identifier={identifier} alignment={alignment}>
      {children}
    </LinkZoomTransitionSource>
  );
}
