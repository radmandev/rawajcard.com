import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Search,
  Package, ImagePlus, X, Loader2, GripVertical,
  Tag, Globe, FileText, DollarSign, ChevronDown, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'business_cards', en: 'Business Cards', ar: 'بطاقات تعارف' },
  { value: 'keychains',      en: 'Keychains',      ar: 'تعليقات مفاتيح' },
  { value: 'stands',         en: 'Table Stands',   ar: 'حوامل طاولة' },
  { value: 'accessories',    en: 'Accessories',    ar: 'إكسسوارات' },
];

const slugify = (str) =>
  str.toLowerCase().trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');

const parseFeatureList = (value) =>
  String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const EMPTY_PRODUCT = {
  name: '',
  name_ar: '',
  slug: '',
  description: '',
  description_ar: '',
  seo_keywords: '',
  main_image: '',
  extra_images: [],
  price: '',
  sale_price: '',
  category: 'business_cards',
  status: 'draft',
  sort_order: 0,
  is_customizable: false,
  features_en: [],
  features_ar: [],
};

// ── Image upload helper (Supabase Storage) ─────────────────────────────
async function uploadImage(file, bucket = 'avatars', folder = 'products') {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── Sub-components ─────────────────────────────────────────────────────

function ImageUploader({ label, value, onChange, isRTL }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
    } catch {
      toast.error(isRTL ? 'فشل رفع الصورة' : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => ref.current?.click()}
          className="shrink-0"
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <><ImagePlus className="h-4 w-4 mr-1" />{isRTL ? 'اختيار صورة' : 'Choose Image'}</>}
        </Button>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4 mr-1" />
            {isRTL ? 'إزالة' : 'Remove'}
          </Button>
        )}
      </div>
      {value && (
        <img
          src={value}
          alt=""
          className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
    </div>
  );
}

