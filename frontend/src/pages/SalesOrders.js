import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SalesOrders = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6" data-testid="sales-orders-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-gray-600 mt-1">Manage sales orders and customer fulfillment workflow</p>
        </div>
        <Button data-testid="create-so-btn">
          <Plus className="w-4 h-4 mr-2" />
          Create Sales Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Sales Orders</span>
          </CardTitle>
          <CardDescription>
            Track and manage your sales orders from creation to delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search sales orders..."
              className="flex-1"
              data-testid="search-so-input"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading sales orders...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sales orders found</p>
              <p className="text-sm text-gray-400 mt-1">Create your first sales order to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOrders;