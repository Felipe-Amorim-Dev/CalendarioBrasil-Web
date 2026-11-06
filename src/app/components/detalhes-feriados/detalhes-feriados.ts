import { Component, input, output } from '@angular/core';
import { Feriado } from '../../core/models/calendario.model';

@Component({
  selector: 'app-detalhes-feriados',
  standalone: true,
  imports: [],
  templateUrl: './detalhes-feriados.html',
  styleUrl: './detalhes-feriados.scss'
})
export class DetalhesFeriados {
  readonly data = input.required<string>();
  readonly feriados = input.required<readonly Feriado[]>();
  readonly fechar = output<void>();

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}