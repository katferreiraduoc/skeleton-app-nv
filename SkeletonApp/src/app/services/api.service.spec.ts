import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, of } from 'rxjs';
import { catchError, concatMap, map, tap } from 'rxjs/operators';

export interface Category { name: string; }

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly ENDPOINT  = 'https://www.themealdb.com/api/json/v1/1/categories.php';
  private readonly CACHE_KEY = 'catsCache';

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<{ categories: Category[] }>(this.ENDPOINT).pipe(
      map(resp => resp.categories),
      tap(cats => this.storage.set(this.CACHE_KEY, JSON.stringify(cats))),
      catchError(() =>
        from(this.storage.get(this.CACHE_KEY)).pipe(
          map(raw => raw ? JSON.parse(raw) as Category[] : []),
        )
      )
    );
  }
}
