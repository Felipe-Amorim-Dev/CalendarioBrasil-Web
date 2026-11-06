import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabricksStatus, DatabricksTeste } from '../models/databricks.model';

@Injectable({
  providedIn: 'root'
})
export class DatabricksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/databricks';

  obterStatus(): Observable<DatabricksStatus> {
    return this.http.get<DatabricksStatus>(`${this.apiUrl}/status`);
  }

  testarConexao(): Observable<DatabricksTeste> {
    return this.http.post<DatabricksTeste>(`${this.apiUrl}/testar`, {});
  }
}