# Kex

Kex is a tiny library for state managenent for JavaScript projects.

## Installation is simple and plain

```bash
  npm i kex
```

## Usage

### 1. Create `HttpLoaderFactory`:

```typescript
import { TranslateHttpPropertiesLoader } from 'ngx-translate-properties-loader';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpPropertiesLoader(http, './localization/messages_', '.properties');
}
```

### 2. Use `HttpLoaderFactory` in your `TranslateModule`:

```typescript

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
      BrowserModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

Enjoy!
