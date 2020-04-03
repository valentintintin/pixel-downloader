import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { PageDto } from './model/page-dto';
import { switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DetailsComponent, DetailsComponentData } from './details/details.component';
import { WarningComponent } from './warning/warning.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-root',
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    userAgent = window.navigator.userAgent;
    results = new BehaviorSubject<PageDto[]>([]);
    querySiteProgress: number = null;

    susbcriptions = new Subscription();

    constructor(public apiService: ApiService, private dialog: MatDialog, private coockieService: CookieService) {
    }

    ngOnInit(): void {
        this.getRecents();

        if (!this.coockieService.check('disclaimer')) {
            this.dialog.open(WarningComponent, {
                closeOnNavigation: false,
                disableClose: true
            }).afterClosed().subscribe(_ => this.coockieService.set('disclaimer', new Date().getTime().toString(), 180));
        }
    }

    ngOnDestroy(): void {
        this.susbcriptions.unsubscribe();
    }

    public getRecents(): void {
        this.results.next([]);
        this.susbcriptions.add(
            this.apiService.getSites().pipe(
                switchMap(sites => forkJoin(
                    sites.map(site => this.apiService.getRecent(site.title).pipe(
                        tap(recents => {
                            this.querySiteProgress += 1 / sites.length * 100;
                            this.results.next([].concat.apply(this.results.getValue(), recents));
                        }))
                    )
                ))
            ).subscribe(_ => this.querySiteProgress = null)
        );
    }

    public search(query: string): void {
        if (query) {
            this.results.next([]);
            this.susbcriptions.add(
                this.apiService.getSites().pipe(
                    switchMap(sites => forkJoin(
                        sites.map(site => this.apiService.search(site.title, query).pipe(
                            tap(results => {
                                this.querySiteProgress += 1 / sites.length * 100;
                                this.results.next([].concat.apply(this.results.getValue(), results));
                            })
                        ))
                    ))
                ).subscribe(_ => this.querySiteProgress = null)
            );
        }
    }

    public openDetails(link: PageDto): void {
        this.dialog.open(DetailsComponent, {
            minWidth: '85vw',
            minHeight: '350px',
            data: {
                link: link
            } as DetailsComponentData
        });
    }
}
