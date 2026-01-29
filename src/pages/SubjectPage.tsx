import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Book } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CodalProvision } from '@shared/types';
export function SubjectPage() {
  const navigate = useNavigate();
  const { data: codalsResponse } = useQuery<{ items: CodalProvision[] }>({
    queryKey: ['codals'],
    queryFn: () => api('/api/codals')
  });
  const codals = codalsResponse?.items || [];
  const subjects = Array.from(new Set(codals.map(c => c.subject)));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Codal Library</h1>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject} className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                <Book className="h-4 w-4 text-primary" /> {subject}
              </h2>
              <div className="space-y-2">
                {codals.filter(c => c.subject === subject).map(codal => (
                  <Card key={codal.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-serif">{codal.title}</CardTitle>
                      <CardDescription className="text-xs truncate">{codal.content}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}