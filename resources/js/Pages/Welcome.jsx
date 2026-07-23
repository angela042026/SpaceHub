import { Head } from '@inertiajs/react';

import Navbar from '@/Components/landing/Navbar';
import HeroSection from '@/Components/landing/HeroSection';
import FeaturesSection from '@/Components/landing/FeaturesSection';
import HowItWorksSection from '@/Components/landing/HowItWorksSection';
import SpacesCarousel from '@/Components/landing/SpacesCarousel';
import BenefitsSection from '@/Components/landing/BenefitsSection';
import PricingSection from '@/Components/landing/PricingSection';
import Footer from '@/Components/landing/Footer';
import CookieBanner from '@/Components/CookieBanner';
import ScrollToTopButton from '@/Components/ScrollToTopButton';

export default function Welcome() {
    return (
        <>
            <Head title="SpaceHub" />

            <div className="min-h-screen bg-white text-slate-900">
                <Navbar />

                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <SpacesCarousel />
                    <PricingSection />
                    <BenefitsSection />
                </main>

                <Footer />

                <CookieBanner />
                <ScrollToTopButton />
            </div>
        </>
    );
}
