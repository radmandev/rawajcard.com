import React, { useState, useEffect } from 'react';
  import { api } from '@/api/supabaseAPI';
  import { useQuery } from '@tanstack/react-query';
  import Navbar from '@/components/landing/Navbar';
  import Footer from '@/components/landing/Footer';
  import { Button } from '@/components/ui/button';
  import { ShoppingCart, Star } from 'lucide-react';
  import { productsData, productCategories } from '@/components/shared/productsData';

export default function Products() {
  const [language, setLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const dir = document.documentElement.getAttribute('dir');
    setLanguage(dir === 'rtl' ? 'ar' : 'en');

    const observer = new MutationObserver(() => {
      const currentDir = document.documentElement.getAttribute('dir');
      setLanguage(currentDir === 'rtl' ? 'ar' : 'en');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });

    return () => observer.disconnect();
  }, []);

  // Use shared products data
  const products = productsData;

  const isLoading = false;

  const translations = {
    en: {
      title: "Our Products",
      subtitle: "Digital Solutions for Modern Business",
      allProducts: "All Products",
      businessCards: "Business Cards",
      keychains: "Keychains",
      stands: "Table Stands",
      addToCart: "Add to Cart",
      sar: "SAR",
      loading: "Loading products...",
      customizable: "Customizable",
      inStock: "In Stock",
      categories: {
        all: "All Products",
        business_cards: "Business Cards",
        keychains: "Keychains",
        stands: "Table Stands",
        accessories: "Accessories"
      }
    },
    ar: {
      title: "منتجاتنا",
      subtitle: "حلول رقمية للأعمال الحديثة",
      allProducts: "جميع المنتجات",
      businessCards: "بطاقات الأعمال",
      keychains: "تعليقات المفاتيح",
      stands: "ستاندات الطاولة",
      addToCart: "أضف للسلة",
      sar: "ر.س",
      loading: "جاري تحميل المنتجات...",
      customizable: "قابل للتخصيص",
      inStock: "متوفر",
      categories: {
        all: "جميع المنتجات",
        business_cards: "بطاقات الأعمال",
        keychains: "تعليقات المفاتيح",
        stands: "ستاندات الطاولة",
        accessories: "إكسسوارات"
      }
    }
  };

  const t = translations[language];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const categories = productCategories.map(cat => ({
    value: cat.value,
    label: language === 'ar' ? cat.label_ar : cat.label_en
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {t.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-teal-600 to-blue-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">{t.loading}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
                >
                  {/* Product Image */}
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

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {language === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    
                    {product.description_ar && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {language === 'ar' ? product.description_ar : product.description_en}
                      </p>
                    )}

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

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600 text-white rounded-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t.addToCart}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}