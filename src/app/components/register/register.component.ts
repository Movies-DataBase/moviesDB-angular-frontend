import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly debounceMs = 350;
  private usernameTimer: ReturnType<typeof setTimeout> | null = null;
  private emailTimer: ReturnType<typeof setTimeout> | null = null;
  private usernameRequestId = 0;
  private emailRequestId = 0;

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  usernameStatus: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' =
    'idle';
  emailStatus: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' = 'idle';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  otp = '';
  otpSent = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onUsernameChange(value: string): void {
    this.errorMessage = '';
    const username = value.trim();

    if (this.usernameTimer) {
      clearTimeout(this.usernameTimer);
    }

    if (!username) {
      this.usernameStatus = 'idle';
      return;
    }

    this.usernameStatus = 'checking';
    this.usernameTimer = setTimeout(() => {
      const requestId = ++this.usernameRequestId;
      this.authService.checkUsernameExists(username).subscribe({
        next: (exists) => {
          if (requestId !== this.usernameRequestId) {
            return;
          }
          this.usernameStatus = exists ? 'taken' : 'available';
        },
        error: () => {
          if (requestId !== this.usernameRequestId) {
            return;
          }
          this.usernameStatus = 'invalid';
        },
      });
    }, this.debounceMs);
  }

  onEmailChange(value: string): void {
    this.errorMessage = '';
    const email = value.trim();

    if (this.emailTimer) {
      clearTimeout(this.emailTimer);
    }

    if (!email) {
      this.emailStatus = 'idle';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.emailStatus = 'invalid';
      return;
    }

    this.emailStatus = 'checking';
    this.emailTimer = setTimeout(() => {
      const requestId = ++this.emailRequestId;
      this.authService.checkEmailExists(email).subscribe({
        next: (exists) => {
          if (requestId !== this.emailRequestId) {
            return;
          }
          this.emailStatus = exists ? 'taken' : 'available';
        },
        error: () => {
          if (requestId !== this.emailRequestId) {
            return;
          }
          this.emailStatus = 'invalid';
        },
      });
    }, this.debounceMs);
  }

  onSendOtp(): void {
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email to receive an OTP.';
      return;
    }
    this.authService.sendOtp(this.email.trim()).subscribe({
      next: () => {
        this.successMessage = 'OTP sent successfully.';
        this.otpSent = true;
      },
      error: (err: any) => {
        this.errorMessage =
          err?.error?.error || 'Unable to send OTP. Please try again.';
      },
    });
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Username, email and password are required.';
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (
      this.usernameStatus !== 'available' ||
      this.emailStatus !== 'available'
    ) {
      this.errorMessage = 'Please use a username and email that are available.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    this.authService
      .signup({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password,
        otp: this.otp.trim(),
      })
      .subscribe({
        next: () => {
          this.successMessage =
            'Account created successfully. Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 900);
        },
        error: (err: any) => {
          this.errorMessage =
            err?.error?.error || 'Unable to create account. Please try again.';
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
