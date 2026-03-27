import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

export default function SectionEditor({ section, onUpdate, onClose }) {
  if (!section) return null;

  const updateSetting = (key, value) => {
    onUpdate({
      settings: {
        ...section.settings,
        [key]: value
      }
    });
  };

  const renderSettings = () => {
    switch (section.type) {
      case 'header':
        return (
          <>
            <div className="space-y-2">
              <Label>Background Type</Label>
              <select
                value={section.settings.backgroundType || 'color'}
                onChange={(e) => updateSetting('backgroundType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="color">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                type="number"
                value={section.settings.height || 200}
                onChange={(e) => updateSetting('height', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Wave</Label>
              <Switch
                checked={section.settings.showWave || false}
                onCheckedChange={(checked) => updateSetting('showWave', checked)}
              />
            </div>
          </>
        );

      case 'profile':
        return (
          <>
            <div className="space-y-2">
              <Label>Image Shape</Label>
              <select
                value={section.settings.shape || 'circle'}
                onChange={(e) => updateSetting('shape', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Image Size</Label>
              <Input
                type="number"
                value={section.settings.size || 120}
                onChange={(e) => updateSetting('size', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Border</Label>
              <Switch
                checked={section.settings.showBorder !== false}
                onCheckedChange={(checked) => updateSetting('showBorder', checked)}
              />
            </div>
          </>
        );

      case 'info':
        return (
          <>
            <div className="space-y-2">
              <Label>Text Align</Label>
              <select
                value={section.settings.align || 'center'}
                onChange={(e) => updateSetting('align', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Company</Label>
              <Switch
                checked={section.settings.showCompany !== false}
                onCheckedChange={(checked) => updateSetting('showCompany', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Location</Label>
              <Switch
                checked={section.settings.showLocation !== false}
                onCheckedChange={(checked) => updateSetting('showLocation', checked)}
              />
            </div>
          </>
        );

      case 'bio':
        return (
          <>
            <div className="space-y-2">
              <Label>Max Lines</Label>
              <Input
                type="number"
                value={section.settings.maxLines || 0}
                onChange={(e) => updateSetting('maxLines', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Read More</Label>
              <Switch
                checked={section.settings.showReadMore || false}
                onCheckedChange={(checked) => updateSetting('showReadMore', checked)}
              />
            </div>
          </>
        );

      case 'social':
        return (
          <>
            <div className="space-y-2">
              <Label>Display Style</Label>
              <select
                value={section.settings.style || 'icons'}
                onChange={(e) => updateSetting('style', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="icons">Icons Only</option>
                <option value="buttons">Buttons</option>
                <option value="list">List</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Icon Size</Label>
              <Input
                type="number"
                value={section.settings.iconSize || 24}
                onChange={(e) => updateSetting('iconSize', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Colorful Icons</Label>
              <Switch
                checked={section.settings.colorful || false}
                onCheckedChange={(checked) => updateSetting('colorful', checked)}
              />
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <div className="space-y-2">
              <Label>Display Layout</Label>
              <select
                value={section.settings.layout || 'grid'}
                onChange={(e) => updateSetting('layout', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="buttons">Buttons</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Icons</Label>
              <Switch
                checked={section.settings.showIcons !== false}
                onCheckedChange={(checked) => updateSetting('showIcons', checked)}
              />
            </div>
          </>
        );

      case 'gallery':
        return (
          <>
            <div className="space-y-2">
              <Label>Columns</Label>
              <Input
                type="number"
                value={section.settings.columns || 3}
                onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                min={1}
                max={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Gap</Label>
              <select
                value={section.settings.gap || 'md'}
                onChange={(e) => updateSetting('gap', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
          </>
        );

      case 'custom':
        return (
          <div className="space-y-2">
            <Label>Custom HTML/CSS</Label>
            <Textarea
              value={section.settings.html || ''}
              onChange={(e) => updateSetting('html', e.target.value)}
              placeholder="<div>Custom content...</div>"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        );

      default:
        return <p className="text-sm text-slate-500">No settings available for this section</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Section Settings</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Visible</Label>
          <Switch
            checked={section.visible !== false}
            onCheckedChange={(checked) => onUpdate({ visible: checked })}
          />
        </div>
        {renderSettings()}
      </CardContent>
    </Card>
  );
}