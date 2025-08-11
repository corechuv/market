export interface Product {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    link: string;
    available?: boolean;
    description?: string;
    images?: string[]; // Optional field for additional images
}
