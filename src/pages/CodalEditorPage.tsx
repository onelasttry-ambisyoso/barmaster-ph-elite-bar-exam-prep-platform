import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FilePlus, Pencil, Trash2, Search, Book, Sparkles } from 'lucide-react';
import type { CodalProvision, Subject, Difficulty } from '@shared/types';
import { toast } from 'sonner';
const SUBJECTS: Subject[] = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'];
export function CodalEditorPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<Partial<CodalProvision>>({
    title: '',
    content: '',
    reference: '',
    subject: 'Civil Law',
    difficulty: 'Medium',
    tags: []
  });
  const { data: codalsResponse, isLoading } = useQuery<{ items: CodalProvision[] }>({
    queryKey: ['codals'],
    queryFn: () => api('/api/codals')
  });
  const userCodals = (codalsResponse?.items || []).filter(c => !c.isOfficial && c.ownerId === 'dev-user');
  const filteredUserCodals = userCodals.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.content.toLowerCase().includes(search.toLowerCase())
  );
  const mutation = useMutation({
    mutationFn: (data: Partial<CodalProvision>) => {
      const isUpdate = !!editingId;
      return api(`/api/codals${isUpdate ? `/${editingId}` : ''}`, {
        method: isUpdate ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codals'] });
      toast.success(editingId ? 'Provision updated' : 'Provision created');
      resetForm();
    },
    onError: (e: any) => toast.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/codals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codals'] });
      toast.success('Provision deleted');
    }
  });
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      reference: '',
      subject: 'Civil Law',
      difficulty: 'Medium',
      tags: []
    });
  };
  const startEdit = (codal: CodalProvision) => {
    setEditingId(codal.id);
    setFormData(codal);
  };
  const handleSave = () => {
    if (!formData.title || !formData.content) return toast.error('Title and content required');
    mutation.mutate(formData);
  };
  return (
    <AppLayout container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Personal Repository</h2>
            <p className="text-sm text-muted-foreground">Manage your custom codal provisions and obscure laws.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search my provisions..." 
              className="pl-9 bg-accent/30 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? [1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />) : 
             filteredUserCodals.map(c => (
              <Card key={c.id} className={`group cursor-pointer hover:border-primary/50 transition-all ${editingId === c.id ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => startEdit(c)}>
                <CardHeader className="p-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{c.subject}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEdit(c); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(c.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-bold truncate">{c.title}</CardTitle>
                </CardHeader>
              </Card>
            ))}
            {!isLoading && filteredUserCodals.length === 0 && (
              <div className="text-center py-10 opacity-50 italic text-sm">No provisions found.</div>
            )}
          </div>
          <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2" onClick={resetForm}>
            <FilePlus className="h-4 w-4" /> Add New Provision
          </Button>
        </div>
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Zen Editor</span>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight">
                {editingId ? 'Refine Provision' : 'Draft New Law'}
              </CardTitle>
              <CardDescription>Use legal formatting. Accuracy is paramount for spaced repetition.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Provision Title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                    placeholder="e.g. Article 123" 
                    className="h-12 text-lg font-serif border-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Legal Reference</Label>
                  <Input 
                    value={formData.reference} 
                    onChange={e => setFormData({ ...formData, reference: e.target.value })} 
                    placeholder="e.g. Civil Code of the Philippines" 
                    className="h-12 border-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Bar Subject</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(val: Subject) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Memory Difficulty</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(val: Difficulty) => setFormData({ ...formData, difficulty: val })}
                  >
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy (Known Concept)</SelectItem>
                      <SelectItem value="Medium">Medium (Standard)</SelectItem>
                      <SelectItem value="Hard">Hard (Verbatim Heavy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Legal Text (Verbatim)</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({ ...formData, content: e.target.value })} 
                  placeholder="Paste the provision text here..." 
                  className="min-h-[300px] text-lg font-mono leading-relaxed border-2 focus-visible:ring-primary p-6"
                />
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <Button size="lg" className="flex-1 h-14 text-lg font-black rounded-2xl" onClick={handleSave} disabled={mutation.isPending}>
                  {editingId ? 'Update Record' : 'Commit to Repository'}
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 p-6 bg-accent/30 rounded-3xl border border-dashed border-primary/20">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <Book className="h-6 w-6 text-primary" />
                </div>
                <div>
                   <h4 className="font-bold">Drafting Tip</h4>
                   <p className="text-xs text-muted-foreground">Keep provisions concise. For very long articles, split them into Section A/B/C to maintain high retention efficacy.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}