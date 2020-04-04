import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../environments/environment';
import { LinkDto } from './model/link-dto';
import { catchError, tap } from 'rxjs/operators';
import { PageDto } from './model/page-dto';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _sites$ = new BehaviorSubject<LinkDto[]>(null);

  public sites$(): Observable<LinkDto[]> {
    return this._sites$.asObservable();
  }

  constructor(private http: HttpClient) {
  }

  public getSites(): Observable<LinkDto[]> {
    if (!this._sites$.getValue()) {
      this._sites$.next([]);
      return this.http.get<LinkDto[]>(environment.api + '/sites').pipe(
          tap(sites => this._sites$.next(sites))
      );
    }
    return this.sites$();
  }

  public getRecent(site: string): Observable<PageDto[]> {
    return this.http.get<PageDto[]>(environment.api + '/recents/' + site).pipe(
        catchError(err => of([]))
    );
  }

  public search(site: string, query: string): Observable<PageDto[]> {
    return this.http.get<PageDto[]>(environment.api + '/search/' + site, {
      params: {
        'query': query
      }
    }).pipe(
        catchError(err => of([]))
    );
  }

  public getDetails(link: PageDto): Observable<PageDto> {
    return this.http.get<PageDto>(environment.api + '/details', {
      params: {
        'site': link.host,
        'link': link.url
      }
    }).pipe(
        tap(details => {
          if (!details.fileLinks || details.fileLinks.length === 0) {
            throw Error('Impossible de récupérer les détails du lien');
          }
        }),
        tap(details => details.fileLinksByHost = details.fileLinks.reduce(function (final, detail) {
          (final[detail.host] = final[detail.host] || []).push(detail);
          return final;
        }, {}))
    );
  }
}
