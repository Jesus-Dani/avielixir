export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProductStatus = "active" | "hidden";

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  scent_notes: string | null;
  usage_instructions: string | null;
  base_price: number;
  status: ProductStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  collections?: Collection[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_label: string;
  price: number | null;
  stock_quantity: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  saved_address: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Wishlist {
  id: string;
  customer_id: string;
  product_variant_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
  customer?: Pick<Customer, "name">;
}

export interface Order {
  id: string;
  customer_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal: number;
  paystack_reference: string | null;
  delivery_fee: number | null;
  delivery_phone_note: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  variant?: ProductVariant & { product?: Pick<Product, "name" | "slug"> };
}

export function effectivePrice(product: Pick<Product, "base_price">, variant: Pick<ProductVariant, "price">) {
  return variant.price ?? product.base_price;
}
