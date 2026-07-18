import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { CollectionService } from '../../collection.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth.service';

@Component({
  standalone: true,
  selector: 'home',
  imports: [
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
})
export class CollectionsComponent implements OnInit {
  showSearchSpinner = false;
  userId = '1111';
  collectionEntries: { name: string; movies: any[] }[] = [];
  collectionCount = 0;
  totalMovieCount = 0;

  private _snackBar = inject(MatSnackBar);

  durationInSeconds = 5;
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.showSearchSpinner = true;

    this.collectionService.getCollectionsList().subscribe({
      next: (data: any) => {
        this.collectionEntries = this.buildCollectionEntries(data.rows || []);
        this.collectionCount = this.collectionEntries.length;
        this.totalMovieCount = this.collectionEntries.reduce(
          (count, entry) => count + entry.movies.length,
          0,
        );
        this.showSearchSpinner = false;
      },
      error: (err) => {
        console.error('Error occurred:', err);
        this.showSearchSpinner = false;
      },
    });
  }

  openSnackBar(): void {
    this._snackBar.openFromComponent(PizzaPartyComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }

  private buildCollectionEntries(rows: any[]): { name: string; movies: any[] }[] {
    const grouped = new Map<string, any[]>();

    for (const row of rows) {
      const collection = (row.collection_name || 'Uncategorized').trim();
      if (!grouped.has(collection)) {
        grouped.set(collection, []);
      }
      grouped.get(collection)?.push(row);
    }

    return Array.from(grouped.entries())
      .map(([name, movies]) => ({ name, movies }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }
}

@Component({
  selector: 'snack-bar-component-example-snack',
  standalone: true,
  template:
    '<span class="example-pizza-party">Too many results. Try a more specific search.</span>',
  styles: `
    .example-pizza-party {
      color: white;
    }
  `,
})
export class PizzaPartyComponent {}
