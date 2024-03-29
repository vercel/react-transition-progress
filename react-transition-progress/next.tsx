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
    const startTransition = useProgress()

    return (
        <NextLink
            href={href}
            onClick={(e) => {
                e.preventDefault();
                startTransition(() => {
                    const url = href.toString()
                    if (replace) {
                        router.replace(url)
                    } else {
                        router.push(url)
                    }
                })
            }}
            {...rest}
        >
            {children}
        </NextLink>
    );
}