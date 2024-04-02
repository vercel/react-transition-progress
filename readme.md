# react-transition-progress

Show a progress bar while a React transition is in progress.

[Visit the demo](https://react-transition-progress.vercel.app/).

## Installation

```bash
npm install react-transition-progress framer-motion
```

The main package `react-transition-progress` exports three APIs: `ProgressBarProvider`, `ProgressBar`, and `useProgress`.

- `ProgressBarProvider` provides the state and context for `ProgressBar` and `useProgress`
- `ProgressBar` is the displayed progressbar
- `useProgress` is the way you start/finish the progressbar

There is also Next.js specific helper for `next/link` in `react-transition-progress/next`:

- `Link` is a wrapper for `next/link` that is instrumented to show the `ProgressBar`

For example integrating into the Next.js App Router:

```tsx
// app/layout.tsx
import { ProgressBar, ProgressBarProvider } from "react-transition-progress";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ProgressBarProvider>
          {/* I.e. using Tailwind CSS to show the progress bar with custom styling */}
          <ProgressBar className="fixed h-1 shadow-lg shadow-sky-500/20 bg-sky-500 top-0" />
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
```

Using `useProgress` to show the `ProgressBar` when the [React transition](https://react.dev/reference/react/useTransition#starttransition) runs:

```tsx
// components/my-component.tsx
"use client";
import { useState, startTransition } from "react";
import { useProgress } from "react-transition-progress";

export default function MyComponent() {
  const startProgress = useProgress();
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>Current count: {count}</h1>
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
        Trigger transition
      </button>
    </>
  );
}
```

Using Next.js helper for `Link` to show the progress bar for `next/link`:

```tsx
// app/page.tsx
import { Link } from "react-transition-progress/next";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/about">Go to about page</Link>
    </div>
  );
}
```

## Contributing

See the [Contributing Guide](./contributing.md).

## Authors

- Tim Neutkens ([@timneutkens](https://twitter.com/timneutkens))
- Sam Selikoff ([@samselikoff](https://twitter.com/samselikoff))
- Ryan Toronto ([@ryantotweets](https://twitter.com/ryantotweets))

### History

This package is an improved version of [the demo](https://buildui.com/posts/global-progress-in-nextjs) shown in Sam & Ryan's [article on Build UI](https://buildui.com/posts/global-progress-in-nextjs). It leverages [React's `useOptimistic`](https://react.dev/reference/react/useOptimistic) to track [React Transitions](https://react.dev/reference/react/useTransition).
