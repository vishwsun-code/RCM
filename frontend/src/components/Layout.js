import { useState } from 'react';
import { useAuth } from '../App';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Building2, 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  FileText, 
  Warehouse, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  User,
  UserPlus
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Items', href: '/items', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Suppliers', href: '/suppliers', icon: Truck },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { name: 'Sales Orders', href: '/sales-orders', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Inventory', href: '/inventory', icon: Warehouse },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const settingsNavigation = [
    { name: 'Company Settings', href: '/settings/company', icon: Building2 },
    { name: 'User Management', href: '/settings/users', icon: UserPlus },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Medical ERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Settings
          </p>
          {settingsNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => mobile && setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full"
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="mobile-menu-btn">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Medical ERP</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
