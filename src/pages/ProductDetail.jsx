import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, ChevronRight, Minus, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/shared/LanguageContext';

const normalizeProduct = (p) => ({
  ...p,
  image_url: p.main_image,
  name_en: p.name,
  description_en: p.description,
  original_price: p.sale_price ? p.price : null,
  price: p.sale_price ?? p.price,
  discount_percentage: p.sale_price
    ? Math.round(((p.price - p.sale_price) / p.price) * 100)
    : 0,
});

export default function ProductDetail() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const { lang, isRTL } = useLanguage();
  const language = lang;
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Try fetching from Supabase
  const { data: dbProduct } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error || !data) return null;
      return normalizeProduct(data);
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });

  // Fallback to static data
  const staticProduct = productsData.find((p) => p.id === productId);
  const product = dbProduct || staticProduct;

  const category = productCategories.find((c) => c.value === product?.category);

  // Related products (same category, exclude current)
  const relatedProducts = productsData
    .filter((p) => p.category === product?.category && p.id !== productId)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl text-slate-600 dark:text-slate-400">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </p>
          <Button onClick={() => navigate('/Products')} variant="outline">
            {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-20">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 mb-10">
          <Link to="/" className="hover:text-teal-600 transition-colors">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link to="/Products" className="hover:text-teal-600 transition-colors">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <Link
                to={`/Products?category=${category.value}`}
                className="hover:text-teal-600 transition-colors"
              >
                {language === 'ar' ? category.label_ar : category.label_en}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-900 dark:text-white font-medium line-clamp-1">
            {language === 'ar' ? product.name_ar : product.name_en}
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">

          {/* Product Image */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 aspect-square shadow-xl">
            <img
              src={product.image_url}
              alt={language === 'ar' ? product.name_ar : product.name_en}
              className="w-full h-full object-contain"
            />
            {product.discount_percentage > 0 && (
              <div className="absolute top-5 ltr:right-5 rtl:left-5 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                -{product.discount_percentage}%
              </div>
            )}
            {product.is_customizable && (
              <div className="absolute top-5 ltr:left-5 rtl:right-5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow">
                {language === 'ar' ? 'قابل للتخصيص' : 'Customizable'}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-6">

            {/* Category badge */}
            {category && (
              <Link
                to={`/Products?category=${category.value}`}
                className="inline-flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-sm font-semibold hover:underline w-fit"
              >
                <span>{category.icon}</span>
                {language === 'ar' ? category.label_ar : category.label_en}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-snug">
              {language === 'ar' ? product.name_ar : product.name_en}
            </h1>

            {/* Description */}
            {(product.description_ar || product.description_en) && (
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                {language === 'ar' ? product.description_ar : product.description_en}
              </p>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">
                {product.price}
                <span className="text-xl font-semibold ml-1">
                  {language === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </span>
              {product.original_price && (
                <span className="text-xl text-slate-400 line-through">
                  {product.original_price} {language === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold">
                  {language === 'ar'
                    ? `وفر ${product.discount_percentage}%`
                    : `Save ${product.discount_percentage}%`}
                </span>
              )}
            </div>

            {/* Features */}
            {(product.features_en?.length || product.features_ar?.length) ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  {language === 'ar' ? 'المميزات' : 'Features'}
                </p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {(language === 'ar' ? product.features_ar : product.features_en)?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Quantity selector + Add to cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-3 font-bold text-lg min-w-[3.5rem] text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full h-12 text-base font-semibold shadow-lg shadow-teal-500/20 transition-all"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    {language === 'ar' ? 'تمت الإضافة!' : 'Added to Cart!'}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    {language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
              </h2>
              {category && (
                <Link
                  to={`/Products?category=${category.value}`}
                  className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline flex items-center gap-1"
                >
                  {language === 'ar' ? 'عرض الكل' : 'View all'}
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Link>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/ProductDetail?id=${p.id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <img
                      src={p.image_url}
                      alt={language === 'ar' ? p.name_ar : p.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {p.discount_percentage > 0 && (
                      <div className="absolute top-2 ltr:right-2 rtl:left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        -{p.discount_percentage}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2">
                      {language === 'ar' ? p.name_ar : p.name_en}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600 dark:text-teal-400 font-bold">
                        {p.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                      </span>
                      {p.original_price && (
                        <span className="text-xs text-slate-400 line-through">
                          {p.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
