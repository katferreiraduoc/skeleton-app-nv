import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry, catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

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
  providedIn: 'root'
})
export class ApiService {
  private readonly CATEGORIES_URL = 
    'https://www.themealdb.com/api/json/v1/1/categories.php';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http
      .get<CategoriesResponse>(this.CATEGORIES_URL)
      .pipe(
        retry(2),
        map(res => res.categories || []),
        catchError(err => {
          console.error('API categories error', err);
          return of([] as Category[]);
        })
      );
  }
}
