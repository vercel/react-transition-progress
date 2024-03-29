import { Link } from "@/react-transition-progress/next";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link href="/slow">Go to slow page</Link>
    </div>
  );
}
