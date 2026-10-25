import { useState } from 'react';
import type { LogStore } from '../../shared/types';

export interface PrivacyScreenProps {
  store: LogStore;
  language: 'en' | 'hi';
}

export function PrivacyScreen({ store, language }: PrivacyScreenProps) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const hi = language === 'hi';

  const handleExport = async () => {
    try {
      const json = await store.exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cyculus-data.json';
      link.click();
      URL.revokeObjectURL(url);
      setMessage(hi ? 'आपका डेटा डाउनलोड हो गया।' : 'Your data was downloaded.');
    } catch {
      setMessage(hi ? 'एक्सपोर्ट विफल रहा। फिर से कोशिश करें।' : 'Export failed. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await store.deleteAll();
      setConfirming(false);
      setMessage(hi ? 'सारा डेटा मिटा दिया गया है।' : 'All your data has been deleted.');
    } catch {
      setMessage(hi ? 'मिटाने में समस्या हुई। फिर से कोशिश करें।' : 'Delete failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <h2 className="text-2xl font-bold text-ink">
        {hi ? 'गोपनीयता और डेटा' : 'Privacy and your data'}
      </h2>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-ink">{hi ? 'आपका डेटा कहाँ है' : 'Where your data is stored'}</h3>
        <p className="mt-2 text-sm text-ink leading-relaxed">
          {hi
            ? 'आपके लॉग सिर्फ इसी फोन में सेव रहते हैं। जब आप कोई नोट समझने के लिए लिखती हैं, तो वह सुरक्षित रूप से प्रोसेस होने जाता है और हमारे पास सेव नहीं होता।'
            : 'Your logs are saved only on this phone. When you type a note for the app to understand, that text is sent securely for processing and is not stored by us.'}
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-ink">{hi ? 'डेटा निर्यात करें' : 'Export your data'}</h3>
        <p className="mt-2 text-sm text-ink">
          {hi ? 'सारे लॉग एक JSON फ़ाइल में डाउनलोड करें।' : 'Download all your logs as one JSON file.'}
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="mt-4 min-h-[44px] rounded-full bg-primary px-5 text-sm font-semibold text-white"
        >
          {hi ? 'JSON डाउनलोड करें' : 'Download JSON'}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-ink">{hi ? 'सारा डेटा मिटाएँ' : 'Delete everything'}</h3>
        <p className="mt-2 text-sm text-ink">
          {hi
            ? 'यह सारे लॉग स्थायी रूप से मिटा देगा। इसे वापस नहीं लाया जा सकता।'
            : 'This permanently removes all your logs from this phone. It cannot be undone.'}
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 min-h-[44px] rounded-full border border-primary px-5 text-sm font-semibold text-primary"
          >
            {hi ? 'सारा डेटा मिटाएँ' : 'Delete all data'}
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="min-h-[44px] rounded-full bg-red-600 px-5 text-sm font-semibold text-white"
            >
              {hi ? 'हाँ, सब मिटाएँ' : 'Yes, delete everything'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-[44px] rounded-full bg-primary-soft px-5 text-sm font-semibold text-ink"
            >
              {hi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        )}
      </section>

      {message && (
        <p role="status" className="text-sm font-semibold text-primary">
          {message}
        </p>
      )}
    </div>
  );
}