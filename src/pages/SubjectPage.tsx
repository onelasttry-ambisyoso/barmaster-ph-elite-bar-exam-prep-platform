import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, BookOpen, GraduationCap, FilePlus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { CodalProvision, Subject } from '@shared/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from 'sonner';
export function SubjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [source, setSource] = useState<'official' | 'user'>('official');
  const currentSubject = (searchParams.get('subject') as Subject) || 'Civil Law';
  const { data: codalsResponse, isLoading } = useQuery<{ items: CodalProvision[] }>({
    queryKey: ['codals'],
    queryFn: () => api('/api/codals')
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/codals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codals'] });
      toast.success('Provision deleted');
    }
  });
  const subjects = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'] as Subject[];
  const filteredCodals = useMemo(() => {
    const codals = codalsResponse?.items || [];
    return codals.filter(c => {
      const matchesSubject = c.subject === currentSubject;
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = source === 'official' ? c.isOfficial : !c.isOfficial;
      return matchesSubject && matchesSearch && matchesSource;
    });
  }, [codalsResponse, currentSubject, searchQuery, source]);
  return (
    <AppLayout container>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Legal Repository</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Codal Library</h1>
            <p className="text-muted-foreground text-sm font-medium">Browse and master the fundamental laws of the Philippines.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search provisions..."
                  className="pl-9 bg-secondary/50 border-none ring-offset-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <Button className="rounded-xl font-bold gap-2 h-10 shadow-lg" onClick={() => navigate('/codals-editor')}>
                <FilePlus className="h-4 w-4" /> Add Custom
             </Button>
          </div>
        </header>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-2 rounded-2xl border">
           <div className="flex gap-1">
              <Button 
                variant={source === 'official' ? 'default' : 'ghost'} 
                className="rounded-xl font-bold text-xs h-8"
                onClick={() => setSource('official')}
              >
                Official Provisions
              </Button>
              <Button 
                variant={source === 'user' ? 'default' : 'ghost'} 
                className="rounded-xl font-bold text-xs h-8"
                onClick={() => setSource('user')}
              >
                My Provisions
              </Button>
           </div>
           <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">
              Showing {filteredCodals.length} Records
           </div>
        </div>
        <Tabs
          defaultValue={currentSubject}
          onValueChange={(val) => setSearchParams({ subject: val })}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-2 min-w-max">
              {subjects.map(s => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider"
                >
                  {s}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={currentSubject} className="mt-0 outline-none">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-3xl" />)}
              </div>
            ) : filteredCodals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCodals.map(codal => (
                  <Card key={codal.id} className="group relative border-2 hover:border-primary/50 transition-all duration-300 shadow-sm rounded-3xl overflow-hidden flex flex-col bg-card/50">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-muted border-none">
                          {codal.reference}
                        </Badge>
                        {!codal.isOfficial && (
                           <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-tighter rounded-sm">User Item</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif font-black group-hover:text-primary transition-colors line-clamp-1">
                        {codal.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                      <CardDescription className="text-sm line-clamp-4 mb-8 italic leading-relaxed font-medium">
                        "{codal.content}"
                      </CardDescription>
                      <div className="flex gap-2 relative z-10">
                        <Button
                          className="flex-1 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest shadow-inner h-10"
                          onClick={() => navigate('/practice')}
                        >
                          <GraduationCap className="h-3 w-3" /> Master Now
                        </Button>
                        {!codal.isOfficial && (
                          <div className="flex gap-1">
                             <Button variant="outline" size="icon" className="rounded-xl h-10 w-10" onClick={() => navigate('/codals-editor')}>
                               <Pencil className="h-3.5 w-3.5" />
                             </Button>
                             <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 text-destructive" onClick={() => deleteMutation.mutate(codal.id)}>
                               <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed rounded-[3rem] bg-muted/10">
                <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-xl font-black tracking-tight">Zero matching provisions</h3>
                <p className="text-muted-foreground text-sm mt-2 font-medium">Switch to 'Official' or add a custom entry for this subject.</p>
                <Button variant="link" className="mt-4 font-bold" onClick={() => setSource('official')}>View Official Codals</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}