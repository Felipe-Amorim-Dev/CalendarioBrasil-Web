import { Component, computed, input, output } from '@angular/core';
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

@Component({
  selector: 'app-calendario-anual',
  standalone: true,
  imports: [],
  templateUrl: './calendario-anual.html',
  styleUrl: './calendario-anual.scss'
})
export class CalendarioAnual {
  readonly ano = input.required<number>();
  readonly hojeIso = input.required<string>();
  readonly feriados = input.required<readonly Feriado[]>();
  readonly dataSelecionada = input<string | null>(null);

  readonly selecionouData = output<string>();

  readonly diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  readonly feriadosPorData = computed(() => {
    const mapa = new Map<string, Feriado[]>();

    for (const feriado of this.feriados()) {
      const existentes = mapa.get(feriado.data) ?? [];
      existentes.push(feriado);
      mapa.set(feriado.data, existentes);
    }

    return mapa;
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

  selecionarDia(data: string): void {
    this.selecionouData.emit(data);
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}