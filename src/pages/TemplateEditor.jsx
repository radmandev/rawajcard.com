import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { api } from '@/api/supabaseAPI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Smartphone,
  Monitor,
  Undo,
  Redo,
  Check,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import VisualCanvas from '@/components/template-builder/VisualCanvas';
import ElementsLibrary from '@/components/template-builder/ElementsLibrary';
import PropertyEditor from '@/components/template-builder/PropertyEditor';
import TemplateToolbar from '@/components/template-builder/TemplateToolbar';
import PreviewDialog from '@/components/template-builder/PreviewDialog';

export default function TemplateEditor() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');

  const [templateName, setTemplateName] = useState('Untitled Template');
  const [templateSlug, setTemplateSlug] = useState('');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewMode, setViewMode] = useState('mobile');
  const [showPreview, setShowPreview] = useState(false);
  const [canvas, setCanvas] = useState({
    width: 390,
    height: 'auto',
    backgroundColor: '#FFFFFF'
  });
  const [theme, setTheme] = useState({
    colors: {
      primary: '#0D7377',
      secondary: '#14274E',
      accent: '#F4B400',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    globalStyles: {}
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me()
  });

  const { data: template } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => api.entities.CustomTemplate.filter({ id: templateId }).then(t => t[0]),
    enabled: !!templateId
  });

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateSlug(template.slug);
      setElements(template.elements || []);
      setCanvas(template.canvas || canvas);
      setTheme(template.theme || theme);
    }
  }, [template]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (elements.length > 0 && templateName) {
        handleSave('draft', true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [elements, templateName, templateSlug, canvas, theme]);

  // History management
  const addToHistory = () => {
    const snapshot = { elements, canvas, theme, timestamp: Date.now() };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setElements(previousState.elements);
      setCanvas(previousState.canvas);
      setTheme(previousState.theme);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setCanvas(nextState.canvas);
      setTheme(nextState.theme);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async ({ status, silent }) => {
      const data = {
        name: templateName,
        slug: templateSlug || templateName.toLowerCase().replace(/\s+/g, '-'),
        status: status || 'draft',
        canvas,
        elements,
        theme,
        versions: template?.versions || []
      };

      // Add version snapshot
      if (templateId) {
        data.versions = [
          ...(data.versions || []),
          {
            version: (data.versions?.length || 0) + 1,
            timestamp: new Date().toISOString(),
            snapshot: { elements, canvas, theme }
          }
        ].slice(-10); // Keep last 10 versions
      }

      if (templateId) {
        await api.entities.CustomTemplate.update(templateId, data);
      } else {
        await api.entities.CustomTemplate.create(data);
      }

      if (!silent) {
        toast.success(isRTL ? 'تم حفظ القالب' : 'Template saved');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates'] });
    }
  });

  const handleSave = (status, silent = false) => {
    saveTemplateMutation.mutate({ status, silent });
  };

  const addElement = (elementType) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      position: {
        x: 50,
        y: elements.length * 100 + 50,
        width: '80%',
        height: 'auto'
      },
      styles: {},
      content: {},
      responsive: {
        hideOnMobile: false,
        hideOnDesktop: false
      },
      zIndex: elements.length
    };
    setElements([...elements, newElement]);
    addToHistory();
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    addToHistory();
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
    addToHistory();
  };

  const reorderElements = (dragIndex, dropIndex) => {
    const newElements = [...elements];
    const [removed] = newElements.splice(dragIndex, 1);
    newElements.splice(dropIndex, 0, removed);
    setElements(newElements);
    addToHistory();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{isRTL ? 'وصول مرفوض' : 'Access Denied'}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Toolbar */}
      <TemplateToolbar
        templateName={templateName}
        onNameChange={setTemplateName}
        onBack={() => navigate(createPageUrl('Admin'))}
        onSave={() => handleSave('draft')}
        onPublish={() => handleSave('published')}
        onPreview={() => setShowPreview(true)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements Library */}
        <ElementsLibrary
          onAddElement={addElement}
          theme={theme}
        />

        {/* Center - Visual Canvas */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-8">
          <VisualCanvas
            elements={elements}
            canvas={canvas}
            theme={theme}
            viewMode={viewMode}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onReorderElements={reorderElements}
          />
        </div>

        {/* Right Panel - Property Editor */}
        <PropertyEditor
          selectedElement={selectedElement ? elements.find(e => e.id === selectedElement) : null}
          theme={theme}
          canvas={canvas}
          onUpdateElement={updateElement}
          onUpdateTheme={setTheme}
          onUpdateCanvas={setCanvas}
        />
      </div>

      {/* Preview Dialog */}
      {showPreview && (
        <PreviewDialog
          elements={elements}
          canvas={canvas}
          theme={theme}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}