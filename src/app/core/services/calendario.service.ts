import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, retry, throwError, timer, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarioFeriados } from '../models/calendario.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/feriados`;

  consultar(ano: number, ufs: readonly string[] = []): Observable<CalendarioFeriados> {
    let params = new HttpParams().set('ano', ano.toString());

    if (ufs.length > 0) {
      params = params.set('uf', ufs.join(','));
    }

    return this.http.get<CalendarioFeriados>(this.apiUrl, { params }).pipe(
      timeout({ first: 30000 }),
      retry({
        count: 12,
        delay: (erro: unknown) => {
          if (erro instanceof TimeoutError) {
            return timer(5000);
          }

          if (erro instanceof HttpErrorResponse) {
            const temporario = [0, 502, 503, 504].includes(erro.status);
            const respostaInvalida = erro.status === 200 && erro.error?.error instanceof SyntaxError;

            if (temporario || respostaInvalida) {
              return timer(5000);
            }
          }

          return throwError(() => erro);
        }
      })
    );
  }
}