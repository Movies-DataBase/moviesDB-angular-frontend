import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../movie.service';

@Component({
  selector: 'app-movie',
  imports: [],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.css'
})

export class MovieComponent implements OnInit {
  movieId: string = '';
  movieDetails: any;

  constructor(private route: ActivatedRoute, private movieService: MovieService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      this.fetchMovie(this.movieId);
    });
  }
  fetchMovie(id: string) {
    this.movieService.getMovieById(id).subscribe({
      next: (data) => {
        this.movieDetails = data;
        console.log('Movie data:', data);
      },
      error: (err) => {
        console.error('Error fetching movie:', err);
      }
    });
  }

}
