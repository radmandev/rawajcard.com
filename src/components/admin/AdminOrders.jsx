import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingBag, Search, Eye, RefreshCw, Loader2, Package,
  CheckCircle, Clock, TrendingUp, DollarSign,
  ChevronLeft, ChevronRight, User, MapPin, Phone, Calendar,
  Truck, XCircle, Building2, ImageIcon, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── Status config ──────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: 'all',        labelEn: 'All Orders',    labelAr: 'جميع الطلبات',    color: '' },
  { value: 'pending',    labelEn: 'Pending',       labelAr: 'قيد الانتظار',    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
  { value: 'processing', labelEn: 'Processing',    labelAr: 'قيد المعالجة',    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  { value: 'shipped',    labelEn: 'Shipped',       labelAr: 'تم الشحن',        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
  { value: 'delivered',  labelEn: 'Delivered',     labelAr: 'تم التسليم',      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
  { value: 'cancelled',  labelEn: 'Cancelled',     labelAr: 'ملغي',            color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
];

const STATUS_ICONS = {
  pending:    <Clock className="h-3.5 w-3.5" />,
  processing: <Loader2 className="h-3.5 w-3.5" />,
  shipped:    <Truck className="h-3.5 w-3.5" />,
  delivered:  <CheckCircle className="h-3.5 w-3.5" />,
  cancelled:  <XCircle className="h-3.5 w-3.5" />,
};

function getStatusCfg(status) {
  return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[1];
}

function StatusBadge({ status, isRTL }) {
  const cfg = getStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {STATUS_ICONS[status]}
      {isRTL ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  try { return format(new Date(dateStr), 'dd MMM yyyy, HH:mm'); }
  catch { return dateStr || '—'; }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage]                   = useState(0);
  const PAGE_SIZE = 20;

  // ── Fetch all orders ────────────────────────────────────────────────────────
  const { data: orders = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('id', { ascending: false });
      if (error) {
        console.error('AdminOrders query error:', error);
        throw error;
      }
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // ── Update status ────────────────────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success(isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated');
    },
    onError: () => toast.error(isRTL ? 'فشل تحديث الطلب' : 'Failed to update order'),
  });

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = orders.filter(order => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    const meta     = order.metadata || {};
    const shipping = meta.shippingInfo || meta.shipping_info || {};
    const haystack = `${order.created_by ?? ''} ${shipping.name ?? ''} ${shipping.phone ?? ''} ${order.id}`.toLowerCase();
    const matchSearch = !search || haystack.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const paginated   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalRevenue   = orders.reduce((s, o) => s + (parseFloat(o.amount) || 0), 0);
  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { titleEn: 'Total Orders',   titleAr: 'إجمالي الطلبات',   value: orders.length,                              Icon: ShoppingBag, color: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/10'   },
    { titleEn: 'Total Revenue',  titleAr: 'إجمالي الإيرادات',  value: `${totalRevenue.toLocaleString()} SAR`,     Icon: DollarSign,  color: 'text-teal-500',  bg: 'bg-teal-50 dark:bg-teal-900/10'   },
    { titleEn: 'Pending',        titleAr: 'قيد الانتظار',       value: pendingCount,                               Icon: Clock,       color: 'text-yellow-500',bg: 'bg-yellow-50 dark:bg-yellow-900/10'},
    { titleEn: 'Delivered',      titleAr: 'تم التسليم',          value: deliveredCount,                             Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
  ];

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
    setSelectedOrder(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ titleEn, titleAr, value, Icon, color, bg }, i) => (
          <Card key={i} className={`${bg} border-0 shadow-sm`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {isRTL ? titleAr : titleEn}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={isRTL ? 'بحث بالاسم أو البريد أو رقم الطلب...' : 'Search by name, email or order ID...'}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {ORDER_STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === s.value
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400'
              }`}
            >
              {isRTL ? s.labelAr : s.labelEn}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 flex-shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Orders table */}
      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-3">
              <Package className="h-14 w-14 opacity-20" />
              <p className="text-lg font-medium">{isRTL ? 'خطأ في تحميل الطلبات' : 'Failed to load orders'}</p>
              <p className="text-sm text-red-400/70">{queryError?.message}</p>
              <button onClick={() => refetch()} className="text-sm text-teal-600 hover:underline">
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="h-14 w-14 mb-3 opacity-20" />
              <p className="text-lg font-medium">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</p>
              <p className="text-sm mt-1">{isRTL ? 'جرّب تغيير الفلتر أو البحث' : 'Try changing the filter or search'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    {[
                      isRTL ? 'رقم الطلب'    : 'Order',
                      isRTL ? 'العميل'        : 'Customer',
                      isRTL ? 'المنتجات'      : 'Items',
                      isRTL ? 'المبلغ'        : 'Amount',
                      isRTL ? 'الحالة'        : 'Status',
                      isRTL ? 'التاريخ'       : 'Date',
                      isRTL ? 'إجراء'         : 'Action',
                    ].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginated.map(order => {
                    const meta     = order.metadata || {};
                    const shipping = meta.shippingInfo || meta.shipping_info || {};
                    const items    = meta.cartItems || meta.items || [];
                    const orderNum = (meta.order_number || order.id.slice(0, 8)).toUpperCase();

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Order # */}
                        <td className="px-4 py-3">
                          <p className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
                            #{orderNum}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {meta.payment_method || 'Card'}
                          </p>
                        </td>
                        {/* Customer */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {shipping.name || order.created_by || '—'}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {shipping.phone || order.created_by || ''}
                          </p>
                        </td>
                        {/* Items preview */}
                        <td className="px-4 py-3">
                          <div className="flex -space-x-1">
                            {items.slice(0, 3).map((item, i) =>
                              item.product_image ? (
                                <img
                                  key={i}
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="h-8 w-8 rounded-md object-cover border-2 border-white dark:border-slate-900 bg-slate-100"
                                />
                              ) : (
                                <div key={i} className="h-8 w-8 rounded-md bg-teal-100 dark:bg-teal-900 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                  <Package className="h-3.5 w-3.5 text-teal-600" />
                                </div>
                              )
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {items.length} {isRTL ? 'منتج' : 'item(s)'}
                          </p>
                        </td>
                        {/* Amount */}
                        <td className="px-4 py-3">
                          <span className="font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                            {parseFloat(order.amount || 0).toLocaleString()}&nbsp;{order.currency || 'SAR'}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} isRTL={isRTL} />
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        {/* View */}
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 w-8 p-0 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            {isRTL
              ? `${page * PAGE_SIZE + 1} - ${Math.min((page + 1) * PAGE_SIZE, filtered.length)} من ${filtered.length}`
              : `${page * PAGE_SIZE + 1} – ${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleStatusChange}
        isUpdating={updateStatusMutation.isPending}
        isRTL={isRTL}
      />
    </div>
  );
}

// ── Order detail dialog ────────────────────────────────────────────────────────
function OrderDetailDialog({ order, onClose, onUpdateStatus, isUpdating, isRTL }) {
  if (!order) return null;

  const meta     = order.metadata || {};
  const shipping = meta.shippingInfo || meta.shipping_info || {};
  const items    = meta.cartItems || meta.items || [];
  const orderNum = (meta.order_number || order.id.slice(0, 8)).toUpperCase();

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <Package className="h-5 w-5 text-teal-600 flex-shrink-0" />
            <span>{isRTL ? `طلب #${orderNum}` : `Order #${orderNum}`}</span>
            <StatusBadge status={order.status} isRTL={isRTL} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-teal-500" />
              {formatDate(order.created_at)}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 flex-shrink-0 text-teal-500" />
              {meta.payment_method || (isRTL ? 'بطاقة' : 'Card')}
            </div>
          </div>

          <Separator />

          {/* Shipping / Customer */}
          {(shipping.name || shipping.phone || shipping.address) && (
            <>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-600" />
                  {isRTL ? 'معلومات العميل والشحن' : 'Customer & Shipping Info'}
                </h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                  {shipping.name && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">{shipping.name}</span>
                    </div>
                  )}
                  {shipping.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span>{shipping.phone}</span>
                    </div>
                  )}
                  {(shipping.address || shipping.city) && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {[shipping.address, shipping.city, shipping.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Items */}
          {items.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-teal-600" />
                  {isRTL ? 'المنتجات' : 'Order Items'} ({items.length})
                </h3>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-14 w-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-teal-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isRTL ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                        </p>
                      </div>
                      <span className="font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap text-sm">
                        {((item.product_price || 0) * item.quantity).toLocaleString()}&nbsp;{order.currency || 'SAR'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Total */}
          <div className="flex items-center justify-between py-1">
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              {isRTL ? 'الإجمالي' : 'Total'}
            </span>
            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
              {parseFloat(order.amount || 0).toLocaleString()}&nbsp;{order.currency || 'SAR'}
            </span>
          </div>

          <Separator />

          {/* Bank transfer receipt */}
          {meta.payment_method === 'bank_transfer' && (
            <>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  {isRTL ? 'إيصال التحويل البنكي' : 'Bank Transfer Receipt'}
                </h3>
                {meta.receipt_url ? (
                  <div className="rounded-xl overflow-hidden border border-green-200 dark:border-green-800">
                    {meta.receipt_url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(meta.receipt_url) ? (
                      <img
                        src={meta.receipt_url}
                        alt="Transfer Receipt"
                        className="w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800">
                        <ImageIcon className="h-8 w-8 text-teal-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                          {isRTL ? 'ملف الإيصال' : 'Receipt file'}
                        </span>
                      </div>
                    )}
                    <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                      <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                        {isRTL ? 'تم رفع الإيصال من العميل' : 'Receipt uploaded by customer'}
                      </span>
                      <a
                        href={meta.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {isRTL ? 'فتح' : 'Open'}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
                    <ImageIcon className="h-4 w-4 flex-shrink-0" />
                    {isRTL ? 'لم يرفع العميل إيصالاً بعد' : 'Customer has not uploaded a receipt yet'}
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Status update */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              {isRTL ? 'تحديث حالة الطلب' : 'Update Order Status'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.filter(s => s.value !== 'all').map(s => {
                const isActive = order.status === s.value;
                return (
                  <button
                    key={s.value}
                    disabled={isUpdating || isActive}
                    onClick={() => onUpdateStatus(order.id, s.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all disabled:cursor-default ${
                      isActive
                        ? `${s.color} border-transparent`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    {isUpdating && !isActive ? <Loader2 className="h-3 w-3 animate-spin" /> : STATUS_ICONS[s.value]}
                    {isRTL ? s.labelAr : s.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
