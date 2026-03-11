import Link from 'next/link';
import { MobileDashboard } from '@/components/mobile/dashboard-stats';

export default function MobilePreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Mobile App Preview</h2>
          <p className="text-muted-foreground">See how your dashboard looks on mobile devices</p>
        </div>

        {/* Mobile Frame */}
        <div className="bg-card rounded-xl border border-border p-8 max-w-md mx-auto">
          <div className="border-4 border-border rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="bg-secondary h-8 flex items-center justify-center">
              <div className="w-32 h-6 bg-background rounded-b-3xl"></div>
            </div>
            <div className="bg-background overflow-y-auto" style={{ height: '667px' }}>
              <MobileDashboard />
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Mobile App Interface Preview
          </div>
        </div>

        {/* Feature Callout */}
        <div className="mt-8 max-w-md mx-auto bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">📱</div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Mobile-First Design</h3>
              <p className="text-sm text-muted-foreground">
                LynQ is designed with a mobile-first approach, ensuring a seamless experience
                across all devices. The company logo badge feature works perfectly on both
                mobile and desktop views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
