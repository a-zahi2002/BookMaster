class Validators {
  static isValidISBN(isbn) {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    if (cleanISBN.length === 10) return this.isValidISBN10(cleanISBN);
    if (cleanISBN.length === 13) return this.isValidISBN13(cleanISBN);
    return false;
  }

  static isValidISBN10(isbn) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (10 - i) * parseInt(isbn[i]);
    }
    const lastChar = isbn[9].toUpperCase();
    const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar);
    sum += checkDigit;
    return sum % 11 === 0;
  }

  static isValidISBN13(isbn) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += (i % 2 === 0 ? 1 : 3) * parseInt(isbn[i]);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12]);
  }

  static isValidPrice(price) {
    return !isNaN(price) && price >= 0;
  }

  static isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity >= 0;
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

module.exports = Validators;