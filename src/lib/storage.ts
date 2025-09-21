// Local storage service for food delivery app with real-time updates
export interface User {
  id: string;
  email: string;
  role: 'customer' | 'restaurant' | 'delivery';
  name: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  menu: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurant_id?: string;
  customization?: {
    size: 'regular' | 'large';
    spiceLevel: 'mild' | 'medium' | 'hot';
    extraToppings: string[];
    specialRequests: string;
    totalPrice: number;
  };
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_way' | 'delivered';
  total: number;
  deliveryAddress: string;
  paymentStatus: 'pending' | 'completed';
  createdAt: string;
  deliveryAgentId?: string;
}

// Real-time event dispatcher
class RealTimeEvents {
  static dispatch(eventType: string, data: any) {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  }

  static subscribe(eventType: string, callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener(eventType, handler as EventListener);
    return () => window.removeEventListener(eventType, handler as EventListener);
  }
}

class StorageService {
  // Demo credentials (hidden from UI)
  private demoCredentials = {
    customer: { email: 'customer@demo.com', password: 'demo123' },
    restaurant: { email: 'restaurant@demo.com', password: 'demo123' },
    delivery: { email: 'delivery@demo.com', password: 'demo123' }
  };

  // Initialize demo data with AI-generated images
  initializeDemoData() {
    if (!localStorage.getItem('restaurants')) {
      const restaurants: Restaurant[] = [
        {
          id: '1',
          name: 'Pizza Palace',
          image: '/src/assets/pizza-palace.jpg',
          cuisine: 'Italian',
          rating: 4.5,
          deliveryTime: '25-35 min',
          deliveryFee: 29,
          menu: [
            {
              id: '1',
              name: 'Margherita Pizza',
              description: 'Fresh tomatoes, mozzarella, basil',
              price: 299,
              image: '/src/assets/margherita-pizza.jpg',
              category: 'Pizza'
            },
            {
              id: '2',
              name: 'Pepperoni Pizza',
              description: 'Classic pepperoni with cheese',
              price: 349,
              image: '/src/assets/pepperoni-pizza.jpg',
              category: 'Pizza'
            }
          ]
        },
        {
          id: '2',
          name: 'Burger Barn',
          image: '/src/assets/burger-barn.jpg',
          cuisine: 'American',
          rating: 4.2,
          deliveryTime: '20-30 min',
          deliveryFee: 19,
          menu: [
            {
              id: '3',
              name: 'Classic Burger',
              description: 'Beef patty, lettuce, tomato, onion',
              price: 259,
              image: '/src/assets/classic-burger.jpg',
              category: 'Burgers'
            }
          ]
        }
      ];
      localStorage.setItem('restaurants', JSON.stringify(restaurants));
    }

    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify([]));
    }

    if (!localStorage.getItem('cart')) {
      localStorage.setItem('cart', JSON.stringify([]));
    }
  }

  // Auth methods
  login(email: string, password: string): User | null {
    for (const [role, creds] of Object.entries(this.demoCredentials)) {
      if (creds.email === email && creds.password === password) {
        const user: User = {
          id: role + '_demo',
          email,
          role: role as User['role'],
          name: role.charAt(0).toUpperCase() + role.slice(1) + ' User'
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
    }
    return null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  // Restaurant methods
  getRestaurants(): Restaurant[] {
    const restaurants = localStorage.getItem('restaurants');
    return restaurants ? JSON.parse(restaurants) : [];
  }

  getRestaurant(id: string): Restaurant | null {
    const restaurants = this.getRestaurants();
    return restaurants.find(r => r.id === id) || null;
  }

  updateRestaurantMenu(restaurantId: string, menu: MenuItem[]) {
    const restaurants = this.getRestaurants();
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      restaurant.menu = menu;
      localStorage.setItem('restaurants', JSON.stringify(restaurants));
    }
  }

  // Cart methods
  getCart(): CartItem[] {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  addToCart(item: CartItem) {
    const cart = this.getCart();
    const existingItem = cart.find(
      c => c.menuItem.id === item.menuItem.id && c.restaurantId === item.restaurantId
    );
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  updateCartItem(menuItemId: string, quantity: number) {
    const cart = this.getCart();
    const item = cart.find(c => c.menuItem.id === menuItemId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(menuItemId);
      } else {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }
  }

  removeFromCart(menuItemId: string) {
    const cart = this.getCart();
    const updatedCart = cart.filter(c => c.menuItem.id !== menuItemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
  }

  // Order methods
  getOrders(): Order[] {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    this.clearCart();
    
    // Trigger real-time update events
    RealTimeEvents.dispatch('newOrder', { order: newOrder });
    RealTimeEvents.dispatch('dataUpdate', { type: 'orders' });
    
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], deliveryAgentId?: string) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (deliveryAgentId) {
        order.deliveryAgentId = deliveryAgentId;
      }
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Trigger real-time update events for all components
      RealTimeEvents.dispatch('orderStatusUpdate', { orderId, status, order });
      RealTimeEvents.dispatch('dataUpdate', { type: 'orders' });
    }
  }

  getOrdersByUser(userId: string): Order[] {
    return this.getOrders().filter(o => o.userId === userId);
  }

  getOrdersByRestaurant(restaurantId: string): Order[] {
    return this.getOrders().filter(o => o.restaurantId === restaurantId);
  }

  getAvailableOrdersForDelivery(): Order[] {
    return this.getOrders().filter(o => o.status === 'ready' && !o.deliveryAgentId);
  }

  getOrdersByDeliveryAgent(agentId: string): Order[] {
    return this.getOrders().filter(o => o.deliveryAgentId === agentId);
  }
}

export { RealTimeEvents };
export const storageService = new StorageService();