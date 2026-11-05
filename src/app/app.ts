import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { UFS } from './core/data/ufs';
import { CalendarioFeriados, Feriado } from './core/models/calendario.model';
import { CalendarioService } from './core/services/calendario.service';

type FiltroFeriado = 'todos' | 'nacionais' | 'estaduais';

interface DiaCalendario {
  numero: number;
  iso: string;
}

interface MesCalendario {
  indice: number;
  nome: string;
  dias: (DiaCalendario | null)[];
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly calendarioService = inject(CalendarioService);
  private readonly recarregamentos = signal(0);
  private readonly dataAtual = new Date();

  readonly anoAtual = this.dataAtual.getFullYear();
  readonly hojeIso = `${this.anoAtual}-${String(this.dataAtual.getMonth() + 1).padStart(2, '0')}-${String(this.dataAtual.getDate()).padStart(2, '0')}`;

  readonly ufs = UFS;
  readonly diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  readonly ano = signal(this.anoAtual);
  readonly ufsSelecionadas = signal<string[]>([]);
  readonly pesquisaUf = signal('');
  readonly filtro = signal<FiltroFeriado>('todos');

  readonly resultado = signal<CalendarioFeriados | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);
  readonly erroFormulario = signal<string | null>(null);
  readonly dataSelecionada = signal<string | null>(null);

  readonly estadosFiltrados = computed(() => {
    const pesquisa = this.normalizar(this.pesquisaUf());
    return this.ufs.filter(estado => this.normalizar(`${estado.sigla} ${estado.nome}`).includes(pesquisa));
  });

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

  readonly feriadosPorData = computed(() => {
    const mapa = new Map<string, Feriado[]>();

    for (const feriado of this.feriadosExibidos()) {
      const lista = mapa.get(feriado.data) ?? [];
      lista.push(feriado);
      mapa.set(feriado.data, lista);
    }

    return mapa;
  });

  readonly feriadosDaDataSelecionada = computed(() => {
    const data = this.dataSelecionada();
    return data ? (this.feriadosPorData().get(data) ?? []) : [];
  });

  readonly meses = computed<MesCalendario[]>(() => {
    const ano = this.ano();

    return this.nomesMeses.map((nome, indice) => {
      const primeiroDia = new Date(Date.UTC(ano, indice, 1));
      const quantidadeDias = new Date(Date.UTC(ano, indice + 1, 0)).getUTCDate();
      const espacosIniciais = (primeiroDia.getUTCDay() + 6) % 7;
      const dias: (DiaCalendario | null)[] = [];

      for (let i = 0; i < espacosIniciais; i++) {
        dias.push(null);
      }

      for (let dia = 1; dia <= quantidadeDias; dia++) {
        const iso = `${ano}-${String(indice + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        dias.push({ numero: dia, iso });
      }

      return { indice, nome, dias };
    });
  });

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
      input.value = this.ano().toString();
      return;
    }

    this.erroFormulario.set(null);
    this.dataSelecionada.set(null);
    this.ano.set(novoAno);
  }

  navegarAno(direcao: number): void {
    const novoAno = this.ano() + direcao;

    if (novoAno < 1583 || novoAno > 9999) {
      return;
    }

    this.erroFormulario.set(null);
    this.dataSelecionada.set(null);
    this.ano.set(novoAno);
  }

  voltarAnoAtual(): void {
    this.erroFormulario.set(null);
    this.dataSelecionada.set(null);
    this.ano.set(this.anoAtual);
  }

  alterarPesquisaUf(evento: Event): void {
    this.pesquisaUf.set((evento.target as HTMLInputElement).value);
  }

  alternarUf(sigla: string): void {
    this.dataSelecionada.set(null);

    this.ufsSelecionadas.update(atuais =>
      atuais.includes(sigla)
        ? atuais.filter(uf => uf !== sigla)
        : [...atuais, sigla].sort()
    );
  }

  selecionarTodasUfs(): void {
    this.dataSelecionada.set(null);
    this.ufsSelecionadas.set(this.ufs.map(estado => estado.sigla).sort());
  }

  limparUfs(): void {
    this.dataSelecionada.set(null);
    this.ufsSelecionadas.set([]);
  }

  alterarFiltro(filtro: FiltroFeriado): void {
    this.filtro.set(filtro);
  }

  selecionarDia(data: string): void {
    this.dataSelecionada.set(this.dataSelecionada() === data ? null : data);
  }

  consultarNovamente(): void {
    this.recarregamentos.update(valor => valor + 1);
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}