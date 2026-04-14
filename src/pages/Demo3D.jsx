import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export default function Demo3D() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <main className="public-subpage-offset flex-1 flex flex-col">
        <div className="container mx-auto px-4 pb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Experience Our 3D Showroom
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Explore our interactive 3D demo room. Navigate freely to discover our products and space in full detail.
          </p>
        </div>
        <div className="w-full flex-1 px-4 pb-10" style={{ minHeight: '75vh' }}>
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700" style={{ minHeight: '75vh' }}>
            <iframe
              src="https://emadssms.shapespark.com/demo-room/"
              title="3D Demo Room"
              allowFullScreen
              allow="fullscreen; xr-spatial-tracking"
              className="w-full h-full border-0"
              style={{ minHeight: '75vh' }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
