import { NgModule } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [AppModule],
  providers: [provideServerRendering(withRoutes(serverRoutes))],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
