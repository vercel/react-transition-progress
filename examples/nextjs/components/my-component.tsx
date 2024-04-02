"use client";
import { useState, useTransition } from "react";
import { useProgress } from "react-transition-progress";

export default function MyComponent() {
    const [_isPending, startTransition] = useTransition();
    const startProgress = useProgress();
    const [count, setCount] = useState(0);
    return (
        <>
            <p className="mb-4">Current count: <span className="font-bold">{count}</span></p>
            <button
                onClick={() => {
                    startTransition(async () => {
                        startProgress();
                        // Introduces artificial slowdown
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        setCount((count) => count + 1);
                    });
                }}
            >
                Trigger artificially slow transition
            </button>
        </>
    );
}