import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FiltrosFeriados } from './filtros-feriados';

describe('FiltrosFeriados', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosFeriados]
    }).compileComponents();
  });

  async function criarComponente() {
    const fixture = TestBed.createComponent(FiltrosFeriados);

    fixture.componentRef.setInput('selecionadas', []);
    fixture.componentRef.setInput('filtro', 'todos');
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  }

  it('deve apresentar as 27 unidades federativas', async () => {
    const fixture = await criarComponente();
    const estados = fixture.nativeElement.querySelectorAll('.opcao-uf');

    expect(estados.length).toBe(27);
  });

  it('deve pesquisar estados pelo nome', async () => {
    const fixture = await criarComponente();
    const campo = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

    campo.value = 'Rio de Janeiro';
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Rio de Janeiro');
    expect(texto).not.toContain('São Paulo');
    expect(fixture.nativeElement.querySelectorAll('.opcao-uf').length).toBe(1);
  });

  it('deve emitir a UF selecionada', async () => {
    const fixture = await criarComponente();
    let recebidas: string[] = [];

    fixture.componentInstance.alterouUfs.subscribe(ufs => recebidas = ufs);

    const primeiraUf = fixture.nativeElement.querySelector('.opcao-uf input') as HTMLInputElement;
    primeiraUf.click();

    expect(recebidas).toEqual(['AC']);
  });

  it('deve emitir alteração para somente estaduais', async () => {
    const fixture = await criarComponente();
    let filtroRecebido = '';

    fixture.componentInstance.alterouFiltro.subscribe(filtro => filtroRecebido = filtro);

    const botoes = Array.from(fixture.nativeElement.querySelectorAll('.filtros button')) as HTMLButtonElement[];
    const botao = botoes.find(item => item.textContent?.includes('Somente estaduais'));

    expect(botao).toBeDefined();
    botao!.click();

    expect(filtroRecebido).toBe('estaduais');
  });

  it('deve permitir limpar as UFs selecionadas', async () => {
    const fixture = await criarComponente();
    fixture.componentRef.setInput('selecionadas', ['RJ', 'SP']);
    fixture.detectChanges();

    let recebidas: string[] = ['RJ', 'SP'];
    fixture.componentInstance.alterouUfs.subscribe(ufs => recebidas = ufs);

    const botoes = Array.from(fixture.nativeElement.querySelectorAll('.acoes button')) as HTMLButtonElement[];
    botoes.find(item => item.textContent?.includes('Limpar'))!.click();

    expect(recebidas).toEqual([]);
  });
});