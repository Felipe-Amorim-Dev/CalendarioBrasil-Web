import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Feriado } from '../../core/models/calendario.model';
import { CalendarioAnual } from './calendario-anual';

describe('CalendarioAnual', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioAnual]
    }).compileComponents();
  });

  async function criarComponente(ano: number, feriados: Feriado[] = []) {
    const fixture = TestBed.createComponent(CalendarioAnual);

    fixture.componentRef.setInput('ano', ano);
    fixture.componentRef.setInput('hojeIso', '2026-11-05');
    fixture.componentRef.setInput('feriados', feriados);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  }

  it('deve exibir os 12 meses do ano', async () => {
    const fixture = await criarComponente(2026);

    expect(fixture.nativeElement.querySelectorAll('.mes').length).toBe(12);
    expect(fixture.nativeElement.textContent).toContain('Janeiro');
    expect(fixture.nativeElement.textContent).toContain('Dezembro');
  });

  it('deve considerar fevereiro de um ano bissexto', async () => {
    const fixture = await criarComponente(2024);
    const fevereiro = fixture.nativeElement.querySelectorAll('.mes')[1] as HTMLElement;

    expect(fevereiro.querySelectorAll('button.dia').length).toBe(29);
  });

  it('deve considerar 1900 como ano não bissexto', async () => {
    const fixture = await criarComponente(1900);
    const fevereiro = fixture.nativeElement.querySelectorAll('.mes')[1] as HTMLElement;

    expect(fevereiro.querySelectorAll('button.dia').length).toBe(28);
  });

  it('deve destacar os dias com feriados', async () => {
    const feriado: Feriado = {
      codigo: 'PAIXAO_CRISTO',
      nome: 'Paixão de Cristo',
      data: '2026-04-03',
      abrangencia: 'Nacional',
      uf: null,
      fundamentoLegal: 'Referência de teste',
      dataOriginal: null,
      transferido: false,
      situacaoData: 'Calculada'
    };

    const fixture = await criarComponente(2026, [feriado]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Selecionar 03/04/2026"]') as HTMLButtonElement;

    expect(dia).not.toBeNull();
    expect(dia.classList.contains('com-feriado')).toBe(true);
    expect(dia.querySelector('.ponto.nacional')).not.toBeNull();
  });

  it('deve emitir a data selecionada', async () => {
    const fixture = await criarComponente(2026);
    let dataRecebida = '';

    fixture.componentInstance.selecionouData.subscribe(data => dataRecebida = data);

    const dia = fixture.nativeElement.querySelector('[aria-label="Selecionar 03/04/2026"]') as HTMLButtonElement;
    dia.click();

    expect(dataRecebida).toBe('2026-04-03');
  });
});