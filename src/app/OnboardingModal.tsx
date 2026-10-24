import React from 'react';
import { Button } from './components/Button';
import { HeartHandshake, Lock, ArrowRight } from 'lucide-react';

export interface OnboardingModalProps {
  language: 'en' | 'hi';
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  onComplete
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.25rem] p-6 sm:p-8 shadow-card border border-[#F3E8EE] space-y-6 animate-scale-up relative overflow-hidden">
        {/* Soft background aura */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-tint-peach/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-tint-lavender/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Floral Brand Emblem */}
        <div className="text-center pt-2 relative z-10">
          <div className="w-16 h-16 bg-tint-rose text-primary rounded-full mx-auto flex items-center justify-center mb-4 shadow-pill border border-[#F8DDE5]">
            <span className="text-2xl animate-pulse-subtle">🌸</span>
          </div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-primary bg-tint-lavender/80 px-3 py-1 rounded-full border border-[#E7DCF8] mb-2">
            Cyculus · 100% On-Device
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
            {language === 'hi' ? 'साइकुलस में आपका स्वागत है' : 'Welcome to Cyculus'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-1.5 font-sans leading-relaxed">
            {language === 'hi'
              ? 'आपकी निजी, सुरक्षित मासिक चक्र डायरी एवं क्लिनिकल चिट्ठी'
              : 'Your private, phone-first cycle diary & doctor-ready brief'}
          </p>
        </div>

        {/* 3 Core Guarantees with Pastel Card Accents */}
        <div className="space-y-3 relative z-10">
          <div className="p-3.5 bg-tint-mint/40 rounded-2xl flex items-start gap-3 border border-[#D8F0E4]">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-ink">
                {language === 'hi' ? 'आपका डेटा केवल आपके फ़ोन पर रहता है' : 'Your data never leaves your phone'}
              </h4>
              <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'कोई खाता नहीं, कोई क्लाउड सिंक नहीं। सभी प्रविष्टियाँ ब्राउज़र IndexedDB में सुरक्षित रहती हैं।'
                  : 'Zero cloud database. No login needed. Everything stays in your browser IndexedDB.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-tint-lavender/40 rounded-2xl flex items-start gap-3 border border-[#E7DCF8]">
            <div className="p-2 bg-primary-soft text-primary rounded-xl shrink-0 mt-0.5">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-ink">
                {language === 'hi' ? 'डॉक्टर के लिए तथ्य-आधारित चिट्ठी' : 'Facts ready for your clinician'}
              </h4>
              <p className="text-[11px] sm:text-xs text-ink-muted mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'हिंग्लिश या सामान्य शब्दों में बोलें। क्लिनिक में दिखाने हेतु 1-पेज पीडीएफ चिट्ठी तैयार करें।'
                  : 'Log symptoms in your own words. Generate a clear 1-page PDF for medical appointments.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-tint-peach/40 rounded-2xl flex items-start gap-3 border border-[#FADCD0]">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0 mt-0.5 font-bold text-xs">
              🌿
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-amber-950">
                {language === 'hi' ? 'चिकित्सकीय अस्वीकरण (Disclaimer)' : 'Non-Diagnostic Wellness Tool'}
              </h4>
              <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'यह ऐप कोई रोग निदान नहीं करता। यह केवल आपके चक्र के रुझान समझने और डॉक्टर से सवाल पूछने में सहायक है।'
                  : 'Cyculus identifies clinical standards (FIGO/ACOG) to help you discuss patterns with your doctor.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2 relative z-10">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={onComplete}
            className="shadow-soft hover:shadow-card font-medium tracking-wide"
          >
            {language === 'hi' ? 'शुरू करें (Get Started)' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  );
};
