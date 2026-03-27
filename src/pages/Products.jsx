import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { productsData, productCategories } from '@/components/shared/productsData';
import { useCart } from '@/contexts/CartContext';
import ProductPreviewModal from '@/components/store/ProductPreviewModal';

// Map Supabase row → display shape
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
  product_name: p.name,
  product_price: p.sale_price ?? p.price,
  product_image: p.main_image,
});

// Static fallback
const staticProducts = productsData.map((p) => ({
  ...p,
  product_name: p.name_en,
  product_price: p.price,
  product_image: p.image_url,
}));

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [language, setLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [previewProduct, setPreviewProduct] = useState(null);
  const { addItem } = useCart();

  // Sync category with URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      const dir = document.documentElement.getAttribute('dir');
      setLanguage(dir === 'rtl' ? 'ar' : 'en');
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => obs.disconnect();
  }, []);

  const { data: dbProducts, isLoading } = useQuery({
    queryKey: ['products-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []).map(normalizeProduct);
    },
    staleTime: 1000 * 60 * 5,
  });

  const products = dbProducts?.length ? dbProducts : staticProducts;

  const t = {
    en: {
      title: 'Our Products', subtitle: 'Digital Solutions for Modern Business',
      addToCart: 'Add to Cart', sar: 'SAR', loading: 'Loading...',
      customizable: 'Customizable',
      cats: { all: 'All Products', business_cards: 'Business Cards', keychains: 'Keychains', stands: 'Table Stands' },
    },
    ar: {
      title: 'منتجاتنا', subtitle: 'حلول رقمية للأعمال الحديثة',
      addToCart: 'أضف للسلة', sar: 'ر.س', loading: 'جار التحميل...',
      customizable: 'قابل للتخصيص',
      cats: { all: 'جميع المنتجات', business_cards: 'بطاقات الأعمال', keychains: 'تعليقات المفاتيح', stands: 'ستاندات الطاولة' },
    },
  }[language];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const categories = [
    { value: 'all', label: t.cats.all },
    { value: 'business_cards', label: t.cats.business_cards },
    { value: 'keychains', label: t.cats.keychains },
    { value: 'stands', label: t.cats.stands },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t.subtitle}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSearchParams(cat.value === 'all' ? {} : { category: cat.value })}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-teal-600 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading && !dbProducts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/ProductDetail?id=${product.id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 cursor-pointer block"
                  onClick={(e) => {
                    // Let the Link handle navigation unless clicking Add to Cart
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
                    <img
                      src={product.image_url}
                      alt={language === 'ar' ? product.name_ar : product.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount_percentage}%
                      </div>
                    )}
                    {product.is_customizable && (
                      <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {t.customizable}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {language === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {language === 'ar' ? product.description_ar : product.description_en}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {product.price} {t.sar}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-slate-400 line-through">
                          {product.original_price} {t.sar}
                        </span>
                      )}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full"
                      onClick={(e) => { e.stopPropagation(); addItem(product); }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t.addToCart}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
