"use client";
import React from 'react'
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
    useContext,
    useEffect,
    // @ts-ignore This export exists on react@canary
    useOptimistic,
    useRef,
    startTransition,
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

/**
 * Custom hook for managing progress state and animation.
 * @param startDelay - The delay (in milliseconds) before the progress bar animation starts. Defaults to 0ms.
 * @returns An object containing the current state, spring animation, and functions to start and complete the progress.
 */
export function useProgressInternal(startDelay: number = 0) {
    const [loading, setLoading] = useOptimistic(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isCompletedRef = useRef(false);

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
        loading ? 750 : null
    );

    useEffect(() => {
        if (!loading) {
            spring.jump(0);
        }
    }, [spring, loading]);

    /**
     * Start the progress.
     */
    function start() {
        // Clear any existing timeout and reset completion state
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        isCompletedRef.current = false;

        if (startDelay > 0) {
            timeoutRef.current = setTimeout(() => {
                // Only start if we haven't been completed in the meantime
                if (!isCompletedRef.current) {
                    startTransition(() => {
                        setLoading(true);
                    });
                    spring.jump(0);
                }
                timeoutRef.current = null;
            }, startDelay);
        } else {
            startTransition(() => {
                setLoading(true);
            });
            spring.jump(0);
        }
    }

    /**
     * Complete the progress and clear any pending start timeout.
     */
    function complete() {
        // Clear pending timeout to prevent delayed start
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        isCompletedRef.current = true;
        startTransition(() => {
            setLoading(false);
        });
    }

    return { loading, spring, start, complete };
}


/**
 * Custom hook that sets up an interval to call the provided callback function.
 *
 * @param callback - The function to be called at each interval.
 * @param delay - The delay (in milliseconds) between each interval. Pass `null` to stop the interval.
 */
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

/**
 * Provides the progress value to the child components.
 *
 * @param children - The child components to render.
 * @param startDelay - The delay (in milliseconds) before the progress bar animation starts. Defaults to 0ms.
 * @returns The rendered ProgressBarContext.Provider component.
 */
export function ProgressBarProvider({ 
    children, 
    startDelay = 0 
}: { 
    children: ReactNode;
    startDelay?: number;
}) {
    const progress = useProgressInternal(startDelay);
    return <ProgressBarContext.Provider value={progress}>{children}</ProgressBarContext.Provider>;
}

/**
 * Renders a progress bar component.
 *
 * @param className - The CSS class name for the progress bar.
 * @returns The rendered progress bar component.
 */
export function ProgressBar({
    className,
}: {
    className: string;
}) {
    const progress = useProgressBarContext();
    const width = useMotionTemplate`${progress.spring}%`;

    return (
        <LazyMotion features={domAnimation}>
            {progress.loading && (
                <m.div
                    style={{ width }}
                    exit={{ opacity: 0 }}
                    className={className}
                />
            )}
        </LazyMotion>
    );
}

type ProgressControls = {
    start: () => void;
    complete: () => void;
};

/**
 * A custom hook that returns functions to control the progress. Call the start function in a transition to track it, and call complete when the operation finishes.
 *
 * @returns An object with start and complete functions to control the progress.
 */
export function useProgress(): ProgressControls {
    const progress = useProgressBarContext();

    const startProgress = () => {
        progress.start();
    };

    const completeProgress = () => {
        progress.complete();
    };

    return { start: startProgress, complete: completeProgress };
}
