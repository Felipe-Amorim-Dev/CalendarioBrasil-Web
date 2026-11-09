import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CalendarioAnual } from './components/calendario-anual/calendario-anual';
import { FiltrosFeriados } from './components/filtros-feriados/filtros-feriados';
import { CalendarioFeriados, FiltroFeriado } from './core/models/calendario.model';
import { CalendarioService } from './core/services/calendario.service';
import { DatabricksPanel } from './components/databricks-panel/databricks-panel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarioAnual, DatabricksPanel, FiltrosFeriados],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly calendarioService = inject(CalendarioService);
  private readonly recarregamentos = signal(0);

  readonly anoAtual = new Date().getFullYear();
  readonly hojeIso = this.obterHojeIso();

  readonly ano = signal(this.anoAtual);
  readonly ufsSelecionadas = signal<string[]>([]);
  readonly filtro = signal<FiltroFeriado>('todos');

  readonly resultado = signal<CalendarioFeriados | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly erroFormulario = signal<string | null>(null);  

  readonly totalNacionais = computed(() => (this.resultado()?.feriados ?? []).filter(feriado => feriado.abrangencia === 'Nacional').length);
  readonly totalEstaduais = computed(() => (this.resultado()?.feriados ?? []).filter(feriado => feriado.abrangencia === 'Estadual').length);

  readonly feriadosExibidos = computed(() => {
    const feriados = this.resultado()?.feriados ?? [];

    if (this.filtro() === 'nacionais') {
      return feriados.filter(feriado => feriado.abrangencia === 'Nacional');
    }

    if (this.filtro() === 'estaduais') {
      return feriados.filter(feriado => feriado.abrangencia === 'Estadual');
    }

    return feriados;
  });  

  readonly mostrarDatabricks = signal(false);

  constructor() {
    effect(onCleanup => {
      const ano = this.ano();
      const ufs = this.ufsSelecionadas();
      this.recarregamentos();

      this.carregando.set(true);
      this.erro.set(null);
      this.resultado.set(null);

      const assinatura = this.calendarioService.consultar(ano, ufs).subscribe({
        next: dados => {
          this.resultado.set(dados);
          this.carregando.set(false);
        },
        error: (erro: HttpErrorResponse) => {
          this.resultado.set(null);
          this.carregando.set(false);
          this.erro.set(erro.status === 0
            ? 'Não foi possível conectar à API CalendarioBrasil.'
            : `Erro na consulta dos feriados. HTTP ${erro.status}.`);
        }
      });

      onCleanup(() => assinatura.unsubscribe());
    });
  }

  alterarAno(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const novoAno = input.valueAsNumber;

    if (!Number.isInteger(novoAno) || novoAno < 1583 || novoAno > 9999) {
      this.erroFormulario.set('Informe um ano entre 1583 e 9999.');
      input.value = String(this.ano());
      return;
    }

    this.erroFormulario.set(null);    
    this.ano.set(novoAno);
  }

  navegarAno(direcao: number): void {
    const novoAno = this.ano() + direcao;

    if (novoAno < 1583 || novoAno > 9999) {
      return;
    }

    this.erroFormulario.set(null);
    this.ano.set(novoAno);
  }

  voltarAnoAtual(): void {
    this.erroFormulario.set(null);    
    this.ano.set(this.anoAtual);
  }

  atualizarUfs(ufs: string[]): void {    
    this.ufsSelecionadas.set([...ufs].sort());
  }

  atualizarFiltro(filtro: FiltroFeriado): void {
    this.filtro.set(filtro);
  } 

  consultarNovamente(): void {
    this.recarregamentos.update(valor => valor + 1);
  }

  private obterHojeIso(): string {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  }

  alternarDatabricks(): void {
    this.mostrarDatabricks.update(valor => !valor);
  }
}