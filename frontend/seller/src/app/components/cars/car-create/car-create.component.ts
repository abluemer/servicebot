import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Car } from 'src/app/shared/classes/car';
import { CarsService } from 'src/app/shared/services/cars.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-car-create',
  templateUrl: './car-create.component.html',
  styleUrls: ['./car-create.component.css']
})
export class CarCreateComponent implements OnInit {

  enteredManufacturer = "";
  enteredModel = "";
  car: Car;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private carId: string;

  constructor(
    public carsService: CarsService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // reactive form
    this.form = new FormGroup({
      manufacturer: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(2)]
      }),
      model: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    // subscripe to the data to get the data of an entry on edit
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('carId')) {
        this.mode = 'edit';
        this.carId = paramMap.get('carId');
        this.isLoading = true;
        this.carsService.getCar(this.carId).subscribe(carData => {
          this.isLoading = false;
          this.car = {
            id: carData._id,
            manufacturer: carData.manufacturer,
            model: carData.model,
            imagePath: carData.imagePath,
            creator: carData.creator
          };
          // initialise the value of the form
          this.form.setValue({
            manufacturer: this.car.manufacturer,
            model: this.car.model,
            image: this.car.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.carId = null;
      }
    });
  }

  // we convert the type to tell ts explicit that event.target is an input field
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    // define a reader
    const reader = new FileReader();
    // use that reader to define a onload event which can be executed when its done loading
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    // execute the reader
    reader.readAsDataURL(file);
  }

  onSaveCar() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.carsService.addCar(
        this.form.value.manufacturer,
        this.form.value.model,
        this.form.value.image
      );
    } else {
      this.carsService.updateCar(
        this.carId,
        this.form.value.manufacturer,
        this.form.value.model,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
