import Header from "@/components/layout/Header";
import Hero from "@/components/landing/Hero";
import Facilities from "@/components/landing/Facilities";
import AboutUs from "@/components/landing/AboutUs";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-body">
      <Header />
      <Hero />
      <Facilities />
      <AboutUs />

      {/* Footer to be added later or copied if simple */}
      <footer className="footer py-8 text-center text-text-muted text-sm border-t border-border mt-10">
        <p>&copy; {new Date().getFullYear()} UEP Event Booking System. All rights reserved.</p>
      </footer>
    </main>
  );
}
