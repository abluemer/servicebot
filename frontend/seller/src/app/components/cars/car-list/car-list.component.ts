import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from "@angular/material/paginator";

import { Car } from 'src/app/shared/classes/car';
import { CarsService } from 'src/app/shared/services/cars.service';
import { AuthService } from 'src/app/shared/services/auth.service';


@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {

  cars: Car[] = [];
  isLoading = false;
  sellerId: string;

  // paggination
  totalCars = 0;
  carsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  sellerIsAuthenticated = false;
  private carsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public carsService: CarsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    // get cars from the service
    this.carsService.getCars(this.carsPerPage, this.currentPage);
    this.sellerId = this.authService.getSellerId();
    // listen with subscribe for changes to automaticly update
    this.carsSub = this.carsService
      .getCarUpdateListener()
      .subscribe((carData: {cars: Car[], carCount: number}) => {
        this.isLoading = false;
        this.totalCars = carData.carCount;
        this.cars = carData.cars;
      });
      this.sellerIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.sellerIsAuthenticated = isAuthenticated;
          this.sellerId = this.authService.getSellerId();
        });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.carsPerPage = pageData.pageSize;
    this.carsService.getCars(this.carsPerPage, this.currentPage);
  }

  onDelete(carId: string) {
    this.isLoading = true;
    this.carsService.deleteCar(carId).subscribe(() => {
      this.carsService.getCars(this.carsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.carsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

}
