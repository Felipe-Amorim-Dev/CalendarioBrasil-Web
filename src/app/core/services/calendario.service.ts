import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarioFeriados } from '../models/calendario.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/feriados';

  consultar(ano: number, ufs: readonly string[] = []): Observable<CalendarioFeriados> {
    let params = new HttpParams().set('ano', ano.toString());

    if (ufs.length > 0) {
      params = params.set('uf', ufs.join(','));
    }

    return this.http.get<CalendarioFeriados>(this.apiUrl, { params });
  }
}