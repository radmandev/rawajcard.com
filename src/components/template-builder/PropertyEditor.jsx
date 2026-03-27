import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Type, 
  Smartphone,
  Settings,
  Sparkles
} from 'lucide-react';

export default function PropertyEditor({
  selectedElement,
  theme,
  canvas,
  onUpdateElement,
  onUpdateTheme,
  onUpdateCanvas
}) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Global Theme
          </h2>
          <p className="text-xs text-slate-500">Customize colors & typography</p>
        </div>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full grid grid-cols-3 m-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="p-4 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Brand Colors</Label>
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key}>
                    <Label className="text-xs capitalize mb-1 block">{key.replace('_', ' ')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          onUpdateTheme({
                            ...theme,
                            colors: { ...theme.colors, [key]: e.target.value }
                          })
                        }
                        className="w-16 h-10 rounded cursor-pointer border"
                      />
                      <Input
                        value={value}
                        onChange={(e) =>
                          onUpdateTheme({
                            ...theme,
                            colors: { ...theme.colors, [key]: e.target.value }
                          })
                        }
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Label className="text-sm font-semibold">Color Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Teal', primary: '#0D7377', secondary: '#14274E', accent: '#F4B400' },
                    { name: 'Purple', primary: '#7C3AED', secondary: '#4C1D95', accent: '#EC4899' },
                    { name: 'Blue', primary: '#0EA5E9', secondary: '#0369A1', accent: '#F59E0B' },
                    { name: 'Red', primary: '#DC2626', secondary: '#7F1D1D', accent: '#F97316' },
                    { name: 'Green', primary: '#059669', secondary: '#064E3B', accent: '#10B981' },
                    { name: 'Indigo', primary: '#6366F1', secondary: '#4338CA', accent: '#818CF8' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onUpdateTheme({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: preset.primary,
                          secondary: preset.secondary,
                          accent: preset.accent
                        }
                      })}
                      className="group relative h-12 rounded-lg overflow-hidden border-2 hover:border-teal-500 transition-all"
                      title={preset.name}
                    >
                      <div className="flex h-full">
                        <div className="flex-1" style={{ backgroundColor: preset.primary }} />
                        <div className="flex-1" style={{ backgroundColor: preset.secondary }} />
                        <div className="flex-1" style={{ backgroundColor: preset.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Font Families</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-1 block">Heading Font</Label>
                      <Select
                        value={theme.fonts.heading}
                        onValueChange={(value) => onUpdateTheme({
                          ...theme,
                          fonts: { ...theme.fonts, heading: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                          <SelectItem value="Merriweather">Merriweather</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Body Font</Label>
                      <Select
                        value={theme.fonts.body}
                        onValueChange={(value) => onUpdateTheme({
                          ...theme,
                          fonts: { ...theme.fonts, body: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Label className="text-sm font-semibold">Global Styles</Label>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                    <Label className="text-xs font-semibold">Heading Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={parseInt(theme.globalStyles?.titleStyle?.fontSize || '24')}
                          onChange={(e) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              titleStyle: {
                                ...(theme.globalStyles?.titleStyle || {}),
                                fontSize: `${e.target.value}px`
                              }
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight</Label>
                        <Select
                          value={theme.globalStyles?.titleStyle?.fontWeight || '700'}
                          onValueChange={(value) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              titleStyle: {
                                ...(theme.globalStyles?.titleStyle || {}),
                                fontWeight: value
                              }
                            }
                          })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="400">Normal</SelectItem>
                            <SelectItem value="600">Semibold</SelectItem>
                            <SelectItem value="700">Bold</SelectItem>
                            <SelectItem value="800">Extra Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                    <Label className="text-xs font-semibold">Body Text Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={parseInt(theme.globalStyles?.textStyle?.fontSize || '16')}
                          onChange={(e) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              textStyle: {
                                ...(theme.globalStyles?.textStyle || {}),
                                fontSize: `${e.target.value}px`
                              }
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Line Height</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={parseFloat(theme.globalStyles?.textStyle?.lineHeight || '1.5')}
                          onChange={(e) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              textStyle: {
                                ...(theme.globalStyles?.textStyle || {}),
                                lineHeight: e.target.value
                              }
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                    <Label className="text-xs font-semibold">Button Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Radius</Label>
                        <Input
                          type="number"
                          value={parseInt(theme.globalStyles?.buttonStyle?.borderRadius || '8')}
                          onChange={(e) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              buttonStyle: {
                                ...(theme.globalStyles?.buttonStyle || {}),
                                borderRadius: `${e.target.value}px`
                              }
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Padding</Label>
                        <Input
                          value={theme.globalStyles?.buttonStyle?.padding || '12px 24px'}
                          onChange={(e) => onUpdateTheme({
                            ...theme,
                            globalStyles: {
                              ...theme.globalStyles,
                              buttonStyle: {
                                ...(theme.globalStyles?.buttonStyle || {}),
                                padding: e.target.value
                              }
                            }
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="canvas" className="p-4 space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Canvas Settings</Label>
                <div>
                  <Label className="text-xs mb-1 block">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={canvas.backgroundColor}
                      onChange={(e) => onUpdateCanvas({ ...canvas, backgroundColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      value={canvas.backgroundColor}
                      onChange={(e) => onUpdateCanvas({ ...canvas, backgroundColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Gradient (optional)</Label>
                  <Input
                    value={canvas.backgroundGradient || ''}
                    onChange={(e) => onUpdateCanvas({ ...canvas, backgroundGradient: e.target.value })}
                    placeholder="linear-gradient(to bottom, #fff, #f0f0f0)"
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Width (px)</Label>
                  <Input
                    type="number"
                    value={canvas.width}
                    onChange={(e) => onUpdateCanvas({ ...canvas, width: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    );
  }

  const updateStyles = (key, value) => {
    onUpdateElement({
      styles: { ...selectedElement.styles, [key]: value }
    });
  };

  const updateContent = (key, value) => {
    onUpdateElement({
      content: { ...selectedElement.content, [key]: value }
    });
  };

  const updateResponsive = (key, value) => {
    onUpdateElement({
      responsive: { ...selectedElement.responsive, [key]: value }
    });
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="text-xs text-slate-500 capitalize">{selectedElement.type.replace('_', ' ')}</p>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="style">
              <Palette className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="content">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="responsive">
              <Smartphone className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="p-4 space-y-4">
            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-xs">Font Size</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[parseInt(selectedElement.styles.fontSize) || 16]}
                  onValueChange={(val) => updateStyles('fontSize', `${val[0]}px`)}
                  min={10}
                  max={60}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={parseInt(selectedElement.styles.fontSize) || 16}
                  onChange={(e) => updateStyles('fontSize', `${e.target.value}px`)}
                  className="w-16"
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={selectedElement.styles.color || theme.colors.text}
                onChange={(e) => updateStyles('color', e.target.value)}
                className="w-full h-10"
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={selectedElement.styles.background || 'transparent'}
                onChange={(e) => updateStyles('background', e.target.value)}
                className="w-full h-10"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <Label className="text-xs">Border Radius</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[parseInt(selectedElement.styles.borderRadius) || 0]}
                  onValueChange={(val) => updateStyles('borderRadius', `${val[0]}px`)}
                  min={0}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={parseInt(selectedElement.styles.borderRadius) || 0}
                  onChange={(e) => updateStyles('borderRadius', `${e.target.value}px`)}
                  className="w-16"
                />
              </div>
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <Label className="text-xs">Padding</Label>
              <Input
                value={selectedElement.styles.padding || '0'}
                onChange={(e) => updateStyles('padding', e.target.value)}
                placeholder="e.g., 16px or 1rem"
              />
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <Label className="text-xs">Margin</Label>
              <Input
                value={selectedElement.styles.margin || '0 auto'}
                onChange={(e) => updateStyles('margin', e.target.value)}
                placeholder="e.g., 16px auto"
              />
            </div>

            {/* Text Align */}
            <div className="space-y-2">
              <Label className="text-xs">Text Align</Label>
              <select
                value={selectedElement.styles.textAlign || 'center'}
                onChange={(e) => updateStyles('textAlign', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="content" className="p-4 space-y-4">
            {selectedElement.type.includes('button') && (
              <div className="space-y-2">
                <Label className="text-xs">Button Label</Label>
                <Input
                  value={selectedElement.content.label || ''}
                  onChange={(e) => updateContent('label', e.target.value)}
                  placeholder="Button text"
                />
              </div>
            )}

            {selectedElement.type === 'profile_image' && (
              <div className="space-y-2">
                <Label className="text-xs">Image Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[selectedElement.styles.size || 120]}
                    onValueChange={(val) => updateStyles('size', val[0])}
                    min={60}
                    max={200}
                    step={10}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={selectedElement.styles.size || 120}
                    onChange={(e) => updateStyles('size', parseInt(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'spacer' && (
              <div className="space-y-2">
                <Label className="text-xs">Height</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[parseInt(selectedElement.styles.height) || 24]}
                    onValueChange={(val) => updateStyles('height', val[0])}
                    min={8}
                    max={200}
                    step={8}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={parseInt(selectedElement.styles.height) || 24}
                    onChange={(e) => updateStyles('height', parseInt(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'social_links' && (
              <div className="flex items-center justify-between">
                <Label className="text-xs">Colorful Icons</Label>
                <Switch
                  checked={selectedElement.styles.colorful || false}
                  onCheckedChange={(checked) => updateStyles('colorful', checked)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="responsive" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Hide on Mobile</Label>
              <Switch
                checked={selectedElement.responsive?.hideOnMobile || false}
                onCheckedChange={(checked) => updateResponsive('hideOnMobile', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Hide on Desktop</Label>
              <Switch
                checked={selectedElement.responsive?.hideOnDesktop || false}
                onCheckedChange={(checked) => updateResponsive('hideOnDesktop', checked)}
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Use these settings to create responsive designs that look great on all devices
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}