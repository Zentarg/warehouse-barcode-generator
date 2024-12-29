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

  removeProducts(products: Product[]): void {
    this._products = this._products.filter(p => !products.find(product => product.EAN === p.EAN));
    this.saveProducts();
  }

  updateProduct(ean: string, product: Product): void {
    const index = this._products.findIndex(p => p.EAN === ean);
    this._products[index] = product;
    this.saveProducts();
  }

  setproducts(products: Product[]): void {
    this._products = products;
    this.saveProducts();
  }

  public saveProducts(): void {
    if (window.electronStore)
      window.electronStore.set(this.storageKey, JSON.stringify(this._products));
    else
      localStorage.setItem(this.storageKey, JSON.stringify(this._products));
  }

  private async loadProducts(): Promise<void> {
    let products;
    if (window.electronStore)
      products = await window.electronStore.get(this.storageKey);
    else
      products = localStorage.getItem(this.storageKey);
    if (products) {
      this._products = JSON.parse(products);
    }
  }


}
