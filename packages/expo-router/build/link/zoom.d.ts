import { type PropsWithChildren } from 'react';
import type { LinkProps } from './useLinkHooks';
export declare const ZoomContext: import("react").Context<{
    identifier: string | null;
}>;
export declare const ZoomSourceContext: import("react").Context<{
    identifier: string;
    alignment: LinkProps["unstable_transitionAlignmentRect"];
} | undefined>;
export declare function ZoomContextProvider({ route, children }: PropsWithChildren<{
    route: unknown;
}>): string | number | bigint | boolean | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
//# sourceMappingURL=zoom.d.ts.map