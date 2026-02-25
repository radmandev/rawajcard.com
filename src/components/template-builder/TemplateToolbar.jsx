import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Smartphone,
  Monitor,
  Undo,
  Redo,
  Check
} from 'lucide-react';

export default function TemplateToolbar({
  templateName,
  onNameChange,
  onBack,
  onSave,
  onPublish,
  onPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Input
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-64"
          placeholder="Template name"
        />
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        <Button
          variant={canUndo ? "outline" : "ghost"}
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant={canRedo ? "outline" : "ghost"}
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button size="sm" onClick={onPublish} className="bg-teal-600">
          <Check className="h-4 w-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>
  );
}