import { CategoryNameTooLongException, CategoryNameTooShortException } from "./product-category.exception";

export class CategoryName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 120;

  private constructor(
    public readonly value: string,
  ) { }

  public static create(raw: string): CategoryName {
    const value = raw.trim();

    if (value.length < this.MIN_LENGTH) {
      throw new CategoryNameTooShortException(this.MIN_LENGTH);
    }

    if (value.length > this.MAX_LENGTH) {
      throw new CategoryNameTooLongException(this.MAX_LENGTH);
    }

    return new CategoryName(value);
  }

  public equals(other: CategoryName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}