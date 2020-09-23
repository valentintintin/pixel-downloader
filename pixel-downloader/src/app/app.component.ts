import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { PageDto } from './model/page-dto';
import { switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DetailsComponent, DetailsComponentData } from './details/details.component';
import { WarningComponent } from './warning/warning.component';
import { CookieService } from 'ngx-cookie-service';
import Fuse from 'fuse.js';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-root',
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

    userAgent = window.navigator.userAgent;
    results = new BehaviorSubject<PageDto[]>([]);
    querySiteProgress: number = null;

    searchInputControl = new FormControl();

    private susbcriptions: Subscription;
    private fuseDatas = new Fuse([], {
        shouldSort: true,
        findAllMatches: true,
        threshold: 1,
        keys: ['title']
    });

    constructor(public apiService: ApiService, private dialog: MatDialog, private coockieService: CookieService,
                private activatedRoute: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        this.susbcriptions = this.apiService.getSites().subscribe(_ => {
            if (this.activatedRoute.snapshot.queryParams['q']) {
                this.searchInputControl.setValue(this.activatedRoute.snapshot.queryParams['q']);
                this.search();
            }
        });

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
        if (this.susbcriptions) {
            this.susbcriptions.unsubscribe();
            this.susbcriptions = null;
        }
        let results = [];
        this.results.next([]);
        this.querySiteProgress = 0;
        this.susbcriptions =
            this.apiService.getSites().pipe(
                switchMap(sites => forkJoin(
                    sites.map(site => this.apiService.getRecent(site.title).pipe(
                        tap(recents => {
                            this.querySiteProgress += 1 / sites.length * 100;
                            results = results.concat(recents);
                        }))
                    )
                ))
            ).subscribe(_ => {
                this.querySiteProgress = null;
                this.results.next(results.sort((a, b) => a.title < b.title ? -1 : 1));
            });
    }

    public search(): void {
        if (this.searchInputControl.value) {
            const query = this.searchInputControl.value;
            this.router.navigate([''], { relativeTo: this.activatedRoute, queryParams: { q: query } });

            if (this.susbcriptions) {
                this.susbcriptions.unsubscribe();
                this.susbcriptions = null;
            }

            let results = [];
            this.results.next([]);
            this.querySiteProgress = 0;
            this.susbcriptions =
                this.apiService.getSites().pipe(
                    switchMap(sites => forkJoin(
                        sites.map(site => this.apiService.search(site.title, query).pipe(
                            tap(resultsSite => {
                                this.querySiteProgress += 1 / sites.length * 100;
                                results = results.concat(resultsSite);
                            })
                        ))
                    ))
                ).subscribe(_ => {
                    this.querySiteProgress = null;
                    this.fuseDatas.setCollection(results);
                    this.results.next(this.fuseDatas.search(query).map(r => r.item));
                });
        } else {
            this.results.next([]);
            this.querySiteProgress = null;
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
