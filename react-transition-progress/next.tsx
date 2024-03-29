"use client"
import { useRouter } from "next/navigation";
import { useProgress } from ".";
import NextLink from "next/link";

export function Link({
    href,
    children,
    replace,
    ...rest
}: Parameters<typeof NextLink>[0]) {
    const router = useRouter();
    const routerPush = useProgress(router.push)
    const routerReplace = useProgress(router.replace)

    return (
        <NextLink
            href={href}
            onClick={(e) => {
                e.preventDefault();
                const url = href.toString()
                if (replace) {
                    routerReplace(url)
                } else {
                    routerPush(url)
                }

            }}
            {...rest}
        >
            {children}
        </NextLink>
    );
}