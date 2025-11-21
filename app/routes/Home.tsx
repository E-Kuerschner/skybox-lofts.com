import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Two Column Layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Column - Image */}
        <div className="relative w-full md:w-1/2 h-[40vh] md:h-auto">
          <picture>
            <source type="image/webp" srcSet="/banner.webp" />
            <img
              src="/banner.jpg"
              alt="Skybox Lofts"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
        </div>

        {/* Right Column - Content */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col">
          <main className="flex flex-col justify-center w-full px-8 md:px-12 lg:px-16 py-12 md:py-16 grow">
            <div className="max-w-xl mx-auto space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                Welcome to Skybox Lofts!
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to the Skybox Lofts Condominium Association's website.
                We are a proud, privately managed building located north of
                Wrigley Field in Lakeview, Chicago. Residents can use this site
                to access information such as our rules & regulations
                documentation, prior board meeting notes and other helpful FAQs.
              </p>

              <div className="mt-4">
                <Button
                  asChild
                  variant="cta"
                  size="lg"
                  className="px-8 py-6 text-lg mt-4"
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
          </main>
          {/* Footer */}
          <footer className="text-center text-muted-foreground border-t py-3">
            <div className="space-y-2">
              <p className="font-semibold">Skybox Lofts</p>
              <p>920 W Sheridan Rd, Chicago, IL 60613</p>
              <p>
                <a href="https://skybox-lofts.com" className="link">
                  skybox-lofts.com
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
