import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Truck, 
  Package, 
  FileText, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/dashboard/summary?company_id=${user?.company_id || 'demo-company'}`);
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="w-16 h-8 bg-gray-300 rounded mb-2"></div>
                <div className="w-20 h-4 bg-gray-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Customers',
      value: dashboardData?.total_customers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/customers'
    },
    {
      title: 'Total Suppliers',
      value: dashboardData?.total_suppliers || 0,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/suppliers'
    },
    {
      title: 'Total Items',
      value: dashboardData?.total_items || 0,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/items'
    },
    {
      title: 'Pending Sales Orders',
      value: dashboardData?.pending_sales_orders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/sales-orders'
    }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your business overview.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Click to manage
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/purchase-orders">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-action-create-po">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            </Link>
            <Link to="/sales-orders">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-action-create-so">
                <FileText className="w-4 h-4 mr-2" />
                Create Sales Order
              </Button>
            </Link>
            <Link to="/items">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-action-add-item">
                <Package className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </Link>
            <Link to="/invoices">
              <Button variant="outline" className="w-full justify-start" data-testid="quick-action-create-invoice">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alerts & Notifications</span>
            </CardTitle>
            <CardDescription>
              Important items that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pending Orders */}
            {(dashboardData?.pending_purchase_orders || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200" data-testid="alert-pending-po">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {dashboardData.pending_purchase_orders} Pending Purchase Orders
                    </p>
                    <p className="text-xs text-yellow-600">Require approval or processing</p>
                  </div>
                </div>
                <Link to="/purchase-orders">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            )}

            {/* Overdue Invoices */}
            {(dashboardData?.overdue_invoices || 0) > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200" data-testid="alert-overdue-invoices">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {dashboardData.overdue_invoices} Overdue Invoices
                    </p>
                    <p className="text-xs text-red-600">Payment collection required</p>
                  </div>
                </div>
                <Link to="/invoices">
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            )}

            {/* Low Stock Items */}
            {(dashboardData?.low_stock_items?.length || 0) > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200" data-testid="alert-low-stock">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        {dashboardData.low_stock_items.length} Low Stock Items
                      </p>
                      <p className="text-xs text-orange-600">Reorder required</p>
                    </div>
                  </div>
                  <Link to="/inventory">
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
                
                {/* Show first few low stock items */}
                <div className="pl-6 space-y-1">
                  {dashboardData.low_stock_items.slice(0, 3).map((item, index) => (
                    <div key={item.item_id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{item.item_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.current_stock} / {item.min_level}
                      </Badge>
                    </div>
                  ))}
                  {dashboardData.low_stock_items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{dashboardData.low_stock_items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No alerts */}
            {(!dashboardData?.pending_purchase_orders && !dashboardData?.overdue_invoices && !dashboardData?.low_stock_items?.length) && (
              <div className="text-center py-8 text-gray-500" data-testid="no-alerts">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No alerts at this time</p>
                <p className="text-xs">All systems running smoothly!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
