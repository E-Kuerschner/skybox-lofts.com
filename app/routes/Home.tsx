import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ContentCard } from "~/components/ContentCard";
import pennantLogoGreen from "../components/pennant-logo-green.svg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-neutral-50 flex flex-col">
      {/* Header with Banner & Logo */}
      <header className="relative w-full h-[350px] md:h-[400px] mb-[50px]">
        <img
          src="/banner.jpg"
          alt="Skybox Lofts"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-100/30" />
        {/* Decorative horizontal line */}
        <div className="relative shadow-md">
          <div className="h-6 bg-[#324E3D]" />
          <div className="h-2 bg-[#FFF5D2]" />
        </div>
        <img
          src={pennantLogoGreen}
          alt="Skybox Lofts Logo"
          className="h-[200px] md:h-[275px] drop-shadow-2xl absolute top-0 md:top-0 left-1/2 -translate-x-1/2"
        />
      </header>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-grow">
        <ContentCard>
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
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
                variant="cta"
                size="lg"
                className="px-8 py-6 text-lg"
              >
                <Link to="/resident">
                  Resident Info
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Only registered residents can access the next page
              </p>
            </div>
          </div>
        </ContentCard>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-muted-foreground">
        <div className="space-y-2">
          <p className="font-semibold">Skybox Lofts</p>
          <p>920 W Sheridan Rd, Chicago, IL 60613</p>
          <p>
            <a
              href="https://skybox-lofts.com"
              className="text-emerald-600 hover:underline"
            >
              skybox-lofts.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
