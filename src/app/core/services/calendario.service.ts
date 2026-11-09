import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, Observable, retry, throwError, timer, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarioFeriados } from '../models/calendario.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/feriados`;
  private ultimoDespertar = 0;

  consultar(ano: number, ufs: readonly string[] = []): Observable<CalendarioFeriados> {
    let params = new HttpParams().set('ano', ano.toString());

    if (ufs.length > 0) {
      params = params.set('uf', ufs.join(','));
    }

    return defer(() => {
      this.despertarBackend();

      return this.http.get<CalendarioFeriados>(this.apiUrl, { params }).pipe(
        timeout({ first: 25000 })
      );
    }).pipe(
      retry({
        count: 20,
        delay: (erro: unknown) => {
          if (erro instanceof TimeoutError) {
            return timer(5000);
          }

          if (erro instanceof HttpErrorResponse) {
            const indisponivel = [0, 502, 503, 504].includes(erro.status);
            const respostaInvalida = erro.status === 200 && erro.error?.error instanceof SyntaxError;

            if (indisponivel || respostaInvalida) {
              return timer(5000);
            }
          }

          return throwError(() => erro);
        }
      })
    );
  }

  private despertarBackend(): void {
    if (!environment.wakeUpUrl || typeof window === 'undefined') {
      return;
    }

    const agora = Date.now();

    if (agora - this.ultimoDespertar < 60000) {
      return;
    }

    this.ultimoDespertar = agora;

    void fetch(environment.wakeUpUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store'
    }).catch(() => {});
  }
}