import MyComponent from "@/components/my-component";
import { ProgressBar, ProgressBarProvider } from "react-transition-progress";
import { Link } from "react-transition-progress/next";

export default function Home() {
  return (
    <>
      <div className="m-10">
        <h1 className="mb-2 text-4xl font-semibold">Home page</h1>
        <Link href="/slow">Go to artificially slow page</Link>
      </div>
      <div className="m-10">
        <h2 className="mb-2 text-2xl font-semibold">Client Component that calls slow action</h2>
        <MyComponent />
      </div>

      <div className="m-10">
        <ProgressBarProvider>
          <h2 className="mb-2 pb-1 text-2xl font-semibold relative">Nested loading bar

            {/* I.e. using Tailwind CSS to show the progress bar with custom styling */}
            <ProgressBar className="absolute h-1 shadow-lg shadow-sky-500/20 bg-sky-500 bottom-0" />
          </h2>
          <MyComponent />
        </ProgressBarProvider>
      </div>
    </>
  );
}