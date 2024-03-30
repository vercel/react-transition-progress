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
        throw new Error("Make sure to use `ProgressBarProvider` before using the progress bar.");
    }

    return progress;
}

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * This function calculates a difference (`diff`) based on the input number (`current`).
 * 
 * - If `current` is exactly 0, `diff` is set to 15.
 * - If `current` is less than 50 (but not 0), `diff` is set to a random number between 1 and 10.
 * - If `current` is 50 or more, `diff` is set to a random number between 1 and 5.
 */
function getDiff(
    /** The current number used to calculate the difference. */
    current: number): number {
    let diff;
    if (current === 0) {
        diff = 15;
    } else if (current < 50) {
        diff = random(1, 10);
    } else {
        diff = random(1, 5);
    }

    return diff
}

const INITIAL = 'a' as const
const IN_PROGRESS = 'b' as const
const COMPLETING = 'c' as const
const COMPLETE = 'd' as const

/**
 * Custom hook for managing progress state and animation.
 * @returns An object containing the current state, spring animation, and functions to start and complete the progress.
 */
export function useProgressInternal() {
    const [state, setState] = useState<
        typeof INITIAL | typeof IN_PROGRESS | typeof COMPLETING | typeof COMPLETE
    >(INITIAL);

    const spring = useSpring(0, {
        damping: 25,
        mass: 0.5,
        stiffness: 300,
        restDelta: 0.1,
    });

    useInterval(
        () => {
            // If we start progress but the bar is currently complete, reset it first.
            if (spring.get() === 100) {
                spring.jump(0);
            }

            const current = spring.get();
            spring.set(Math.min(current + getDiff(current), 99));
        },
        state === IN_PROGRESS ? 750 : null
    );

    useEffect(() => {
        if (state === INITIAL) {
            spring.jump(0);
        } else if (state === COMPLETING) {
            spring.set(100);
        }

        return spring.on("change", (latest) => {
            if (latest === 100) {
                setState(COMPLETE);
            }
        });
    }, [spring, state]);

    /**
     * Start the progress.
     */
    function start() {
        setState(IN_PROGRESS);
    }

    /**
     * Complete the progress.
     */
    function done() {
        setState((state) =>
            state === INITIAL || state === IN_PROGRESS ? COMPLETING : state
        );
    }

    return { state, spring, start, done };
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
    className: string;
}) {
    const progress = useProgressBarContext();
    const width = useMotionTemplate`${progress.spring}%`;

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

type StartTransition = typeof startTransition
export function useProgress(): StartTransition {
    const progress = useProgressBarContext();
    const startTransitionWithProgress: StartTransition = (fn) => {
        progress.start();

        startTransition(() => {
            progress.done();
            return fn();
        });
    }
    return startTransitionWithProgress
}

