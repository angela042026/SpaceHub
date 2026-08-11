import { Head } from '@inertiajs/react';

import Navbar from '@/Components/Landing/Navbar';
import HeroSection from '@/Components/Landing/HeroSection';
import FeaturesSection from '@/Components/Landing/FeaturesSection';
import HowItWorksSection from '@/Components/Landing/HowItWorksSection';
import SpacesCarousel from '@/Components/Landing/SpacesCarousel';
import TestimonialsSection from '@/Components/Landing/TestimonialsSection';
import BenefitsSection from '@/Components/Landing/BenefitsSection';
import PricingSection from '@/Components/Landing/PricingSection';
import Footer from '@/Components/Landing/Footer';
import CookieBanner from '@/Components/CookieBanner';
import LeftFloatingActions from '@/Components/LeftFloatingActions';
import ChatWidget from '@/Components/Chat/ChatWidget';

export default function Welcome() {
    return (
        <>
            <Head title="" />

            <div className="min-h-screen bg-white text-slate-900">
                <Navbar />

                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <SpacesCarousel />
                    <PricingSection />
                    <BenefitsSection />
                    <TestimonialsSection />
                </main>

                <Footer />

                <CookieBanner />
                <LeftFloatingActions />
                <ChatWidget />
            </div>
        </>
    );
}