function ExtraImagesEditor({ images, onChange, isRTL }) {
  const ref = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(f)));
      onChange([...(images || []), ...urls]);
      toast.success(isRTL ? 'تم رفع الصور' : 'Images uploaded');
    } catch {
      toast.error(isRTL ? 'فشل رفع الصور' : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{isRTL ? 'صور إضافية' : 'Extra Images'}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => ref.current?.click()}
        >
          {uploading
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <><ImagePlus className="h-3 w-3 mr-1" />{isRTL ? 'رفع' : 'Upload'}</>}
        </Button>
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
      </div>
      {images?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt=""
                className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Form Dialog ────────────────────────────────────────────────
function ProductDialog({ open, onClose, initialData, onSave, isSaving, isRTL }) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        ...EMPTY_PRODUCT,
        ...initialData,
        extra_images: initialData.extra_images ?? [],
        features_en: Array.isArray(initialData.features_en) ? initialData.features_en : [],
        features_ar: Array.isArray(initialData.features_ar) ? initialData.features_ar : [],
        price: initialData.price ?? '',
        sale_price: initialData.sale_price ?? '',
      } : { ...EMPTY_PRODUCT });
      setSlugManual(!!initialData);
    }
  }, [open, initialData]);

  const set = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Auto-generate slug from English name unless manually overridden
      if (field === 'name' && !slugManual) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error(isRTL ? 'الرابط المختصر مطلوب' : 'Slug is required');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error(isRTL ? 'السعر مطلوب' : 'Price is required');
      return;
    }
    onSave({
      ...form,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      sort_order: Number(form.sort_order) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            {initialData
              ? (isRTL ? 'تعديل المنتج' : 'Edit Product')
              : (isRTL ? 'منتج جديد' : 'New Product')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* ── Names ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'} *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Metal NFC Card" />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} placeholder="بطاقة NFC معدنية" dir="rtl" />
            </div>
          </div>

          {/* ── Slug ── */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {isRTL ? 'الرابط المختصر (Slug)' : 'Slug'} *
            </Label>
            <Input
              value={form.slug}
              onChange={(e) => { setSlugManual(true); set('slug', slugify(e.target.value)); }}
              placeholder="metal-nfc-card"
            />
            <p className="text-xs text-slate-400">
              {isRTL ? 'يُستخدم في الرابط — يتولَّد تلقائياً من الاسم' : 'Used in URLs — auto-generated from name'}
            </p>
          </div>

          {/* ── Descriptions ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                placeholder="Premium metal NFC card..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </Label>
              <Textarea
                value={form.description_ar}
                onChange={(e) => set('description_ar', e.target.value)}
                rows={3}
                placeholder="بطاقة معدنية فاخرة..."
                dir="rtl"
              />
            </div>
          </div>

          {/* ── SEO Keywords ── */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              {isRTL ? 'كلمات SEO (مفصولة بفاصلة)' : 'SEO Keywords (comma-separated)'}
            </Label>
            <Input
              value={form.seo_keywords}
              onChange={(e) => set('seo_keywords', e.target.value)}
              placeholder="NFC card, business card, metal card, Saudi Arabia"
            />
          </div>

          {/* ── Features ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{isRTL ? 'المميزات (إنجليزي)' : 'Features (English)'}</Label>
              <Textarea
                value={(form.features_en || []).join(', ')}
                onChange={(e) => set('features_en', parseFeatureList(e.target.value))}
                rows={3}
                placeholder={isRTL ? 'ميزة 1، ميزة 2' : 'Feature 1, Feature 2'}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? 'المميزات (عربي)' : 'Features (Arabic)'}</Label>
              <Textarea
                value={(form.features_ar || []).join(', ')}
                onChange={(e) => set('features_ar', parseFeatureList(e.target.value))}
                rows={3}
                placeholder={isRTL ? 'ميزة ١، ميزة ٢' : 'ميزة 1، ميزة 2'}
                dir="rtl"
              />
            </div>
          </div>

          <Separator />

          {/* ── Images ── */}
          <ImageUploader
            label={isRTL ? 'الصورة الرئيسية' : 'Main Image'}
            value={form.main_image}
            onChange={(v) => set('main_image', v)}
            isRTL={isRTL}
          />
          <ExtraImagesEditor
            images={form.extra_images}
            onChange={(v) => set('extra_images', v)}
            isRTL={isRTL}
          />

          <Separator />

          {/* ── Pricing ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {isRTL ? 'السعر (ر.س)' : 'Price (SAR)'} *
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="130.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-red-500" />
                {isRTL ? 'سعر الخصم (ر.س)' : 'Sale Price (SAR)'}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => set('sale_price', e.target.value)}
                placeholder={isRTL ? 'اتركه فارغاً إذا لم يكن هناك خصم' : 'Leave blank if no sale'}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? 'الترتيب' : 'Sort Order'}</Label>
              <Input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* ── Category + Status + Customizable ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {isRTL ? c.ar : c.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>{isRTL ? 'الحالة' : 'Status'}</Label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                <option value="published">{isRTL ? 'منشور' : 'Published'}</option>
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_customizable}
                  onChange={(e) => set('is_customizable', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{isRTL ? 'قابل للتخصيص' : 'Customizable'}</span>
              </label>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSaving
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : null}
            {initialData
              ? (isRTL ? 'حفظ التعديلات' : 'Save Changes')
              : (isRTL ? 'إضافة المنتج' : 'Add Product')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main AdminProducts component ──────────────────────────────────────
export default function AdminProducts() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);   // product to edit (null = create new)
  const [deleting, setDeleting] = useState(null); // product pending delete

  // ── Data fetching ──────────────────────────────────────────
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Admin query — fetch all regardless of status
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // ── Mutations ──────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async (product) => {
      if (product.id) {
        const { id, created_at, updated_at, ...rest } = product;
        const { error } = await supabase.from('products').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(product);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setFormOpen(false);
      setEditing(null);
      toast.success(isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleting(null);
      toast.success(isRTL ? 'تم حذف المنتج' : 'Product deleted');
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', product.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success(
      newStatus === 'published'
        ? (isRTL ? 'تم النشر' : 'Published')
        : (isRTL ? 'تم التحويل إلى مسودة' : 'Moved to draft')
    );
  };

  // ── Filtered list ──────────────────────────────────────────
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.name_ar?.includes(q) || p.slug?.includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
            {isRTL ? 'إدارة المنتجات' : 'Product Management'}
          </h2>
          <div className="flex gap-3 mt-1 text-sm text-slate-500">
            <span>{products.length} {isRTL ? 'منتج' : 'total'}</span>
            <span className="text-green-600">{publishedCount} {isRTL ? 'منشور' : 'published'}</span>
            <span className="text-amber-600">{draftCount} {isRTL ? 'مسودة' : 'draft'}</span>
          </div>
        </div>
        <Button
          onClick={() => { setEditing(null); setFormOpen(true); }}
          className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          {isRTL ? 'منتج جديد' : 'New Product'}
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all',       en: 'All',       ar: 'الكل' },
            { key: 'published', en: 'Published',  ar: 'منشور' },
            { key: 'draft',     en: 'Draft',      ar: 'مسودة' },
          ].map((f) => (
            <Button
              key={f.key}
              variant={statusFilter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(f.key)}
              className={statusFilter === f.key ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
            >
              {isRTL ? f.ar : f.en}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Product Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {search || statusFilter !== 'all'
              ? (isRTL ? 'لا توجد نتائج مطابقة' : 'No matching products')
              : (isRTL ? 'لا توجد منتجات بعد — أضف منتجاً جديداً' : 'No products yet — add your first product')}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {product.main_image
                      ? <img src={product.main_image} alt={product.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-slate-300" /></div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {product.name}
                      </span>
                      {product.name_ar && (
                        <span className="text-slate-400 text-sm truncate" dir="rtl">
                          {product.name_ar}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          product.status === 'published'
                            ? 'border-green-400 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                            : 'border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'
                        }
                      >
                        {product.status === 'published'
                          ? (isRTL ? 'منشور' : 'Published')
                          : (isRTL ? 'مسودة' : 'Draft')}
                      </Badge>
                      {product.is_customizable && (
                        <Badge variant="outline" className="border-teal-400 text-teal-700 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 text-xs">
                          {isRTL ? 'قابل للتخصيص' : 'Custom'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        /{product.slug}
                      </span>
                      <span>
                        {CATEGORIES.find((c) => c.value === product.category)?.[isRTL ? 'ar' : 'en'] ?? product.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {product.sale_price ? (
                        <>
                          <span className="text-red-600 font-bold">{product.sale_price} SAR</span>
                          <span className="line-through text-slate-400 text-sm">{product.price} SAR</span>
                        </>
                      ) : (
                        <span className="text-teal-700 dark:text-teal-400 font-bold">{product.price} SAR</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <a
                        href={`/products/${encodeURIComponent(product.slug || product.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        title={isRTL ? 'فتح صفحة المنتج' : 'Open product page'}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(product)}
                      title={product.status === 'published' ? 'Move to Draft' : 'Publish'}
                      className={
                        product.status === 'published'
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                      }
                    >
                      {product.status === 'published'
                        ? <Eye className="h-4 w-4" />
                        : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditing(product); setFormOpen(true); }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(product)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create / Edit Dialog ── */}
      <ProductDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        initialData={editing}
        onSave={(data) => saveMutation.mutate(data)}
        isSaving={saveMutation.isPending}
        isRTL={isRTL}
      />

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? 'حذف المنتج' : 'Delete Product'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? `هل أنت متأكد من حذف "${deleting?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleting?.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : null}
              {isRTL ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
