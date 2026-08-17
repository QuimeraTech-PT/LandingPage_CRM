import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, getProjects, createTransaction } from '@/lib/crm.functions';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Calendar, Briefcase, Filter, Search, FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/finances')({
  component: FinancesPage,
});

function FinancesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: transactions } = useSuspenseQuery({
    queryKey: ['crm-transactions'],
    queryFn: () => getTransactions(),
  });

  const { data: projects } = useSuspenseQuery({
    queryKey: ['crm-projects'],
    queryFn: () => getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
      setIsCreateOpen(false);
      toast.success('Transação registada!');
    },
    onError: () => toast.error('Erro ao registar transação.')
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      data: {
        description: formData.get('description') as string,
        amount: Number(formData.get('amount')),
        type: formData.get('type') as 'income' | 'expense',
        date: formData.get('date') as string,
        due_date: formData.get('due_date') as string || null,
        project_id: formData.get('project_id') === 'none' ? null : (formData.get('project_id') as string),
        category: formData.get('category') as string,
        status: formData.get('status') as string || 'pending',
        invoice_url: formData.get('invoice_url') as string || null,
      }
    });
  };

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += Number(t.amount);
    else acc.expense += Number(t.amount);
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          Gestão Financeira
        </h1>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-white/10 text-foreground">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Registar Transação</DialogTitle>
                <DialogDescription>Adicione uma nova entrada ou saída de caixa.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" name="description" placeholder="Ex: Pagamento Projeto X" required className="bg-muted/50 border-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor (€)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="1000.00" required className="bg-muted/50 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" defaultValue="income">
                      <SelectTrigger className="bg-muted/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-foreground">
                        <SelectItem value="income">Receita (Entrada)</SelectItem>
                        <SelectItem value="expense">Despesa (Saída)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data de Registo</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="bg-muted/50 border-white/10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input id="due_date" name="due_date" type="date" className="bg-muted/50 border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select name="status" defaultValue="pending">
                      <SelectTrigger className="bg-muted/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-foreground">
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Em Atraso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" name="category" placeholder="Ex: Software, Hardware" className="bg-muted/50 border-white/10" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoice_url">Link da Fatura / Comprovativo</Label>
                  <Input id="invoice_url" name="invoice_url" placeholder="https://..." className="bg-muted/50 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project_id">Projeto Associado</Label>
                  <Select name="project_id" defaultValue="none">
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-foreground">
                      <SelectItem value="none">Sem projeto (Geral)</SelectItem>
                      {projects?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "A guardar..." : "Registar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totals.income)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totals.expense)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totals.income - totals.expense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{t.description}</h4>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(t.date).toLocaleDateString('pt-PT')}</span>
                      {t.due_date && <span className={`flex items-center gap-1 ${t.status !== 'paid' && new Date(t.due_date) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                        <Clock className="h-3 w-3" /> Vence: {new Date(t.due_date).toLocaleDateString('pt-PT')}
                      </span>}
                      {t.crm_projects && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {t.crm_projects.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <div className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(t.amount)}
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] px-1.5 py-0",
                      t.status === 'paid' ? "text-green-500 border-green-500/20" : 
                      t.status === 'overdue' || (t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()) ? "text-red-500 border-red-500/20" : 
                      "text-yellow-500 border-yellow-500/20"
                    )}>
                      {t.status === 'paid' ? 'Pago' : t.status === 'overdue' || (t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()) ? 'Em Atraso' : 'Pendente'}
                    </Badge>
                  </div>
                  {t.invoice_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                      <a href={t.invoice_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma transação registada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
