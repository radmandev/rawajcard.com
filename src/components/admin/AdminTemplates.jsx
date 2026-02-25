import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, EyeOff, Wand2 } from 'lucide-react';
import CardPreview from '@/components/cards/CardPreview';
import { toast } from 'sonner';

const templates = [
  {
    id: 'navy_gold',
    name: 'Navy Gold',
    nameAr: 'الأزرق الذهبي',
    description: 'Professional navy with gold accents',
    descriptionAr: 'أزرق داكن احترافي مع لمسات ذهبية',
    category: 'professional',
    hidden: false
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    nameAr: 'الداكن البسيط',
    description: 'Sleek black and white design',
    descriptionAr: 'تصميم أسود وأبيض أنيق',
    category: 'minimal',
    hidden: false
  },
  {
    id: 'purple_coral',
    name: 'Purple Coral',
    nameAr: 'البنفسجي المرجاني',
    description: 'Vibrant purple with coral highlights',
    descriptionAr: 'بنفسجي نابض مع لمسات مرجانية',
    category: 'creative',
    hidden: false
  },
  {
    id: 'earthy_minimal',
    name: 'Earthy',
    nameAr: 'الترابي',
    description: 'Warm earthy tones with organic feel',
    descriptionAr: 'ألوان ترابية دافئة بإحساس طبيعي',
    category: 'minimal',
    hidden: false
  },
  {
    id: 'pink_modern',
    name: 'Rose Modern',
    nameAr: 'الوردي العصري',
    description: 'Fresh pink modern aesthetic',
    descriptionAr: 'جمالية وردية عصرية منعشة',
    category: 'modern',
    hidden: false
  },
  {
    id: 'orange_pro',
    name: 'Pro Business',
    nameAr: 'الأعمال الاحترافي',
    description: 'Corporate indigo with orange accent',
    descriptionAr: 'نيلي احترافي مع لمسة برتقالية',
    category: 'professional',
    hidden: false
  },
  {
    id: 'noqtatain1',
    name: 'Wave Blue',
    nameAr: 'موجة زرقاء',
    description: 'Elegant wave design with profile focus',
    descriptionAr: 'تصميم موجي أنيق مع تركيز على الملف الشخصي',
    category: 'creative',
    hidden: false
  },
  {
    id: 'noqtatain2',
    name: 'Gradient Pro',
    nameAr: 'متدرج احترافي',
    description: 'Modern gradient with clean layout',
    descriptionAr: 'تدرج حديث مع تخطيط نظيف',
    category: 'modern',
    hidden: false
  },
  {
    id: 'noqtatain3',
    name: 'Cover Style',
    nameAr: 'نمط الغلاف',
    description: 'Cover image with overlaid profile',
    descriptionAr: 'صورة غلاف مع ملف شخصي متراكب',
    category: 'creative',
    hidden: false
  },
  {
    id: 'noqtatain4',
    name: 'Wave Pro',
    nameAr: 'موجة احترافية',
    description: 'Professional wave background design',
    descriptionAr: 'تصميم خلفية موجية احترافية',
    category: 'professional',
    hidden: false
  },
  {
    id: 'noqtatain6',
    name: 'Color Pop',
    nameAr: 'انفجار الألوان',
    description: 'Vibrant colored background with modern feel',
    descriptionAr: 'خلفية ملونة نابضة بالحياة مع إحساس عصري',
    category: 'creative',
    hidden: false
  },
  {
    id: 'modern_gradient',
    name: 'Modern Gradient',
    nameAr: 'التدرج العصري',
    description: 'Sleek gradient design with floating elements',
    descriptionAr: 'تصميم متدرج أنيق مع عناصر عائمة',
    category: 'modern',
    hidden: false
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Gold',
    nameAr: 'الذهب الفاخر',
    description: 'Elegant black and gold sophisticated design',
    descriptionAr: 'تصميم راقي أسود وذهبي فاخر',
    category: 'luxury',
    hidden: false
  },
  {
    id: 'tech_blue',
    name: 'Tech Blue',
    nameAr: 'التقني الأزرق',
    description: 'Modern tech-focused design with geometric patterns',
    descriptionAr: 'تصميم تقني حديث مع أنماط هندسية',
    category: 'professional',
    hidden: false
  },
  {
    id: 'sunset_warm',
    name: 'Sunset Warm',
    nameAr: 'غروب الشمس الدافئ',
    description: 'Warm sunset colors with soft gradients',
    descriptionAr: 'ألوان غروب دافئة مع تدرجات ناعمة',
    category: 'creative',
    hidden: false
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    nameAr: 'الغابة الخضراء',
    description: 'Natural calming green with organic elements',
    descriptionAr: 'أخضر طبيعي هادئ مع عناصر عضوية',
    category: 'minimal',
    hidden: false
  }
];

