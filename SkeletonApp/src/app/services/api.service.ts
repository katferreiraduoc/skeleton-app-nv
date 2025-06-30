import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';         // ← aquí
import { catchError, map, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly CATEGORIES_URL =
    'https://www.themealdb.com/api/json/v1/1/categories.php';
  private readonly CACHE_KEY = 'catsCache';

  constructor(private http: HttpClient, private storage: Storage) {}

  getCategories(): Observable<Category[]> {
  return this.http
    .get<{ categories: Category[] }>(this.CATEGORIES_URL)
    .pipe(
      map(resp => resp.categories),
      tap(list =>
        this.storage['set'](this.CACHE_KEY, list)
      ),
      catchError(err => {
        console.warn('HTTP failed, loading from cache', err);
        return from(this.storage['get'](this.CACHE_KEY)).pipe(
          map((cached: Category[] | null) => cached ?? []),
          catchError(() => of([]))
        );
      })
    );
}

}
