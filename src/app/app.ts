import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { CalendarioFeriados } from './core/models/calendario.model';
import { CalendarioService } from './core/services/calendario.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly calendarioService = inject(CalendarioService);
  private readonly recarregamentos = signal(0);

  private readonly ufsValidas = new Set([
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
    'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
  ]);

  readonly ano = signal(new Date().getFullYear());
  readonly ufsSelecionadas = signal<string[]>([]);
  readonly resultado = signal<CalendarioFeriados | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly erroFormulario = signal<string | null>(null);

  constructor() {
    effect(onCleanup => {
      const ano = this.ano();
      const ufs = this.ufsSelecionadas();
      this.recarregamentos();

      this.carregando.set(true);
      this.erro.set(null);

      const assinatura = this.calendarioService.consultar(ano, ufs).subscribe({
        next: dados => {
          this.resultado.set(dados);
        },
        error: (erro: HttpErrorResponse) => {
          this.carregando.set(false);
          this.resultado.set(null);
          this.erro.set(erro.status === 0
            ? 'Não foi possível conectar à API. Verifique se o backend está funcionando.'
            : `A consulta falhou. Código HTTP: ${erro.status}.`);
        },
        complete: () => {
          this.carregando.set(false);
        }
      });

      onCleanup(() => assinatura.unsubscribe());
    });
  }

  alterarAno(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).valueAsNumber;

    if (!Number.isInteger(valor) || valor < 1583 || valor > 9999) {
      this.erroFormulario.set('Informe um ano entre 1583 e 9999.');
      return;
    }

    this.erroFormulario.set(null);
    this.ano.set(valor);
  }

  alterarUfs(evento: Event): void {
    const entrada = (evento.target as HTMLInputElement).value.trim();
    const ufs = entrada.length === 0 ? [] : entrada.split(',').map(uf => uf.trim().toUpperCase());

    if (ufs.some(uf => !this.ufsValidas.has(uf))) {
      this.erroFormulario.set('Informe UFs válidas separadas por vírgula, como RJ,SP,MG.');
      return;
    }

    this.erroFormulario.set(null);
    this.ufsSelecionadas.set([...new Set(ufs)].sort());
  }

  limparUfs(): void {
    this.ufsSelecionadas.set([]);
    this.erroFormulario.set(null);
  }

  consultarNovamente(): void {
    this.recarregamentos.update(valor => valor + 1);
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}