import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatabricksStatus, DatabricksTeste } from '../../core/models/databricks.model';
import { DatabricksService } from '../../core/services/databricks.service';

@Component({
  selector: 'app-databricks-panel',
  standalone: true,
  imports: [],
  templateUrl: './databricks-panel.html',
  styleUrl: './databricks-panel.scss'
})
export class DatabricksPanel {
  private readonly service = inject(DatabricksService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fechar = output<void>();

  readonly status = signal<DatabricksStatus | null>(null);
  readonly resultadoTeste = signal<DatabricksTeste | null>(null);
  readonly carregando = signal(false);
  readonly testando = signal(false);
  readonly erro = signal<string | null>(null);

  constructor() {
    this.consultarStatus();
  }

  consultarStatus(): void {
    if (this.carregando()) {
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);
    this.resultadoTeste.set(null);

    this.service.obterStatus().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: resultado => {
        this.status.set(resultado);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando.set(false);
        this.status.set(null);
        this.erro.set(erro.status === 0
          ? 'Não foi possível conectar ao backend CalendarioBrasil.'
          : `Falha ao consultar o estado da integração. HTTP ${erro.status}.`);
      }
    });
  }

  testarConexao(): void {
    if (this.testando() || !this.status()?.configurado || !this.status()?.testeDisponivel) {
      return;
    }

    this.testando.set(true);
    this.erro.set(null);
    this.resultadoTeste.set(null);

    this.service.testarConexao().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: resultado => {
        this.resultadoTeste.set(resultado);
        this.testando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        this.testando.set(false);
        this.erro.set(erro.status === 404
          ? 'O teste de conexão não está disponível neste ambiente.'
          : `Não foi possível testar a conexão. HTTP ${erro.status}.`);
      }
    });
  }

  fecharPainel(): void {
    this.fechar.emit();
  }
}