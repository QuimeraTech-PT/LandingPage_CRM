import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, AlertTriangle, CheckCircle2, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectReportProps {
  project: any;
  transactions: any[];
}

export function ProjectReport({ project, transactions }: ProjectReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Group transactions by category for expenses only
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.project_id === project.id)
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Geral';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.project_id === project.id)
    .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const margin = totalIncome - totalExpenses;
  const marginPercent = totalIncome > 0 ? (margin / totalIncome) * 100 : 0;
  
  const budget = project.budget || 0;
  const budgetAlert = budget > 0 && totalExpenses > budget;
  const budgetRisk = budget > 0 && totalExpenses > (budget * 0.8) && !budgetAlert;

  const handleDownload = async () => {
    // Import html2pdf dynamically to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Relatorio_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.promise(html2pdf().from(element).set(opt).save(), {
      loading: 'A gerar PDF...',
      success: 'Relatório guardado!',
      error: 'Erro ao gerar PDF.'
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 text-xs h-7"
        onClick={handleDownload}
      >
        <FileDown className="h-3.5 w-3.5" />
        Gerar Relatório
      </Button>

      {/* Hidden Report Template */}
      <div className="hidden">
        <div 
          ref={reportRef} 
          className="p-10 bg-white text-slate-900 font-sans w-[210mm] min-h-[297mm]"
          style={{ 
            fontFamily: "'Inter', sans-serif",
            color: '#0f172a' 
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-black tracking-tighter text-blue-900 uppercase">QuimeraTech</h1>
              </div>
              <p className="text-sm text-slate-500 font-medium italic">Relatório Mensal de Performance e Custos</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-bold text-slate-700">Data de Emissão</p>
              <p className="text-slate-500">{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-l-4 border-blue-600 pl-3">Detalhes do Projeto</h2>
              <div className="space-y-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nome:</span>
                  <span className="font-semibold text-slate-800">{project.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="font-semibold text-slate-800 capitalize">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Início:</span>
                  <span className="font-semibold text-slate-800">{project.start_date ? new Date(project.start_date).toLocaleDateString('pt-PT') : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-l-4 border-emerald-600 pl-3">Dashboard Financeiro</h2>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Receita Total</p>
                  <p className="text-lg font-black text-emerald-600">
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalIncome)}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Margem Atual</p>
                  <p className={cn(
                    "text-lg font-black",
                    margin >= 0 ? "text-blue-600" : "text-rose-600"
                  )}>
                    {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(margin)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Status Section */}
          <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
            {budgetAlert && (
              <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Orçamento Ultrapassado
              </div>
            )}
            
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-slate-700" />
              Estado do Orçamento
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span>Progresso Financeiro</span>
                <span className={cn(budgetAlert ? "text-rose-600" : budgetRisk ? "text-amber-600" : "text-emerald-600")}>
                  {Math.round((totalExpenses / (budget || 1)) * 100)}%
                </span>
              </div>
              
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    budgetAlert ? "bg-rose-500" : budgetRisk ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min((totalExpenses / (budget || 1)) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Despesas Reais: {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalExpenses)}</span>
                <span>Orçamento Previsto: {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(budget)}</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 border-l-4 border-blue-900 pl-3">Breakdown de Despesas por Categoria</h2>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-widest border-b border-slate-200">
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor Gasto</th>
                  <th className="py-3 px-4 text-right">% do Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(expensesByCategory).map(([cat, amount]) => (
                  <tr key={cat} className="hover:bg-slate-50/50">
                    <td className="py-4 px-4 font-semibold text-slate-700">{cat}</td>
                    <td className="py-4 px-4 text-right font-medium">
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount)}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-500">
                      {Math.round((amount / totalExpenses) * 100)}%
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
                {Object.keys(expensesByCategory).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400 italic">Nenhuma despesa registada para este projeto.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Notes */}
          <div className="mt-auto border-t border-slate-100 pt-6 flex justify-between items-end opacity-60">
            <div className="text-[10px] text-slate-400 max-w-[60%]">
              <p className="font-bold mb-1 underline">Nota de Confidencialidade</p>
              <p>Este relatório contém informações financeiras confidenciais proprietárias da QuimeraTech. O acesso não autorizado ou a partilha sem consentimento é estritamente proibida.</p>
            </div>
            <div className="text-right flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by CRM Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
