import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterModule } from '@angular/router';

import { Cart, CartItem } from '../../models/cart-item.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  cart: Cart = { items: [], totalItems: 0, totalPrice: 0, subTotal: 0 };
  user: User | null = null;
  loading = false;
  submitting = false;

  // Fake credit card types
  creditCardTypes = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'MasterCard' },
    { value: 'amex', label: 'American Express' },
    { value: 'discover', label: 'Discover' }
  ];

  // Expiration months
  months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month, label: month.toString().padStart(2, '0') };
  });

  // Expiration years (current year + 10 years)
  years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: year, label: year.toString() };
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private snackbarService: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
    this.loadCart();
  }

  initForms(): void {
    // Shipping form
    this.shippingForm = this.fb.group({
      name: ['', [Validators.required]],
      addressLine1: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}(-[0-9]{4})?$/)]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]]
    });

    // Payment form (fake payment info)
    this.paymentForm = this.fb.group({
      cardType: ['visa', [Validators.required]],
      cardHolder: ['', [Validators.required]],
      cardNumber: ['4111111111111111', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expirationMonth: [this.months[0].value, [Validators.required]],
      expirationYear: [this.years[0].value, [Validators.required]],
      cvv: ['123', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
    });
  }

  loadUserProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        // Prefill shipping form with user details
        if (user) {
          // Use address parsing for backward compatibility with existing addresses
          const addressParts = this.parseAddress(user.address || '');

          this.shippingForm.patchValue({
            name: user.name,
            addressLine1: addressParts.addressLine1,
            addressLine2: addressParts.addressLine2,
            // Use the city field directly if available, otherwise use parsed address
            city: user.city || addressParts.city || '',
            // Use the zipCode field directly if available, otherwise use parsed postal code
            postalCode: user.zipCode || addressParts.postalCode || '',
            country: 'USA',
            phone: user.phone || ''
          });
        }
        this.loading = false;
      },
      error: () => {
        this.snackbarService.error('Failed to load user profile', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadCart(): void {
    this.cartService.cart$.subscribe(cart => {
      // Make a deep copy of the cart to avoid reference issues
      this.cart = {
        items: [...cart.items],
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        subTotal: cart.subTotal
      };

      console.log('Cart loaded in checkout:', this.cart);

      // Verify subtotal calculation
      if (this.cart.items.length > 0) {
        const calculatedSubtotal = this.cart.items.reduce(
          (total, item) => total + (item.book.price * item.quantity),
          0
        );

        // If the stored subtotal doesn't match our calculation, update it
        if (Math.abs(calculatedSubtotal - this.cart.subTotal) > 0.01) {
          console.log('Fixing subtotal:', calculatedSubtotal, 'vs stored:', this.cart.subTotal);
          this.cart.subTotal = Number(calculatedSubtotal.toFixed(2));
        }
      }

      // Redirect to cart if empty
      if (cart.items.length === 0) {
        this.snackbarService.error('Your cart is empty', { duration: 3000 });
        this.router.navigate(['/cart']);
      }
    });
  }

  // Parse address string into components
  parseAddress(address: string): { addressLine1: string, addressLine2: string, city: string, postalCode: string, country: string; } {
    // Very basic address parsing - in real app would be more sophisticated
    const lines = address.split('\\n');

    return {
      addressLine1: lines[0] || '',
      addressLine2: lines.length > 2 ? lines[1] : '',
      city: lines.length > 1 ? lines[lines.length - 2]?.split(',')[0]?.trim() || '' : '',
      postalCode: lines.length > 1 ? lines[lines.length - 2]?.split(',')[1]?.trim() || '' : '',
      country: lines.length > 1 ? lines[lines.length - 1] || '' : ''
    };
  }

  // Format address for API submission
  formatAddress(): string {
    const form = this.shippingForm.value;
    let address = form.addressLine1;
    if (form.addressLine2) {
      address += '\\n' + form.addressLine2;
    }
    address += '\\n' + form.city + ', ' + form.postalCode;
    address += '\\n' + form.country;
    return address;
  }

  // Prepare order data from cart and forms
  prepareOrderData(): any {
    const shippingData = this.shippingForm.value;

    // Format address properly for API
    const shippingAddress = {
      address: shippingData.addressLine1 + (shippingData.addressLine2 ? ' ' + shippingData.addressLine2 : ''),
      city: shippingData.city,
      postalCode: shippingData.postalCode,
      country: shippingData.country
    };

    // Format order items
    const orderItems = this.cart.items.map(item => ({
      book: item.book._id,
      title: item.book.title,
      quantity: item.quantity,
      price: item.book.price
    }));

    // Calculate prices - using our calculation methods directly instead of stored values
    const itemsPrice = this.getSubtotal();
    const shippingPrice = this.calculateShipping(this.cart.items);
    const taxPrice = this.calculateTax(itemsPrice);
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // Payment info (mock data since this is for a class project)
    const paymentInfo = {
      method: 'Credit Card',
      cardType: this.paymentForm.value.cardType,
      lastFour: this.paymentForm.value.cardNumber.slice(-4)
    };

    return {
      orderItems,
      shippingAddress,
      paymentMethod: 'Credit Card',
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult: {
        id: 'MOCK_PAYMENT_' + Date.now(),
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: this.user?.email || ''
      }
    };
  }

  // Place order
  placeOrder(): void {
    if (this.shippingForm.invalid || this.paymentForm.invalid) {
      return;
    }

    this.submitting = true;
    const orderData = this.prepareOrderData();

    // Create order (which is automatically marked as completed on the backend)
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        // Clear cart after successful order
        this.cartService.clearCart();
        this.submitting = false;

        // Show success message and navigate to order history
        this.snackbarService.success('Order placed successfully! Your order is complete.', { duration: 5000 });
        this.router.navigate(['/profile'], { queryParams: { tab: 'orders' } });
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.submitting = false;
        this.snackbarService.error('Failed to place order. Please try again.', { duration: 3000 });
      }
    });
  }

  // Simple tax calculation (10%)
  calculateTax(subtotal: number = 0): number {
    if (subtotal === null || subtotal === undefined) subtotal = 0;
    return Number((subtotal * 0.10).toFixed(2));
  }

  // Simple shipping calculation
  calculateShipping(items: CartItem[] = []): number {
    // If items is null or undefined, default to empty array
    if (!items) items = [];

    // Base shipping cost
    let shipping = 5.00;

    return Number(shipping.toFixed(2));
  }

  // Get the subtotal (sum of all items)
  getSubtotal(): number {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) return 0;

    // Calculate subtotal from items
    const subtotal = this.cart.items.reduce(
      (total, item) => total + (item.book.price * item.quantity),
      0
    );

    return Number(subtotal.toFixed(2));
  }

  // Calculate order total
  getOrderTotal(): number {
    if (!this.cart) return 0;

    const subtotal = this.getSubtotal();
    const shipping = this.calculateShipping(this.cart.items);
    const tax = this.calculateTax(subtotal);

    return Number((subtotal + shipping + tax).toFixed(2));
  }
}
