import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type CartItem = MenuItem & { quantity: number };

export class SupabaseService {
  // Restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // Menu Items
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orderData = {
      ...order,
      delivery_agent_id: order.delivery_agent_id || null
    };
    
    console.log('Creating order in Supabase:', orderData); // Debug log
    
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error); // Debug log
      throw error;
    }
    
    console.log('Order created successfully:', data); // Debug log
    return data;
  }

  async updateOrderStatus(orderId: string, status: string, deliveryAgentId?: string): Promise<void> {
    console.log(`🔄 Updating order ${orderId} to status: ${status}`);
    
    const updateData: any = { status };
    if (deliveryAgentId) {
      updateData.delivery_agent_id = deliveryAgentId;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);
    
    if (error) {
      console.error('❌ Error updating order:', error);
      throw error;
    }
    
    console.log('✅ Order updated successfully');
  }

  async getOrdersByRestaurant(restaurantId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getAvailableOrdersForDelivery(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'ready')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getOrdersByDeliveryAgent(agentId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('delivery_agent_id', agentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  subscribeToRestaurants(callback: (restaurants: Restaurant[]) => void) {
    const channel = supabase
      .channel('restaurants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurants'
        },
        () => {
          this.getRestaurants().then(callback);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔄 Real-time order change detected:', payload.eventType, payload.new || payload.old);
          // Always fetch fresh data to ensure consistency
          this.getOrders().then(callback).catch(console.error);
        }
      )
      .subscribe((status) => {
        console.log('📡 Orders subscription status:', status);
      });

    return () => {
      console.log('🔌 Unsubscribing from orders channel');
      supabase.removeChannel(channel);
    };
  }

  subscribeToMenuItems(restaurantId: string, callback: (items: MenuItem[]) => void) {
    const channel = supabase
      .channel(`menu-items-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          this.getMenuItems(restaurantId).then(callback);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}

export const supabaseService = new SupabaseService();