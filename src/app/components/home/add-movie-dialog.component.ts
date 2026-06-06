import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

export interface AddMovieDialogData {
  movie: Movie | null;
  collections: string[];
}

@Component({
  selector: 'app-add-movie-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Add to collections</h2>
    <mat-dialog-content class="dialog-content">
      <div class="movie-summary" *ngIf="data.movie as movie">
        <img [src]="movie.Poster" [alt]="movie.Title" />
        <div>
          <p class="eyebrow">Selected movie</p>
          <h3>{{ movie.Title }}</h3>
          <p>{{ movie.Year }} / {{ movie.Type }}</p>
        </div>
      </div>

      <div class="section-label">Choose collections</div>
      <div class="collection-list" *ngIf="allCollections.length; else noCollections">
        <label class="collection-row" *ngFor="let collection of allCollections">
          <mat-checkbox
            [checked]="selectedCollections.includes(collection)"
            (change)="toggleCollection(collection, $event.checked)"
          >
            {{ collection }}
          </mat-checkbox>
          <span class="collection-badge" *ngIf="isPendingCollection(collection)">
            New
          </span>
        </label>
      </div>
      <ng-template #noCollections>
        <p class="empty-state">
          You do not have any collections yet. Create one below.
        </p>
      </ng-template>

      <div class="section-label">Create a new collection</div>
      <div class="new-collection-row">
        <mat-form-field appearance="outline" floatLabel="always">
          <mat-label>Collection name</mat-label>
          <input
            matInput
            [(ngModel)]="newCollectionName"
            placeholder="Watchlist, Sci-Fi Night, Favorites..."
            (keydown.enter)="addNewCollection($event)"
          />
        </mat-form-field>
        <button mat-stroked-button type="button" (click)="addNewCollection($event)">
          Add
        </button>
      </div>

      <div class="chip-row" *ngIf="pendingNewCollections.length">
        <p class="chip-label">New collections will be created when you confirm.</p>
        <mat-chip-set aria-label="New collections to create">
          <mat-chip
            *ngFor="let collection of pendingNewCollections"
            (removed)="removeNewCollection(collection)"
            removable
          >
            {{ collection }}
            <button matChipRemove type="button" aria-label="Remove collection">
              Remove
            </button>
          </mat-chip>
        </mat-chip-set>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        type="button"
        [disabled]="!selectedCollections.length"
        (click)="confirm()"
      >
        Add selected
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-content {
      display: grid;
      gap: 1rem;
      min-width: min(560px, 100%);
      color: #18323b;
    }

    .movie-summary {
      display: grid;
      grid-template-columns: 72px 1fr;
      gap: 0.85rem;
      align-items: center;
      padding: 0.9rem;
      border-radius: 1rem;
      background: #eef5f5;
      border: 1px solid #ccdbdb;
    }

    .movie-summary img {
      width: 72px;
      height: 96px;
      object-fit: cover;
      border-radius: 0.8rem;
    }

    .movie-summary h3,
    .movie-summary p {
      margin: 0;
    }

    .eyebrow,
    .section-label {
      color: #425867;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .section-label {
      margin-top: 0.25rem;
    }

    .collection-list {
      display: grid;
      gap: 0.45rem;
      max-height: 240px;
      overflow: auto;
      padding-right: 0.25rem;
    }

    .collection-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.55rem 0.75rem;
      border-radius: 0.85rem;
      background: #ffffff;
      border: 1px solid #ccdbdb;
      color: #163043;
    }

    .collection-badge {
      flex-shrink: 0;
      padding: 0.22rem 0.5rem;
      border-radius: 999px;
      background: #0f766e;
      color: #f8fffe;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .new-collection-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.75rem;
      align-items: start;
    }

    .new-collection-row mat-form-field {
      width: 100%;
    }

    .empty-state {
      margin: 0;
      color: #425867;
      background: #eef5f5;
      padding: 0.9rem 1rem;
      border-radius: 0.9rem;
    }

    .chip-row {
      display: grid;
      gap: 0.5rem;
    }

    .chip-label {
      margin: 0;
      color: #425867;
      font-size: 0.88rem;
    }

    @media (max-width: 600px) {
      .dialog-content {
        min-width: 100%;
      }

      .movie-summary {
        grid-template-columns: 1fr;
      }

      .new-collection-row {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class AddMovieDialogComponent {
  selectedCollections: string[] = [];
  newCollectionName = '';
  pendingNewCollections: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddMovieDialogComponent, string[]>,
    @Inject(MAT_DIALOG_DATA) public data: AddMovieDialogData,
  ) {}

  get allCollections(): string[] {
    return this.data.collections;
  }

  isPendingCollection(collection: string): boolean {
    return this.pendingNewCollections.includes(collection);
  }

  toggleCollection(collection: string, checked: boolean): void {
    const normalized = this.normalizeCollectionName(collection);

    if (!normalized) {
      return;
    }

    if (checked && !this.selectedCollections.includes(normalized)) {
      this.selectedCollections = [...this.selectedCollections, normalized];
      return;
    }

    this.selectedCollections = this.selectedCollections.filter(
      (item) => item !== normalized,
    );
  }

  addNewCollection(event: Event): void {
    event.preventDefault();

    const normalized = this.normalizeCollectionName(this.newCollectionName);
    if (!normalized) {
      return;
    }

    if (!this.includesCollection(this.pendingNewCollections, normalized)) {
      this.pendingNewCollections = [...this.pendingNewCollections, normalized];
    }

    if (!this.includesCollection(this.data.collections, normalized)) {
      this.data.collections = [...this.data.collections, normalized].sort(
        (left, right) => left.localeCompare(right),
      );
    }

    if (!this.includesCollection(this.selectedCollections, normalized)) {
      this.selectedCollections = [...this.selectedCollections, normalized];
    }

    this.newCollectionName = '';
  }

  removeNewCollection(collection: string): void {
    this.pendingNewCollections = this.pendingNewCollections.filter(
      (item) => item.toLowerCase() !== collection.toLowerCase(),
    );
    this.selectedCollections = this.selectedCollections.filter(
      (item) => item.toLowerCase() !== collection.toLowerCase(),
    );
    this.data.collections = this.data.collections.filter(
      (item) => item.toLowerCase() !== collection.toLowerCase(),
    );
  }

  confirm(): void {
    this.dialogRef.close(this.selectedCollections);
  }

  private includesCollection(collections: string[], value: string): boolean {
    const normalized = this.normalizeCollectionName(value).toLowerCase();
    return collections.some(
      (collection) =>
        this.normalizeCollectionName(collection).toLowerCase() === normalized,
    );
  }

  private normalizeCollectionName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}
