import { Component, computed, input, output, signal } from '@angular/core';
import { UFS } from '../../core/data/ufs';
import { FiltroFeriado } from '../../core/models/calendario.model';

@Component({
  selector: 'app-filtros-feriados',
  standalone: true,
  imports: [],
  templateUrl: './filtros-feriados.html',
  styleUrl: './filtros-feriados.scss'
})
export class FiltrosFeriados {
  readonly selecionadas = input.required<readonly string[]>();
  readonly filtro = input.required<FiltroFeriado>();

  readonly alterouUfs = output<string[]>();
  readonly alterouFiltro = output<FiltroFeriado>();

  readonly pesquisa = signal('');
  readonly ufs = UFS;

  readonly estadosFiltrados = computed(() => {
    const termo = this.normalizar(this.pesquisa());
    return this.ufs.filter(estado => this.normalizar(`${estado.sigla} ${estado.nome}`).includes(termo));
  });

  atualizarPesquisa(evento: Event): void {
    this.pesquisa.set((evento.target as HTMLInputElement).value);
  }

  alternarUf(sigla: string): void {
    const atuais = this.selecionadas();
    const novas = atuais.includes(sigla) ? atuais.filter(uf => uf !== sigla) : [...atuais, sigla];
    this.alterouUfs.emit(novas.sort());
  }

  selecionarTodas(): void {
    this.alterouUfs.emit(this.ufs.map(estado => estado.sigla).sort());
  }

  limpar(): void {
    this.alterouUfs.emit([]);
  }

  selecionarFiltro(valor: FiltroFeriado): void {
    this.alterouFiltro.emit(valor);
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }
}