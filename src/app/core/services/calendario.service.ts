import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, retry, switchMap, throwError, timer, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarioFeriados } from '../models/calendario.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/feriados`;
  private readonly healthUrl = '/health';

  consultar(ano: number, ufs: readonly string[] = []): Observable<CalendarioFeriados> {
    let params = new HttpParams().set('ano', ano.toString());

    if (ufs.length > 0) {
      params = params.set('uf', ufs.join(','));
    }

    return this.http.get<{ status: string }>(this.healthUrl).pipe(
      timeout({ first: 15000 }),
      map(resposta => {
        if (resposta.status !== 'healthy') {
          throw new HttpErrorResponse({ status: 503, statusText: 'API em inicialização' });
        }
      }),
      switchMap(() => this.http.get<CalendarioFeriados>(this.apiUrl, { params }).pipe(
        timeout({ first: 20000 })
      )),
      retry({
        count: 12,
        delay: (erro: unknown) => {
          if (erro instanceof TimeoutError) {
            return timer(5000);
          }

          if (erro instanceof HttpErrorResponse) {
            const temporario = [0, 502, 503, 504].includes(erro.status);
            const respostaNaoJson = erro.status === 200 && erro.error?.error instanceof SyntaxError;

            if (temporario || respostaNaoJson) {
              return timer(5000);
            }
          }

          return throwError(() => erro);
        }
      })
    );
  }
}