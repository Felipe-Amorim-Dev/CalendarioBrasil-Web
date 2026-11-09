import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Feriado } from '../../core/models/calendario.model';
import { CalendarioAnual } from './calendario-anual';

describe('CalendarioAnual', () => {
  const feriadoNacional: Feriado = {
    codigo: 'PAIXAO_CRISTO',
    nome: 'Paixão de Cristo',
    data: '2026-04-03',
    abrangencia: 'Nacional',
    uf: null,
    fundamentoLegal: 'Referência legal de teste',
    dataOriginal: null,
    transferido: false,
    situacaoData: 'Calculada'
  };

  const feriadoEstadual: Feriado = {
    codigo: 'RJ_TESTE',
    nome: 'Feriado estadual de teste',
    data: '2026-04-03',
    abrangencia: 'Estadual',
    uf: 'RJ',
    fundamentoLegal: 'Lei estadual de teste',
    dataOriginal: null,
    transferido: false,
    situacaoData: 'Calculada'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioAnual]
    }).compileComponents();
  });

  async function criarComponente(ano: number, feriados: Feriado[] = []) {
    const fixture = TestBed.createComponent(CalendarioAnual);

    fixture.componentRef.setInput('ano', ano);
    fixture.componentRef.setInput('hojeIso', '2026-11-09');
    fixture.componentRef.setInput('feriados', feriados);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  }

  it('deve exibir os 12 meses do ano', async () => {
    const fixture = await criarComponente(2026);

    expect(fixture.nativeElement.querySelectorAll('.mes').length).toBe(12);
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

  it('deve mostrar tooltip ao passar o mouse sobre um feriado', async () => {
    const fixture = await criarComponente(2026, [feriadoNacional]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Dia 03/04/2026"]') as HTMLButtonElement;

    dia.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const balao = fixture.nativeElement.querySelector('.balao-feriados') as HTMLElement;

    expect(balao).not.toBeNull();
    expect(balao.textContent).toContain('Paixão de Cristo');
    expect(balao.textContent).toContain('Referência legal de teste');
  });

  it('não deve mostrar tooltip em um dia sem feriados', async () => {
    const fixture = await criarComponente(2026, [feriadoNacional]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Dia 04/04/2026"]') as HTMLButtonElement;

    dia.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.balao-feriados')).toBeNull();
  });

  it('deve apresentar feriados nacionais e estaduais coincidentes', async () => {
    const fixture = await criarComponente(2026, [feriadoNacional, feriadoEstadual]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Dia 03/04/2026"]') as HTMLButtonElement;

    dia.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const balao = fixture.nativeElement.querySelector('.balao-feriados') as HTMLElement;

    expect(balao.textContent).toContain('Paixão de Cristo');
    expect(balao.textContent).toContain('Feriado estadual de teste');
    expect(balao.textContent).toContain('Estadual · RJ');
  });

  it('deve fechar o tooltip ao pressionar Escape', async () => {
    const fixture = await criarComponente(2026, [feriadoNacional]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Dia 03/04/2026"]') as HTMLButtonElement;

    dia.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.balao-feriados')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.balao-feriados')).toBeNull();
  });

  it('deve atualizar o tooltip quando os feriados forem filtrados', async () => {
    const fixture = await criarComponente(2026, [feriadoNacional, feriadoEstadual]);
    const dia = fixture.nativeElement.querySelector('[aria-label="Dia 03/04/2026"]') as HTMLButtonElement;

    dia.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    fixture.componentRef.setInput('feriados', [feriadoEstadual]);
    fixture.detectChanges();

    const balao = fixture.nativeElement.querySelector('.balao-feriados') as HTMLElement;

    expect(balao.textContent).toContain('Feriado estadual de teste');
    expect(balao.textContent).not.toContain('Paixão de Cristo');
  });
});