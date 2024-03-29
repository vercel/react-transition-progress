"use client";
import {
    useMotionTemplate,
    useSpring,
    m,
    LazyMotion,
    domAnimation,
} from "framer-motion";
import {
    ReactNode,
    createContext,
    startTransition,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

/**
 * Internal context for the progress bar.
 */
const ProgressBarContext = createContext<ReturnType<typeof useProgressInternal> | null>(
    null
);

/**
 * Reads the progress bar context.
 */
function useProgressBarContext() {
    const progress = useContext(ProgressBarContext);

    if (progress === null) {
        throw new Error("Need to be inside provider");
    }

    return progress;
}

const INITIAL = 'a' as const
const IN_PROGRESS = 'b' as const
const COMPLETING = 'c' as const
const COMPLETE = 'd' as const

function getDiff(current: number) {
    let diff;
    if (current === 0) {
        diff = 15;
    } else if (current < 50) {
        diff = rand(1, 10);
    } else {
        diff = rand(1, 5);
    }

    return diff

}

export function useProgressInternal() {
    const [state, setState] = useState<
        typeof INITIAL | typeof IN_PROGRESS | typeof COMPLETING | typeof COMPLETE
    >(INITIAL);

    const value = useSpring(0, {
        damping: 25,
        mass: 0.5,
        stiffness: 300,
        restDelta: 0.1,
    });

    useInterval(
        () => {
            // If we start progress but the bar is currently complete, reset it first.
            if (value.get() === 100) {
                value.jump(0);
            }

            const current = value.get();
            value.set(Math.min(current + getDiff(current), 99));
        },
        state === IN_PROGRESS ? 750 : null
    );

    useEffect(() => {
        if (state === INITIAL) {
            value.jump(0);
        } else if (state === COMPLETING) {
            value.set(100);
        }

        return value.on("change", (latest) => {
            if (latest === 100) {
                setState(COMPLETE);
            }
        });
    }, [value, state]);

    function start() {
        setState(IN_PROGRESS);
    }

    function done() {
        setState((state) =>
            state === INITIAL || state === IN_PROGRESS ? COMPLETING : state
        );
    }

    return { state, value, start, done };
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        if (delay !== null) {
            tick();

            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export function ProgressBarProvider({ children }: { children: ReactNode }) {
    const progress = useProgressInternal()
    return <ProgressBarContext.Provider value={progress}>{children}</ProgressBarContext.Provider>;
}

export function ProgressBar({
    className,
}: {
    className?: string;
}) {
    const progress = useProgressBarContext();
    const width = useMotionTemplate`${progress.value}%`;

    return (
        <LazyMotion features={domAnimation}>
            {progress.state !== COMPLETE && (
                <m.div
                    style={{ width }}
                    exit={{ opacity: 0 }}
                    className={className}
                />
            )}
        </LazyMotion>
    );
}

export function useProgress<T extends Function>(action: T) {
    const progress = useProgressBarContext();
    function actionWithProgress(...args: any[]) {
        progress.start();

        startTransition(() => {
            progress.done();
            return action(...args)
        });
    }
    return actionWithProgress
}

