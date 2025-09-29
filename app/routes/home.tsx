import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import pennantLogoGreen from "../components/pennant-logo-green.svg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Skybox Lofts" },
    { name: "description", content: "Welcome to Skybox Lofts" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-neutral-50 flex flex-col">
      {/* Header with Banner & Logo */}
      <header className="relative w-full h-[400px] mb-[150px] md:mb-[200px]">
        <img
          src="/banner.jpg"
          alt="Skybox Lofts"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-100/30" />
        {/* Decorative horizontal line */}
        <div className="relative">
          <div className="h-6 bg-[#27342D]" />
          <div className="h-2 bg-[#FFF5D2]" />
        </div>
        <img
          src={pennantLogoGreen}
          alt="Skybox Lofts Logo"
          className="h-[250px] md:h-[300px] drop-shadow-2xl absolute -bottom-40 md:-bottom-50 left-1/2 -translate-x-1/2"
        />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-grow">
        <div className="bg-card rounded-2xl shadow-xl p-12 border-4 border-[#2d5016]/10 relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2d5016]/5 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-900/5 rounded-tr-full" />

          <div className="relative z-10 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Welcome to Skybox Lofts!
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Welcome to the Skybox Lofts Condominium Association's website. We
              are a proud, privately managed building located north of Wrigley
              Field in Lakeview, Chicago. Residents can use this site to access
              information such as our rules & regulations documentation, prior
              board meeting notes and other helpful FAQs.
            </p>

            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link to="/resident">Resident Info</Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Only registered residents can access this area
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-muted-foreground">
        <div className="space-y-2">
          <p className="font-semibold">Skybox Lofts</p>
          <p>920 W Sheridan Rd, Chicago, IL 60613</p>
          <p>
            <a
              href="https://skybox-lofts.com"
              className="text-[#2d5016] hover:underline"
            >
              skybox-lofts.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
