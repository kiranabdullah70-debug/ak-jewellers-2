export interface CartItem {
  cartId: string;
  product: {
    id: string;
    name: string;
    image: string;
    salePrice: number;
    originalPrice: number;
  };
  quantity: number;
  customization: string;
}
