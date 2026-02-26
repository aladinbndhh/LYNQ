import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              LynQ
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Pricing
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
    </>
  );
}
