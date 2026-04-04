import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Users, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Trash2,
  Eye,
  Search,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function MyContacts() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewContact, setViewContact] = useState(null);
  const [showCRMDialog, setShowCRMDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const getExtraData = (contact) => {
    if (!contact?.data) return {};
    return typeof contact.data === 'object' ? contact.data : {};
  };

  const getContactName = (contact) => {
    const data = getExtraData(contact);
    return contact?.visitor_name || contact?.name || data.visitor_name || data.name || '';
  };

  const getContactEmail = (contact) => {
    const data = getExtraData(contact);
    return contact?.visitor_email || contact?.email || data.visitor_email || data.email || '';
  };

  const getContactPhone = (contact) => {
    const data = getExtraData(contact);
    return contact?.visitor_phone || contact?.phone || data.visitor_phone || data.phone || '';
  };

  const getContactCompany = (contact) => {
    const data = getExtraData(contact);
    return contact?.visitor_company || data.visitor_company || data.company || '';
  };

  const getContactNotes = (contact) => {
    const data = getExtraData(contact);
    return contact?.notes || contact?.message || data.notes || data.message || '';
  };

  const getContactCreatedAt = (contact) => {
    return contact?.created_date || contact?.created_at || null;
  };

  const formatContactDate = (value, pattern) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return format(date, pattern);
  };

  // Pull to refresh handler
  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY && window.scrollY === 0) {
      const distance = e.touches[0].clientY - startY;
      if (distance > 0) {
        setPullDistance(Math.min(distance, 150));
      }
    }
  }, [startY]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      await queryClient.refetchQueries({ queryKey: ['contact-submissions'] });
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, queryClient]);

  // Fetch user's cards
  const { data: cards = [] } = useQuery({
    queryKey: ['user-cards'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.BusinessCard.filter({ created_by: me.email });
    }
  });

  // Fetch contact submissions
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const me = await api.auth.me();
      return api.entities.ContactSubmission.filter({ card_owner: me.email }, '-created_at');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.ContactSubmission.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success(isRTL ? 'تم الحذف' : 'Contact deleted');
    }
  });

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesCard = selectedCard === 'all' || contact.card_id === selectedCard;
    const name = getContactName(contact);
    const email = getContactEmail(contact);
    const phone = getContactPhone(contact);
    const matchesSearch = !searchQuery || 
      name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone?.includes(searchQuery);
    return matchesCard && matchesSearch;
  });

  // Get card name by ID
  const getCardName = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    return card ? (isRTL && card.name_ar ? card.name_ar : card.name) : cardId;
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredContacts.map(c => ({
      'Name': getContactName(c),
      'Email': getContactEmail(c),
      'Phone': getContactPhone(c),
      'Company': getContactCompany(c),
      'Notes': getContactNotes(c),
      'From Card': getCardName(c.card_id),
      'Date': formatContactDate(getContactCreatedAt(c), 'yyyy-MM-dd HH:mm')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
    
    XLSX.writeFile(wb, `contacts_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success(isRTL ? 'تم التصدير بنجاح' : 'Exported successfully');
  };

  // Save CRM webhook
  const saveCRMWebhook = async () => {
    setSavingWebhook(true);
    try {
      const me = await api.auth.me();
      await api.auth.updateMe({
        crm_webhook_url: webhookUrl
      });
      toast.success(isRTL ? 'تم الحفظ بنجاح' : 'CRM integration saved');
      setShowCRMDialog(false);
    } catch (error) {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSavingWebhook(false);
    }
  };

  // Load webhook URL
  React.useEffect(() => {
    async function loadWebhook() {
      try {
        const me = await api.auth.me();
        setWebhookUrl(me.crm_webhook_url || '');
      } catch (error) {
        console.error('Failed to load webhook:', error);
      }
    }
    loadWebhook();
  }, []);

  return (
    <div 
      className="max-w-7xl mx-auto space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-16 left-0 right-0 flex justify-center transition-transform z-50"
          style={{ transform: `translateY(${Math.min(pullDistance - 50, 50)}px)` }}
        >
          <div className="bg-teal-600 text-white px-4 py-2 rounded-full shadow-lg">
            {isRefreshing ? (
              <Calendar className="h-5 w-5 animate-spin" />
            ) : pullDistance > 80 ? (
              <span className="text-sm">{isRTL ? 'اترك للتحديث' : 'Release to refresh'}</span>
            ) : (
              <span className="text-sm">{isRTL ? 'اسحب للتحديث' : 'Pull to refresh'}</span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {isRTL ? 'جهات الاتصال' : 'My Contacts'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isRTL 
              ? 'جهات الاتصال التي شاركت معلوماتها معك'
              : 'People who shared their details with you'
            }
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCRMDialog(true)}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {isRTL ? 'ربط CRM' : 'CRM Integration'}
          </Button>
          <Button
            variant="outline"
            onClick={exportToExcel}
            disabled={filteredContacts.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
          <Select value={selectedCard} onValueChange={setSelectedCard}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={isRTL ? 'اختر بطاقة' : 'Select card'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'جميع البطاقات' : 'All Cards'}</SelectItem>
              {cards.map(card => (
                <SelectItem key={card.id} value={card.id}>
                  {isRTL && card.name_ar ? card.name_ar : card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRTL ? 'بحث...' : 'Search contacts...'}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{isRTL ? 'إجمالي جهات الاتصال' : 'Total Contacts'}</p>
                <p className="text-3xl font-bold mt-1">{contacts.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{isRTL ? 'هذا الأسبوع' : 'This Week'}</p>
                <p className="text-3xl font-bold mt-1">
                  {contacts.filter(c => {
                    const date = new Date(getContactCreatedAt(c));
                    if (Number.isNaN(date.getTime())) return false;
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">{isRTL ? 'بطاقات نشطة' : 'Active Cards'}</p>
                <p className="text-3xl font-bold mt-1">{cards.filter(c => c.status === 'published').length}</p>
              </div>
              <Building2 className="h-12 w-12 text-teal-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'جهات الاتصال' : 'Contacts'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {isRTL ? 'لا توجد جهات اتصال بعد' : 'No contacts yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getContactName(contact)?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {getContactName(contact)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {getContactEmail(contact) && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            {getContactEmail(contact)}
                          </span>
                        )}
                        {getContactPhone(contact) && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {getContactPhone(contact)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {isRTL ? 'من: ' : 'From: '}{getCardName(contact.card_id)} • {formatContactDate(getContactCreatedAt(contact), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewContact(contact)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(contact.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Contact Dialog */}
      <Dialog open={!!viewContact} onOpenChange={() => setViewContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تفاصيل جهة الاتصال' : 'Contact Details'}</DialogTitle>
            <DialogDescription>
              {viewContact && formatContactDate(getContactCreatedAt(viewContact), 'MMMM dd, yyyy • HH:mm')}
            </DialogDescription>
          </DialogHeader>
          {viewContact && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">{isRTL ? 'الاسم' : 'Name'}</label>
                <p className="text-lg font-medium mt-1">{getContactName(viewContact)}</p>
              </div>
              {getContactEmail(viewContact) && (
                <div>
                  <label className="text-sm font-medium text-slate-500">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <p className="text-lg font-medium mt-1">{getContactEmail(viewContact)}</p>
                </div>
              )}
              {getContactPhone(viewContact) && (
                <div>
                  <label className="text-sm font-medium text-slate-500">{isRTL ? 'الهاتف' : 'Phone'}</label>
                  <p className="text-lg font-medium mt-1">{getContactPhone(viewContact)}</p>
                </div>
              )}
              {getContactCompany(viewContact) && (
                <div>
                  <label className="text-sm font-medium text-slate-500">{isRTL ? 'الشركة' : 'Company'}</label>
                  <p className="text-lg font-medium mt-1">{getContactCompany(viewContact)}</p>
                </div>
              )}
              {getContactNotes(viewContact) && (
                <div>
                  <label className="text-sm font-medium text-slate-500">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                  <p className="text-lg font-medium mt-1">{getContactNotes(viewContact)}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-500">{isRTL ? 'من البطاقة' : 'From Card'}</label>
                <p className="text-lg font-medium mt-1">{getCardName(viewContact.card_id)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRM Integration Dialog */}
      <Dialog open={showCRMDialog} onOpenChange={setShowCRMDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'ربط مع CRM' : 'CRM Integration'}</DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'أدخل رابط Webhook لإرسال جهات الاتصال الجديدة إلى CRM الخاص بك'
                : 'Enter your webhook URL to send new contacts to your CRM'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isRTL ? 'رابط Webhook' : 'Webhook URL'}</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-crm.com/webhook"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-2">
                {isRTL 
                  ? 'سيتم إرسال جهات الاتصال الجديدة تلقائياً إلى هذا الرابط'
                  : 'New contacts will be automatically sent to this URL'
                }
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCRMDialog(false)}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={saveCRMWebhook}
                disabled={savingWebhook || !webhookUrl}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {savingWebhook ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}