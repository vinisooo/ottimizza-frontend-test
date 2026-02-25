import type { ITask, ITaskCreate } from '@/shared/types/task.type';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@/shared/constants/api';

const BASE_URL = `${API_BASE_URL}/task`;

@Injectable({
  providedIn: 'root',
})
export class TaskHttp {
  private http = inject(HttpClient);

  getByColumn(columnId: string) {
    return this.http.get<ITask[]>(`${BASE_URL}/from/${columnId}`);
  }

  create(body: ITaskCreate) {
    return this.http.post<ITask>(BASE_URL, body);
  }

  update(id: string, body: ITaskCreate) {
    return this.http.put<ITask>(`${BASE_URL}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<{ status: string }>(`${BASE_URL}/${id}`);
  }
}
