import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './components/auth/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { CarCreateComponent } from './components/cars/car-create/car-create.component';
import { CarListComponent } from './components/cars/car-list/car-list.component';

const routes: Routes = [
   {path: '', component: CarListComponent},
   {path: 'create', component: CarCreateComponent, canActivate: [AuthGuard]},
   {path: 'edit/:carId', component: CarCreateComponent, canActivate: [AuthGuard]},
   { path: "login", component: LoginComponent },
   { path: "signup", component: SignupComponent },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
