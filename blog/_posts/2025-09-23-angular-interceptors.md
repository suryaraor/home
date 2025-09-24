---
layout: default
title: "A Practical Guide to Angular Interceptors"
date: 2025-09-23
category: Angular
---

# A Practical Guide to Angular Interceptors

HTTP communication is at the heart of most Angular applications. But what if you want to add authentication tokens, log requests, handle errors, or modify responses globally—without repeating code in every service? Enter **Angular Interceptors**: a powerful feature that lets you intercept and transform HTTP requests and responses in a clean, reusable way.

In this post, you'll learn:
- What Angular interceptors are and why they're useful
- How to create and register an interceptor
- Real-world use cases (auth, logging, error handling)
- Best practices and common pitfalls
- How to chain multiple interceptors

---

## What Are Angular Interceptors?

Angular interceptors are classes that implement the `HttpInterceptor` interface. They sit between your app and the backend, allowing you to inspect, modify, or even block HTTP requests and responses.

**Why use interceptors?**
- Add headers (e.g., auth tokens) to every request
- Log or monitor HTTP traffic
- Handle errors globally
- Transform responses before they reach your code

---

## Creating a Simple Interceptor

Let's build an interceptor that adds an authentication token to every outgoing request.

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = 'YOUR_AUTH_TOKEN'; // Replace with real token logic
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
    return next.handle(authReq);
  }
}
```

> **Tip:** Always use `req.clone()`—Angular HTTP requests are immutable!

---

## Registering the Interceptor

You must register your interceptor in the `providers` array of your module:

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  // ...
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule {}
```

> **Best Practice:** Use `multi: true` so you can register multiple interceptors.

---

## Real-World Use Cases

- **Authentication:** Attach JWT or OAuth tokens to requests
- **Logging:** Log all HTTP traffic for debugging
- **Error Handling:** Catch and handle errors globally
- **Caching:** Serve cached responses for certain requests

**Example: Global Error Handler**

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        // Handle error (show toast, redirect, etc.)
        return throwError(() => error);
      })
    );
  }
}
```

---

## Chaining Multiple Interceptors

Angular supports multiple interceptors. They are called in the order they are provided. For example, you can have one for auth, one for logging, and one for error handling—all working together.

> **Tip:** Keep each interceptor focused on a single responsibility for easier testing and maintenance.

---

## Common Pitfalls & Best Practices

- **Order matters:** Interceptors are executed in the order they are provided.
- **Always use `clone()`:** Never mutate the original request.
- **Handle errors gracefully:** Don’t swallow errors—log or display them to users.
- **Unsubscribe if needed:** Interceptors return observables; manage subscriptions if you add side effects.

---

## Summary & Key Takeaways

- Angular interceptors let you handle cross-cutting concerns for HTTP requests in one place.
- Use them for auth, logging, error handling, and more.
- Register all interceptors with `multi: true`.
- Keep interceptors focused and composable.

---

## Further Reading

- [Angular Docs: HTTP Interceptors](https://angular.io/guide/http#intercepting-requests-and-responses)
- [RxJS catchError Operator](https://rxjs.dev/api/operators/catchError)
- [Best Practices for Angular HTTP](https://blog.angularindepth.com/the-new-angular-httpclient-api-9e5c85fe4c0e)

---

By mastering Angular interceptors, you'll write cleaner, more maintainable, and more powerful HTTP code. Happy intercepting!
