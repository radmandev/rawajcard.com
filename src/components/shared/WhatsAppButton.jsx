import React, { useState } from 'react';
import { X, Send, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

const WHATSAPP_NUMBER = '+966531607223';

const i18n = {
  en: {
    title: 'RawajCard Support',
    subtitle: 'Typically replies instantly',
    greeting: '👋 Hi there! How can we help you today?',
    team: 'Support Team',
    placeholder: 'Type your message…',
    hint: 'Opens WhatsApp to continue the conversation',
    aria: 'Chat on WhatsApp',
    defaultMsg: 'Hello! I need help with RawajCard. 👋',
  },
  ar: {
    title: 'دعم رواج كارد',
    subtitle: 'يرد عادةً بشكل فوري',
    greeting: '👋 أهلاً! كيف يمكننا مساعدتك اليوم؟',
    team: 'فريق الدعم',
    placeholder: 'اكتب رسالتك…',
    hint: 'سيفتح واتساب لمتابعة المحادثة',
    aria: 'تواصل عبر واتساب',
    defaultMsg: 'مرحباً! أحتاج مساعدة في رواج كارد. 👋',
  },
};

const WA_ICON = (
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
);

export default function WhatsAppButton() {
  const { lang, isRTL } = useLanguage();
  const tx = i18n[lang] || i18n.en;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Keep message in sync with language when it hasn't been manually edited
  const currentDefault = tx.defaultMsg;

  const handleSend = () => {
    const text = message.trim() || currentDefault;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setMessage(currentDefault);
    setOpen(true);
  };

  // position: always bottom-right; dialog flips text direction per language
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed bottom-6 z-50 flex flex-col gap-3 ${isRTL ? 'left-6 items-start' : 'right-6 items-end'}`}>

        {/* Dialog card */}
        {open && (
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{ background: '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#25D366' }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">{WA_ICON}</svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{tx.title}</p>
                <p className="text-green-100 text-xs">{tx.subtitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat bubble */}
            <div className="px-4 py-4" style={{ background: '#e5ddd5' }}>
              <div
                className={`bg-white px-4 py-3 shadow-sm max-w-[85%] ${
                  isRTL ? 'rounded-2xl rounded-tr-none mr-auto' : 'rounded-2xl rounded-tl-none'
                }`}
              >
                <p className="text-gray-700 text-sm leading-relaxed">{tx.greeting}</p>
                <p className={`text-gray-400 text-[10px] mt-1 ${isRTL ? 'text-left' : 'text-right'}`}>
                  {tx.team}
                </p>
              </div>
            </div>

            {/* Message input */}
            <div className="px-3 py-3 bg-white border-t border-gray-100">
              <div className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  placeholder={tx.placeholder}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
                  style={{ maxHeight: '96px' }}
                />
                <button
                  onClick={handleSend}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-md"
                  style={{ background: '#25D366' }}
                  title={tx.aria}
                >
                  <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <p className="text-center text-gray-400 text-[10px] mt-2">{tx.hint}</p>
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={open ? () => setOpen(false) : handleOpen}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 hover:scale-105 focus:outline-none"
          style={{ background: '#25D366' }}
          aria-label={tx.aria}
        >
          {open ? (
            <ChevronDown className="w-6 h-6 text-white" />
          ) : (
            <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">{WA_ICON}</svg>
          )}
        </button>
      </div>
    </>
  );
}
