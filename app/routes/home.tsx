import type { Route } from "./+types/home";
import { Link } from "react-router";
import { WrigleyFieldSignLogo } from "../components/WrigleyFieldSignLogo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SkyBox Lofts" },
    { name: "description", content: "Welcome to SkyBox Lofts" },
  ];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen pt-16 pb-4">
      <div className="flex flex-col items-center gap-16">
        <div className="w-[600px] max-w-[90vw]">
          <WrigleyFieldSignLogo />
        </div>
        <div className="text-center">
          <Link
            to="/resident"
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
          >
            Resident Access
          </Link>
        </div>
      </div>
    </main>
  );
}
