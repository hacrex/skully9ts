const axios = require('axios');

class DropshippingService {
  constructor() {
    this.printfulApi = axios.create({
      baseURL: 'https://api.printful.com',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createDropshipOrder(order) {
    try {
      // Transform our order format to Printful's format
      const printfulOrder = {
        recipient: {
          name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          address1: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state_code: order.shippingAddress.state,
          country_code: order.shippingAddress.country,
          zip: order.shippingAddress.zipCode
        },
        items: order.items.map(item => ({
          variant_id: item.product.supplierVariantId,
          quantity: item.quantity,
          files: this.getCustomizationFiles(item)
        }))
      };

      // Create order in Printful
      const response = await this.printfulApi.post('/orders', printfulOrder);
      
      return {
        orderId: response.data.result.id,
        trackingNumber: response.data.result.shipping,
        carrier: response.data.result.carrier,
        trackingUrl: response.data.result.tracking_url
      };
    } catch (error) {
      console.error('Dropshipping order creation failed:', error);
      throw new Error('Failed to create dropshipping order');
    }
  }

  getCustomizationFiles(item) {
    if (!item.customization) return [];

    return [{
      type: 'preview',
      url: item.customization.design
    }];
  }

  async getProductVariants(productId) {
    try {
      const response = await this.printfulApi.get(`/products/${productId}`);
      return response.data.result.variants;
    } catch (error) {
      console.error('Failed to fetch product variants:', error);
      throw new Error('Failed to fetch product variants');
    }
  }

  async getShippingRates(address, items) {
    try {
      const response = await this.printfulApi.post('/shipping/rates', {
        recipient: {
          country_code: address.country,
          state_code: address.state,
          city: address.city,
          zip: address.zipCode
        },
        items: items.map(item => ({
          variant_id: item.variantId,
          quantity: item.quantity
        }))
      });
      
      return response.data.result;
    } catch (error) {
      console.error('Failed to get shipping rates:', error);
      throw new Error('Failed to get shipping rates');
    }
  }
}

module.exports = new DropshippingService();
