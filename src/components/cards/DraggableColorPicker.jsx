import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical } from 'lucide-react';

export default function DraggableColorPicker({ colors, onColorsChange, isRTL }) {
  const colorItems = [
    { id: 'primary', label: isRTL ? 'اللون الأساسي' : 'Primary Color', value: colors.primary },
    { id: 'secondary', label: isRTL ? 'اللون الثانوي' : 'Secondary Color', value: colors.secondary },
    { id: 'accent', label: isRTL ? 'اللون المميز' : 'Accent Color', value: colors.accent }
  ];

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(colorItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Swap the color values based on new order
    const newColors = {
      primary: items[0].value,
      secondary: items[1].value,
      accent: items[2].value
    };
    onColorsChange(newColors);
  };

  const handleColorChange = (colorId, newValue) => {
    onColorsChange({
      ...colors,
      [colorId]: newValue
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="colors">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {colorItems.map((color, index) => (
              <Draggable key={color.id} draggableId={color.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 transition-all ${
                      snapshot.isDragging 
                        ? 'border-teal-400 shadow-lg' 
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-5 w-5 text-slate-400" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm font-medium">{color.label}</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={color.value}
                          onChange={(e) => handleColorChange(color.id, e.target.value)}
                          className="h-10 w-16 rounded cursor-pointer border-2 border-slate-200 dark:border-slate-700"
                        />
                        <Input
                          value={color.value}
                          onChange={(e) => handleColorChange(color.id, e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div 
                      className="h-12 w-12 rounded-lg border-2 border-white shadow-md"
                      style={{ backgroundColor: color.value }}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}