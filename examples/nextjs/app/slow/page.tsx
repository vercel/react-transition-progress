import { Link } from "react-transition-progress/next";

export default async function SlowPage() {
    // Introduces artificial slowdown
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return (
        <div className="m-10">
            <h1 className="mb-2 text-4xl font-semibold">Slow page, artificially slowed by 2 seconds</h1>
            <Link href="/">Go to home page</Link>
        </div>
    );
}