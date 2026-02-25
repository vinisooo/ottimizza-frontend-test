import type { IColumn, IColumnCreate } from '@/shared/types/column.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@/shared/constants/api';

const BASE_URL = `${API_BASE_URL}/column`;

@Injectable({
  providedIn: 'root',
})
export class ColumnHttp {
  private http = inject(HttpClient);

  getByBoard(boardId: string) {
    return this.http.get<IColumn[]>(`${BASE_URL}/from/${boardId}`);
  }

  create(body: IColumnCreate) {
    return this.http.post<IColumn>(BASE_URL, body);
  }

  update(id: string, body: IColumnCreate) {
    return this.http.put<IColumn>(`${BASE_URL}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<{ status: string }>(`${BASE_URL}/${id}`);
  }
}
