import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, User, Briefcase } from 'lucide-react';
import CanvasElement from './CanvasElement';

export default function PreviewDialog({ elements, canvas, theme, onClose }) {
  const [testData, setTestData] = useState('normal');

  const sampleData = {
    normal: {
      name: 'Ahmed Mohammed',
      job_title: 'Marketing Director',
      company: 'Rawaj Co.',
      bio: 'Digital marketing and strategy specialist with 10 years of experience',
      email: 'ahmed@rawaj.com',
      phone: '+966 50 123 4567',
      location: 'Riyadh, Saudi Arabia'
    },
    empty: {
      name: '',
      job_title: '',
      company: '',
      bio: '',
      email: '',
      phone: '',
      location: ''
    },
    long: {
      name: 'Dr. Ahmed Mohammed Abdullah Al-Rashid Al-Otaibi',
      job_title: 'Senior Executive Marketing Director and Business Development Manager',
      company: 'Rawaj International Marketing and Consulting Services Company LLC',
      bio: 'A highly experienced marketing professional with extensive background in digital marketing, brand strategy, business development, and international market expansion across multiple industries and regions',
      email: 'ahmed.mohammed@rawajinternational.com',
      phone: '+966 50 123 4567',
      location: 'Riyadh, Kingdom of Saudi Arabia'
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Template Preview</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={testData} onValueChange={setTestData} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="normal">Normal Data</TabsTrigger>
            <TabsTrigger value="empty">Empty Data</TabsTrigger>
            <TabsTrigger value="long">Long Names</TabsTrigger>
          </TabsList>

          <TabsContent value={testData} className="flex-1 overflow-auto p-6">
            <div className="flex justify-center">
              <div
                className="shadow-2xl rounded-3xl overflow-hidden"
                style={{
                  width: 390,
                  background: canvas.backgroundGradient || canvas.backgroundColor
                }}
              >
                {elements.map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={{
                      ...element,
                      content: {
                        ...element.content,
                        // Replace dynamic fields with sample data
                        ...sampleData[testData]
                      }
                    }}
                    theme={theme}
                    onUpdate={() => {}}
                  />
                ))}
                
                {/* Mandatory Rawajcard Badge */}
                <div className="p-4 text-center">
                  <div className="inline-block bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs opacity-50">
                    Powered by Rawajcard
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            💡 Test your template with different data scenarios to ensure it looks great in all cases
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}