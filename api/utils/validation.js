export const validation = {
  validateProductCode(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid product code');
    }
    return code.trim().toUpperCase();
  },

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
    return email.toLowerCase();
  },

  validateOrderData(data) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (!data.customer || !data.customer.email || !data.customer.firstName || !data.customer.lastName) {
      throw new Error('Customer information is incomplete');
    }

    if (!data.shippingAddress || !data.shippingAddress.street || !data.shippingAddress.city || !data.shippingAddress.postalCode || !data.shippingAddress.country) {
      throw new Error('Shipping address is incomplete');
    }

    data.customer.email = this.validateEmail(data.customer.email);
    return data;
  },

  validateProductcodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) {
      throw new Error('Product codes must be a non-empty array');
    }
    return codes.map((code) => this.validateProductCode(code));
  },

  validateCollection(collection) {
    const validCollections = [
      'XL Pflanzen',
      'Kunstpflanzen',
      'Zimmerpflanzen',
      'Gartenpflanzen',
      'Bäume & Palmen',
      'Bambus & Ziergräser'
    ];

    if (!validCollections.includes(collection)) {
      throw new Error(`Invalid collection. Must be one of: ${validCollections.join(', ')}`);
    }

    return collection;
  }
};
