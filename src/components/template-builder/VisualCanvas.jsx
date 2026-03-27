import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, Move, Copy } from 'lucide-react';
import CanvasElement from './CanvasElement';

export default function VisualCanvas({
  elements,
  canvas,
  theme,
  viewMode,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements
}) {
  const canvasWidth = viewMode === 'mobile' ? 390 : 800;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorderElements(result.source.index, result.destination.index);
  };

  return (
    <div className="flex justify-center items-start min-h-full">
      <div
        className="relative shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900"
        style={{
          width: canvasWidth,
          minHeight: 700,
          background: canvas.backgroundGradient || canvas.backgroundColor,
          transition: 'width 0.3s ease'
        }}
      >
        {/* Phone notch for mobile view */}
        {viewMode === 'mobile' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="canvas">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative"
                style={{
                  minHeight: 700,
                  paddingTop: viewMode === 'mobile' ? 40 : 0,
                  background: snapshot.isDraggingOver ? 'rgba(13, 115, 119, 0.05)' : 'transparent'
                }}
              >
                {elements.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center text-slate-400">
                      <Move className="h-12 w-12 mx-auto mb-3" />
                      <p>Drag elements here to start building</p>
                    </div>
                  </div>
                ) : (
                  elements.map((element, index) => (
                    <Draggable key={element.id} draggableId={element.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative group ${
                            selectedElement === element.id ? 'ring-2 ring-teal-500' : ''
                          }`}
                          onClick={() => onSelectElement(element.id)}
                          style={{
                            display: (viewMode === 'mobile' && element.responsive?.hideOnMobile) ||
                                    (viewMode === 'desktop' && element.responsive?.hideOnDesktop)
                              ? 'none'
                              : 'block',
                            ...provided.draggableProps.style
                          }}
                        >
                          {/* Element Controls */}
                          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
                            <button
                              {...provided.dragHandleProps}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <Move className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteElement(element.id);
                              }}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>

                          <CanvasElement
                            element={element}
                            theme={theme}
                            onUpdate={(updates) => onUpdateElement(element.id, updates)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Rawajcard Badge (Mandatory) */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs opacity-50">
          Powered by Rawajcard
        </div>
      </div>
    </div>
  );
}