import { Component, computed, HostListener, input, OnDestroy, signal } from '@angular/core';
import { Feriado } from '../../core/models/calendario.model';

interface DiaCalendario {
  numero: number;
  iso: string;
}

interface MesCalendario {
  indice: number;
  nome: string;
  dias: (DiaCalendario | null)[];
}

interface BalaoFeriado {
  data: string;
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  acima: boolean;
}

@Component({
  selector: 'app-calendario-anual',
  standalone: true,
  imports: [],
  templateUrl: './calendario-anual.html',
  styleUrl: './calendario-anual.scss'
})
export class CalendarioAnual implements OnDestroy {
  readonly ano = input.required<number>();
  readonly hojeIso = input.required<string>();
  readonly feriados = input.required<readonly Feriado[]>();

  readonly diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  readonly balao = signal<BalaoFeriado | null>(null);
  readonly dataFixada = signal<string | null>(null);

  private temporizador: ReturnType<typeof setTimeout> | null = null;

  readonly feriadosPorData = computed(() => {
    const mapa = new Map<string, Feriado[]>();

    for (const feriado of this.feriados()) {
      const existentes = mapa.get(feriado.data) ?? [];
      existentes.push(feriado);
      mapa.set(feriado.data, existentes);
    }

    return mapa;
  });

  readonly feriadosDoBalao = computed(() => {
    const data = this.balao()?.data;
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

  abrirBalao(evento: Event, data: string): void {
    const feriados = this.feriadosPorData().get(data);

    if (!feriados?.length) {
      this.fecharBalao();
      return;
    }

    const elemento = evento.currentTarget;

    if (!(elemento instanceof HTMLElement)) {
      return;
    }

    this.cancelarFechamento();

    const rect = elemento.getBoundingClientRect();
    const margem = 12;
    const espacamento = 10;
    const largura = Math.min(350, window.innerWidth - margem * 2);
    const esquerda = Math.max(margem, Math.min(rect.left + rect.width / 2 - largura / 2, window.innerWidth - largura - margem));
    const espacoAbaixo = window.innerHeight - rect.bottom - margem - espacamento;
    const espacoAcima = rect.top - margem - espacamento;
    const acima = espacoAbaixo < 260 && espacoAcima > espacoAbaixo;
    const alturaMaxima = Math.min(420, Math.max(90, acima ? espacoAcima : espacoAbaixo));

    this.balao.set({
      data,
      top: acima ? rect.top - espacamento : rect.bottom + espacamento,
      left: esquerda,
      width: largura,
      maxHeight: alturaMaxima,
      acima
    });
  }

  clicarDia(evento: MouseEvent, data: string): void {
    const feriados = this.feriadosPorData().get(data);

    if (!feriados?.length) {
      this.fecharBalao();
      return;
    }

    const dispositivoToque = window.matchMedia?.('(hover: none)').matches ?? false;

    if (!dispositivoToque) {
      this.abrirBalao(evento, data);
      return;
    }

    if (this.dataFixada() === data) {
      this.fecharBalao();
      return;
    }

    this.dataFixada.set(data);
    this.abrirBalao(evento, data);
  }

  agendarFechamento(): void {
    if (this.dataFixada()) {
      return;
    }

    this.cancelarFechamento();
    this.temporizador = setTimeout(() => this.fecharBalao(), 180);
  }

  cancelarFechamento(): void {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }

  fecharBalao(): void {
    this.cancelarFechamento();
    this.dataFixada.set(null);
    this.balao.set(null);
  }

  @HostListener('document:keydown.escape')
  aoPressionarEscape(): void {
    this.fecharBalao();
  }

  @HostListener('document:pointerdown', ['$event'])
  aoClicarFora(evento: PointerEvent): void {
    const alvo = evento.target;

    if (alvo instanceof Element && alvo.closest('.dia, .balao-feriados')) {
      return;
    }

    this.fecharBalao();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  aoMoverPagina(): void {
    this.fecharBalao();
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  ngOnDestroy(): void {
    this.cancelarFechamento();
  }
}