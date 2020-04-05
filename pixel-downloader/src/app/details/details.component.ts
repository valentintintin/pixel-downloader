import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../api.service';
import { PageDto } from '../model/page-dto';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  details = new BehaviorSubject<PageDto>(null);
  private subscription = new Subscription();

  constructor(public dialogRef: MatDialogRef<DetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: DetailsComponentData,
              private apiService: ApiService, private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.openDetails(this.data.link);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public openDetails(link: PageDto): void {
    this.details.next(link);
      this.subscription.add(this.apiService.getDetails(link).subscribe(details => this.details.next(details), (err: Error) => {
          this.snackbar.open(err ? err.message : 'Une erreur est survenue', 'Ouvrir le site', {
              duration: 5000
          }).onAction().subscribe(_ => window.open(link.url, '_blank'));
          this.dialogRef.close();
      }));
  }
}

export interface DetailsComponentData {
  link: PageDto;
}
