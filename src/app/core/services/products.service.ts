import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly storageKey = 'products';
  private _products: Product[] = [];

  constructor() {
    this.loadProducts();
  }

  get products(): Product[] {
    return this._products;
  }

  addProducts(products: Product[]): void {
    products.forEach(product => {
      if (!this._products.find(p => p.EAN === product.EAN))
        this._products.push(product);
      else {
        const index = this._products.findIndex(p => p.EAN === product.EAN);
        this._products[index] = product;
      }
    });
    this.saveProducts();
  }

  setproducts(products: Product[]): void {
    this._products = products;
    this.saveProducts();
  }

  public saveProducts(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this._products));
  }

  private loadProducts(): void {
    const products = localStorage.getItem(this.storageKey);
    if (products) {
      this._products = JSON.parse(products);
    }
  }


}
