import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Seller } from '../classes/seller';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private sellerId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getSellerId() {
    return this.sellerId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const seller: Seller = { email: email, password: password };
    this.http
      .post("http://localhost:3000/api/seller/signup", seller)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const seller: Seller = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number, sellerId: string }>(
        "http://localhost:3000/api/seller/login",
        seller
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.sellerId = response.sellerId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          this.saveSellerAuth(token, expirationDate, this.sellerId);
          this.router.navigate(["/"]);
        }
      });
  }

  autoAuthUser() {
    const authInformation = this.getSellerAuth();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.sellerId = authInformation.sellerId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.sellerId = null;
    clearTimeout(this.tokenTimer);
    this.clearSellerAuth();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveSellerAuth(token: string, expirationDate: Date, sellerId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("sellerId", sellerId);
  }

  private clearSellerAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("sellerId");
  }

  private getSellerAuth() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const sellerId = localStorage.getItem("sellerId");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      sellerId: sellerId
    }
  }
}
