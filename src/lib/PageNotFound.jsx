import { useLocation } from 'react-router-dom';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Home, RotateCcw, Sparkles } from 'lucide-react';


export default function PageNotFound({}) {
    const { isRTL } = useLanguage();
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await api.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10">
            <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
                <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl md:p-12">
                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-900/40">
                        <Sparkles className="h-7 w-7" />
                    </div>

                    <div className="text-center">
                        <p className="mb-2 text-sm tracking-[0.3em] text-slate-400">ERROR</p>
                        <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-7xl font-black text-transparent md:text-8xl">
                            404
                        </h1>
                        <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                            {isRTL ? 'الصفحة غير موجودة' : 'Page Not Found'}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-slate-300 leading-relaxed">
                            {isRTL
                                ? <>لم نتمكن من العثور على المسار <span className="rounded bg-white/10 px-2 py-1 font-mono text-slate-100">/{pageName || ''}</span>. ربما تم نقله أو حذفه.</>
                                : <>We couldn&apos;t find <span className="rounded bg-white/10 px-2 py-1 font-mono text-slate-100">/{pageName || ''}</span>. It may have been moved or deleted.</>}
                        </p>
                    </div>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-left">
                            <p className="text-sm font-semibold text-amber-200">{isRTL ? 'ملاحظة للمشرف' : 'Admin Note'}</p>
                            <p className="mt-1 text-sm text-amber-100/90">
                                {isRTL
                                    ? 'قد يعني هذا أن الصفحة لم يتم تنفيذها بعد. اطلب تنفيذها عبر المحادثة.'
                                    : "This may mean the page hasn't been implemented yet. Ask the AI to build it in chat."}
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:opacity-95"
                        >
                            <Home className="h-4 w-4" />
                            {isRTL ? 'العودة للرئيسية' : 'Go Home'}
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {isRTL ? 'رجوع' : 'Go Back'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}