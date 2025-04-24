import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Configuration options for snackbar notifications
 */
export interface SnackbarConfig {
  /** Duration in milliseconds */
  duration?: number;
  /** Action button text */
  action?: string;
  /** Route to navigate to when action is clicked */
  actionRoute?: string[];
  /** CSS class to add to the snackbar */
  panelClass?: string | string[];
  /** Horizontal position */
  horizontalPosition?: 'start' | 'center' | 'end';
  /** Vertical position */
  verticalPosition?: 'top' | 'bottom';
}

/**
 * Default configuration for snackbars
 */
const DEFAULT_CONFIG: SnackbarConfig = {
  duration: 3000,
  horizontalPosition: 'center',
  verticalPosition: 'bottom',
  panelClass: 'snackbar-default' // Apply the blue theme by default
};

/**
 * Service for displaying consistent snackbar notifications throughout the application
 */
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  /**
   * Show a success notification
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  success(message: string, config?: SnackbarConfig): Observable<void> {
    const mergedConfig = this.mergeConfig(config, 'snackbar-success');
    return this.show(message, mergedConfig);
  }

  /**
   * Show an error notification
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  error(message: string, config?: SnackbarConfig): Observable<void> {
    const mergedConfig = this.mergeConfig(config, 'snackbar-error');
    return this.show(message, mergedConfig);
  }

  /**
   * Show an info notification
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  info(message: string, config?: SnackbarConfig): Observable<void> {
    const mergedConfig = this.mergeConfig(config, 'snackbar-info');
    return this.show(message, mergedConfig);
  }

  /**
   * Show a warning notification
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  warning(message: string, config?: SnackbarConfig): Observable<void> {
    const mergedConfig = this.mergeConfig(config, 'snackbar-warning');
    return this.show(message, mergedConfig);
  }

  /**
   * Show a cart notification with a "View Cart" action
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  cart(message: string, config?: SnackbarConfig): Observable<void> {
    const cartConfig: SnackbarConfig = {
      action: 'View Cart',
      actionRoute: ['/cart'],
      ...config
    };
    const mergedConfig = this.mergeConfig(cartConfig, 'snackbar-cart');
    return this.show(message, mergedConfig);
  }

  /**
   * Show a generic snackbar with custom configuration
   * @param message Message to display
   * @param config Optional configuration
   * @returns Observable that emits when action is clicked
   */
  show(message: string, config: SnackbarConfig = {}): Observable<void> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const { duration, action, horizontalPosition, verticalPosition, panelClass } = finalConfig;

    const snackBarRef = this.snackBar.open(message, action, {
      duration,
      horizontalPosition,
      verticalPosition,
      panelClass
    });

    return new Observable<void>(observer => {
      const subscription = snackBarRef.onAction().subscribe(() => {
        if (finalConfig.actionRoute) {
          this.router.navigate(finalConfig.actionRoute);
        }
        observer.next();
        observer.complete();
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Dismiss all currently visible snackbars
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  /**
   * Merge custom config with defaults and add panel class
   */
  private mergeConfig(config: SnackbarConfig = {}, typeClass: string): SnackbarConfig {
    let panelClass: string[] = [];
    
    // Handle existing panel classes
    if (config.panelClass) {
      if (Array.isArray(config.panelClass)) {
        panelClass = [...config.panelClass];
      } else {
        panelClass = [config.panelClass];
      }
    }
    
    // Add the type class
    panelClass.push(typeClass);
    
    return {
      ...config,
      panelClass
    };
  }
}
