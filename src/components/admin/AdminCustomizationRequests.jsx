import React, { useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, User, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCustomizationRequests() {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [editingRequest, setEditingRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['customization-requests'],
    queryFn: () => api.entities.CustomizationRequest.list('-created_date')
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      await api.entities.CustomizationRequest.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-requests'] });
      toast.success(isRTL ? 'تم تحديث الطلب' : 'Request updated');
      setEditingRequest(null);
      setAdminNotes('');
      setNewStatus('');
    }
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const pageNames = {
    crm_settings: isRTL ? 'إعدادات CRM' : 'CRM Settings',
    my_cards: isRTL ? 'بطاقاتي' : 'My Cards',
    analytics: isRTL ? 'التحليلات' : 'Analytics'
  };

  const handleSaveUpdate = (requestId) => {
    const updates = {};
    if (newStatus) updates.status = newStatus;
    if (adminNotes) updates.admin_notes = adminNotes;
    
    updateRequestMutation.mutate({ id: requestId, updates });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-teal-600" />
          {isRTL ? 'طلبات التخصيص' : 'Customization Requests'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isRTL 
            ? `إجمالي الطلبات: ${requests.length}`
            : `Total requests: ${requests.length}`
          }
        </p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {isRTL ? 'لا توجد طلبات حتى الآن' : 'No requests yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-teal-600" />
                      {request.customer_name || request.customer_email}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-slate-50">
                        {pageNames[request.page]}
                      </Badge>
                      <Badge className={statusColors[request.status]}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(request.created_date).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {isRTL ? 'التفاصيل:' : 'Request Details:'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    {request.request_content}
                  </p>
                </div>

                {editingRequest === request.id ? (
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {isRTL ? 'حالة الطلب' : 'Status'}
                      </label>
                      <Select value={newStatus || request.status} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                          <SelectItem value="in_progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                          <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                          <SelectItem value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {isRTL ? 'ملاحظات الإدارة' : 'Admin Notes'}
                      </label>
                      <Textarea
                        value={adminNotes || request.admin_notes || ''}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveUpdate(request.id)}
                        disabled={updateRequestMutation.isPending}
                        size="sm"
                      >
                        {updateRequestMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        {isRTL ? 'حفظ' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingRequest(null);
                          setAdminNotes('');
                          setNewStatus('');
                        }}
                        size="sm"
                      >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {request.admin_notes && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          {isRTL ? 'ملاحظات الإدارة:' : 'Admin Notes:'}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {request.admin_notes}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingRequest(request.id);
                        setAdminNotes(request.admin_notes || '');
                        setNewStatus(request.status);
                      }}
                      size="sm"
                    >
                      {isRTL ? 'تحديث الطلب' : 'Update Request'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}