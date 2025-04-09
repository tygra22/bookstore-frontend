# Bookstore Frontend

This is the frontend application for the Bookstore, built with Angular 19 and Angular Material. The application provides a user interface for browsing books, managing user accounts, and processing orders.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.7.

## Features

### Authentication System
- Complete JWT-based authentication flow
- Login and registration components with Angular Material styling
- Auth interceptor for attaching JWT tokens to API requests
- Functional route guards for protected routes
- Role-based access control for admin users

### User Interface
- Responsive design using Angular Material components
- Home dashboard for authenticated users
- Book browsing and management interfaces

## Development server

### Quick Setup (Recommended)

We've created a convenient setup script that will automatically:
1. Use the correct Node.js version with nvm
2. Install dependencies if needed
3. Start the Angular development server

```bash
npm run setup
```

### Manual Setup

To start a local development server manually, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
