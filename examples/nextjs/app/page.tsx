import MyComponent from "@/components/my-component";
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
    </>
  );
}