export default function AdminTemplates() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [templatesState, setTemplatesState] = useState(templates);

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['custom-templates'],
    queryFn: () => api.entities.CustomTemplate.list('-created_date')
  });

  const deleteCustomTemplateMutation = useMutation({
    mutationFn: (id) => api.entities.CustomTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates'] });
      toast.success(isRTL ? 'تم حذف القالب المخصص' : 'Custom template deleted');
    }
  });

  const sampleCard = {
    name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
    title: isRTL ? 'مدير التسويق' : 'Marketing Director',
    company: isRTL ? 'شركة رواج' : 'Rawaj Co.',
    bio: isRTL ? 'متخصص في التسويق الرقمي والاستراتيجية' : 'Digital marketing and strategy specialist',
    email: 'ahmed@rawaj.com',
    phone: '+966 50 123 4567',
    location: isRTL ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia'
  };

  const filteredTemplates = templatesState.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nameAr.includes(searchQuery) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleHidden = (templateId) => {
    setTemplatesState(prev => prev.map(t => 
      t.id === templateId ? { ...t, hidden: !t.hidden } : t
    ));
    toast.success(isRTL ? 'تم تحديث حالة القالب' : 'Template status updated');
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Implement saving template changes to a configuration file or database
    toast.success(isRTL ? 'تم حفظ التغييرات' : 'Changes saved');
    setEditDialogOpen(false);
  };

  const handleDelete = (template) => {
    if (confirm(isRTL ? `هل تريد حذف القالب "${template.nameAr}"?` : `Delete template "${template.name}"?`)) {
      toast.success(isRTL ? 'تم حذف القالب' : 'Template deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-teal-600" />
                {isRTL ? 'القوالب المخصصة' : 'Custom Templates'}
              </CardTitle>
              <Button onClick={() => navigate(createPageUrl('TemplateEditor'))} className="bg-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'تصميم قالب' : 'Design Template'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-t-lg flex items-center justify-center text-slate-400">
                    {template.thumbnail ? (
                      <img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover rounded-t-lg" />
                    ) : (
                      'Preview'
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{template.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(createPageUrl(`TemplateEditor?id=${template.id}`))}
                        className="flex-1"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        {isRTL ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCustomTemplateMutation.mutate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Built-in Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isRTL ? 'القوالب المدمجة' : 'Built-in Templates'}</CardTitle>
            <Button onClick={() => navigate(createPageUrl('TemplateEditor'))} className="bg-teal-600">
              <Wand2 className="h-4 w-4 mr-2" />
              {isRTL ? 'تصميم قالب جديد' : 'Design New Template'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={isRTL ? 'البحث عن قالب...' : 'Search templates...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-start justify-center">
                    <div className="transform scale-[0.35] origin-top w-[285%]">
                      <CardPreview card={sampleCard} template={template.id} />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {isRTL ? template.nameAr : template.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {isRTL ? template.descriptionAr : template.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs rounded">
                        {template.category}
                      </span>
                      {template.hidden && (
                        <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded">
                          {isRTL ? 'مخفي' : 'Hidden'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {isRTL ? 'معاينة' : 'Preview'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleHidden(template.id)}
                      className={template.hidden ? 'bg-red-50 dark:bg-red-900/20' : ''}
                    >
                      {template.hidden ? (
                        <EyeOff className="h-3 w-3 text-red-500" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل القالب' : 'Edit Template'}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input defaultValue={selectedTemplate.name} />
                </div>
                <div>
                  <Label>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input defaultValue={selectedTemplate.nameAr} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea defaultValue={selectedTemplate.description} />
                </div>
                <div>
                  <Label>{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea defaultValue={selectedTemplate.descriptionAr} />
                </div>
              </div>
              <div>
                <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                <Input defaultValue={selectedTemplate.category} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                  {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'معاينة القالب' : 'Template Preview'}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <CardPreview card={sampleCard} template={previewTemplate.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}