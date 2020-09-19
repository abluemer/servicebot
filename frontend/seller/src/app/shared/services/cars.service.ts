import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Car } from '../classes/car';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private cars: Car[] = [];
  private carsUpdated = new Subject<{ cars: Car[]; carCount: number}>();

  constructor(private http: HttpClient, private router: Router) { }

  getCars(carsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${carsPerPage}&page=${currentPage}`;
    // we connect to the api and listen to the response with the subscribe
    this.http
      .get<{message: string; cars: any; maxCars: number }>("http://localhost:3000/api/cars" + queryParams)
      .pipe(
        map(carData => {
          return {
            cars: carData.cars.map(car => {
            return {
              manufacturer: car.manufacturer,
              model: car.model,
              id: car._id,
              imagePath: car.imagePath,
              creator: car.creator
            };
          }),
          maxCars: carData.maxCars
        };
        })
      )
      .subscribe(transformedCarData => {
        this.cars = transformedCarData.cars;
        this.carsUpdated.next({
          cars: [...this.cars],
          carCount: transformedCarData.maxCars
        });
      });
  }

  getCarUpdateListener() {
    return this.carsUpdated.asObservable();
  }

  getCar(id: string) {
    return this.http.get<{
      _id: string;
      manufacturer: string;
      model: string;
      imagePath: string;
      creator: string;
    }>("http://localhost:3000/api/cars/" + id);
  }

  addCar( manufacturer: string, model: string, image: File) {
    // what type we want to add
    const carData = new FormData();
    carData.append('manufacturer', manufacturer);
    carData.append('model', model);
    carData.append('image', image, manufacturer);
    this.http
      .post<{ message: string; car: Car }>(
        "http://localhost:3000/api/cars", carData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
  });
  }

  updateCar(id: string, manufacturer: string, model: string, image: File | string) {
    let carData: Car | FormData;
    if (typeof image === "object") {
      carData = new FormData();
      carData.append('id', id);
      carData.append('manufacturer', manufacturer);
      carData.append('model', model);
      carData.append('image', image, manufacturer);
    } else {
      carData = {
        id: id,
        manufacturer: manufacturer,
        model: model,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put("http://localhost:3000/api/cars/" + id, carData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }

  deleteCar(carId: string) {
    return this.http
      .delete("http://localhost:3000/api/cars/" + carId);
  }
}





