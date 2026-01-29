import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { CodalProvision, Subject } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
export function SubjectPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const currentSubject = (searchParams.get('subject') as Subject) || 'Civil Law';
  const { data: codalsResponse, isLoading } = useQuery<{ items: CodalProvision[] }>({
    queryKey: ['codals'],
    queryFn: () => api('/api/codals')
  });
  const subjects = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'] as Subject[];
  const filteredCodals = useMemo(() => {
    const codals = codalsResponse?.items || [];
    return codals.filter(c => {
      const matchesSubject = c.subject === currentSubject;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [codalsResponse, currentSubject, searchQuery]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Repository</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Codal Library</h1>
            <p className="text-muted-foreground mt-1">Browse and master the fundamental laws of the Philippines.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search provisions..."
              className="pl-9 bg-secondary/50 border-none ring-offset-background focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>
        <Tabs
          defaultValue={currentSubject}
          onValueChange={(val) => setSearchParams({ subject: val })}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-2 min-w-max">
              {subjects.map(s => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border px-4 py-2 rounded-full text-xs font-semibold"
                >
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={currentSubject} className="mt-0 outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : filteredCodals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCodals.map(codal => (
                  <Card key={codal.id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase mb-2">
                          {codal.reference}
                        </Badge>
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none text-[10px]">
                          Learning
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-serif font-bold group-hover:text-primary transition-colors">
                        {codal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
                      <CardDescription className="text-sm line-clamp-3 mb-6 italic leading-relaxed">
                        "{codal.content}"
                      </CardDescription>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 rounded-full gap-2 text-xs font-bold"
                          onClick={() => navigate('/practice')}
                        >
                          <GraduationCap className="h-3 w-3" /> Master Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border"
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold">No provisions found</h3>
                <p className="text-muted-foreground text-sm">Try a different search term or subject.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}