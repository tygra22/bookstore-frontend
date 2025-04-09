export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  isbn: string;
  category: string;
  coverImage?: string;
  stock: number;
  publisher?: string;
  publishedDate?: Date;
  pages?: number;
  language?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
