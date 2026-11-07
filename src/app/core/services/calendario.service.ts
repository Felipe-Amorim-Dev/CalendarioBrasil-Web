import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

    return this.http.get<CalendarioFeriados>(this.apiUrl, { params });
  }
}