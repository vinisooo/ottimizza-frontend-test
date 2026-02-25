import type { IBoard, IBoardCreate } from '@/shared/types/board.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@/shared/constants/api';

const BASE_URL = `${API_BASE_URL}/board`;

@Injectable({
  providedIn: 'root',
})
export class BoardHttp {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<IBoard[]>(BASE_URL);
  }

  create(body: IBoardCreate) {
    return this.http.post<IBoard>(BASE_URL, body);
  }

  update(id: string, body: IBoardCreate) {
    return this.http.put<IBoard>(`${BASE_URL}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<{ status: string }>(`${BASE_URL}/${id}`);
  }
}
