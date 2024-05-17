"use client"
import React from "react"
import { startTransition } from "react";
import NextLink from "next/link";
import { useRouter as useNextRouter } from "next/navigation";
import { useProgress } from ".";
import type {
    AppRouterInstance,
    NavigateOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Copied from  https://github.com/vercel/next.js/blob/canary/packages/next/src/client/link.tsx#L180-L191
function isModifiedEvent(event: React.MouseEvent): boolean {
    const eventTarget = event.currentTarget as HTMLAnchorElement | SVGAElement;
    const target = eventTarget.getAttribute("target");
    return (
        (target && target !== "_self") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey || // triggers resource download
        (event.nativeEvent && event.nativeEvent.which === 2)
    );
}

/**
 * A custom useRouter component that wraps Next.js's next/navigation component.
 */
export function useRouter(): AppRouterInstance {
    const nextRouter = useNextRouter();
    const startProgress = useProgress();

    const router: AppRouterInstance = {
        ...nextRouter,
        push: (href: string, options?: NavigateOptions) => {
            startTransition(() => {
                startProgress();
                nextRouter.push(href, options);
            });
        },
        replace(href: string, options?: NavigateOptions) {
            startTransition(() => {
                startProgress();
                nextRouter.replace(href, options);
            });
        },
    };
    return router;
}

/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export function Link({
    href,
    children,
    replace,
    ...rest
}: Parameters<typeof NextLink>[0]) {
    const router = useRouter();

    return (
        <NextLink
            href={href}
            onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                const url = href.toString()
                if (replace) {
                    router.replace(url)
                } else {
                    router.push(url)
                }
            }}
            {...rest}
        >
            {children}
        </NextLink>
    );
}
