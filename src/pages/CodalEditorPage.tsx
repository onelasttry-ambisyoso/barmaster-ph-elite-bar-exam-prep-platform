import React, { useState, useEffect } from 'react';
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
import { FilePlus, Pencil, Trash2, Search, Book, Sparkles, Loader2, Tag } from 'lucide-react';
import type { CodalProvision, Subject, Difficulty } from '@shared/types';
import { toast } from 'sonner';
const SUBJECTS: Subject[] = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'];
export function CodalEditorPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
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
  useEffect(() => {
    if (formData.tags) {
      setTagInput(formData.tags.join(', '));
    }
  }, [editingId, formData.tags]);
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
      toast.success(editingId ? 'Provision updated' : 'Provision committed to repository');
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
    setTagInput('');
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
    if (!formData.title?.trim() || !formData.content?.trim()) {
      return toast.error('Title and content are required');
    }
    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');
    mutation.mutate({ ...formData, tags });
  };
  return (
    <AppLayout container>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Personal Repository</h2>
            <p className="text-sm text-muted-foreground font-medium">Manage your custom legal library.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter my items..."
              className="pl-9 bg-accent/30 border-none h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-3 h-[550px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? [1,2,3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />) :
             filteredUserCodals.map(c => (
              <Card 
                key={c.id} 
                className={`group cursor-pointer hover:border-primary/50 transition-all rounded-2xl ${editingId === c.id ? 'border-primary ring-1 ring-primary bg-accent/20' : ''}`} 
                onClick={() => startEdit(c)}
              >
                <CardHeader className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[9px] uppercase font-black bg-background">{c.subject}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); startEdit(c); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(c.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-black truncate">{c.title}</CardTitle>
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[8px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{t}</span>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
            {!isLoading && filteredUserCodals.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground italic text-sm font-medium">No custom provisions yet.</p>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full h-12 rounded-2xl font-bold gap-2 border-2 hover:bg-accent" onClick={resetForm}>
            <FilePlus className="h-4 w-4" /> New Provision Draft
          </Button>
        </div>
        <div className="lg:col-span-8">
          <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b bg-muted/10 p-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Recall Engine Editor</span>
              </div>
              <CardTitle className="text-4xl font-black tracking-tight">
                {editingId ? 'Refine Provision' : 'Draft New Law'}
              </CardTitle>
              <CardDescription className="text-base font-medium">Ensure exact wording for effective active recall training.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wider opacity-60">Provision Name</Label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Article 123, Civil Code"
                    className="h-12 text-lg font-serif border-2 focus-visible:ring-primary rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wider opacity-60">Source / Reference</Label>
                  <Input
                    value={formData.reference}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g. R.A. No. 386"
                    className="h-12 border-2 focus-visible:ring-primary rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs font-black uppercase tracking-wider opacity-60">Bar Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(val: Subject) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger className="h-12 border-2 rounded-xl">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs font-black uppercase tracking-wider opacity-60">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(val: Difficulty) => setFormData({ ...formData, difficulty: val })}
                  >
                    <SelectTrigger className="h-12 border-2 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-xs font-black uppercase tracking-wider opacity-60 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Tags (csv)
                  </Label>
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="e.g. property, contracts"
                    className="h-12 border-2 focus-visible:ring-primary rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider opacity-60">Legal Text (Verbatim)</Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="The exact text you want to memorize..."
                  className="min-h-[280px] text-lg font-mono leading-relaxed border-2 focus-visible:ring-primary p-6 rounded-2xl"
                />
              </div>
              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20" 
                  onClick={handleSave} 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {editingId ? 'Update Repository Record' : 'Commit to Mastery Queue'}
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl font-bold border-2" onClick={resetForm}>Discard</Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8 p-6 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10">
             <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                   <Book className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                   <h4 className="font-black text-sm uppercase tracking-tight">Pedagogical Advice</h4>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
                     Spaced repetition is most effective for "atomic" facts. If a provision is longer than 100 words, consider splitting it into logical sub-sections to prevent cognitive overload.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}