import React from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { ShieldCheck, HeartHandshake, Lock, ArrowRight } from 'lucide-react';

export interface OnboardingModalProps {
  language: 'en' | 'hi';
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  language,
  onComplete
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-fade-in">
      <Card variant="default" padding="lg" className="w-full max-w-md shadow-2xl border-primary/20 space-y-5 animate-scale-up">
        {/* Header with App Brand */}
        <div className="text-center pt-2">
          <div className="w-14 h-14 bg-primary-soft text-primary rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-soft">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            {language === 'hi' ? 'साइकुलस (Cyculus) में आपका स्वागत है' : 'Welcome to Cyculus'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {language === 'hi'
              ? 'प्राइवेट, ऑन-डिवाइस पीरियड और लक्षण ट्रैकर'
              : 'Private, phone-first cycle tracker & doctor brief'}
          </p>
        </div>

        {/* 3 Core Guarantees */}
        <div className="space-y-3">
          <div className="p-3.5 bg-surface-subtle rounded-2xl flex items-start gap-3 border border-surface-border">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-ink">
                {language === 'hi' ? 'आपका डेटा केवल आपके फ़ोन पर रहता है' : 'Your data never leaves your phone'}
              </h4>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'कोई खाता नहीं, कोई क्लाउड सिंक नहीं। सभी रिकॉर्ड आपके ब्राउज़र IndexedDB में सुरक्षित रहते हैं।'
                  : 'No account required, no cloud database. Everything is saved locally in your device storage.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-surface-subtle rounded-2xl flex items-start gap-3 border border-surface-border">
            <div className="p-2 bg-primary-soft text-primary rounded-xl shrink-0 mt-0.5">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-ink">
                {language === 'hi' ? 'डॉक्टर के लिए तथ्य-आधारित सारांश' : 'Facts ready for your clinician'}
              </h4>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'हिंग्लिश या सामान्य बोलचाल में दर्ज करें, और क्लिनिक में दिखाने हेतु 1-पेज पीडीएफ रिपोर्ट तैयार करें।'
                  : 'Log in your own words. Generate a concise, factual 1-page PDF for your next medical visit.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-200">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5 font-bold text-xs">
              ⚠️
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-amber-950">
                {language === 'hi' ? 'चिकित्सकीय अस्वीकरण (Disclaimer)' : 'Non-Diagnostic Disclaimer'}
              </h4>
              <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                {language === 'hi'
                  ? 'यह ऐप कोई रोग निदान या दवा की सलाह नहीं देता। यह केवल आपके चक्र के रुझान समझने और डॉक्टर से सवाल पूछने में सहायक है।'
                  : 'Cyculus is not a medical device and never diagnoses. It identifies cited patterns to empower productive doctor conversations.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={onComplete}
          >
            {language === 'hi' ? 'शुरू करें (Get Started)' : 'Get Started'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
