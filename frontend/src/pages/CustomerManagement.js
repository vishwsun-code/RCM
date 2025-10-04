import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Edit, Eye, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { useAuth } from '../App';
import { toast } from 'sonner';

const CustomerManagement = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    billing_address: '',
    shipping_address: '',
    city: '',
    state: '',
    pincode: '',
    credit_limit: '',
    credit_days: '',
    company_id: user?.company_id || 'demo-company'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers?company_id=${user?.company_id || 'demo-company'}`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/customers`, newCustomer);
      toast.success('Customer added successfully');
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        billing_address: '',
        shipping_address: '',
        city: '',
        state: '',
        pincode: '',
        credit_limit: '',
        credit_days: '',
        company_id: user?.company_id || 'demo-company'
      });
      setShowAddCustomer(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6" data-testid="customer-management-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer database and relationships</p>
        </div>
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogTrigger asChild>
            <Button data-testid="add-customer-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Customer Name</Label>
                  <Input
                    id="cust-name"
                    data-testid="customer-name-input"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Customer Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone">Phone</Label>
                  <Input
                    id="cust-phone"
                    data-testid="customer-phone-input"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-email">Email</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    data-testid="customer-email-input"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="customer@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-gstin">GSTIN</Label>
                  <Input
                    id="cust-gstin"
                    data-testid="customer-gstin-input"
                    value={newCustomer.gstin}
                    onChange={(e) => setNewCustomer({...newCustomer, gstin: e.target.value})}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cust-billing">Billing Address</Label>
                <Textarea
                  id="cust-billing"
                  data-testid="customer-billing-input"
                  value={newCustomer.billing_address}
                  onChange={(e) => setNewCustomer({...newCustomer, billing_address: e.target.value})}
                  placeholder="Billing address..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cust-shipping">Shipping Address</Label>
                <Textarea
                  id="cust-shipping"
                  data-testid="customer-shipping-input"
                  value={newCustomer.shipping_address}
                  onChange={(e) => setNewCustomer({...newCustomer, shipping_address: e.target.value})}
                  placeholder="Shipping address (if different)..."
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-city">City</Label>
                  <Input
                    id="cust-city"
                    data-testid="customer-city-input"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-state">State</Label>
                  <Input
                    id="cust-state"
                    data-testid="customer-state-input"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-pincode">Pincode</Label>
                  <Input
                    id="cust-pincode"
                    data-testid="customer-pincode-input"
                    value={newCustomer.pincode}
                    onChange={(e) => setNewCustomer({...newCustomer, pincode: e.target.value})}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cust-credit-limit">Credit Limit</Label>
                  <Input
                    id="cust-credit-limit"
                    type="number"
                    step="0.01"
                    data-testid="customer-credit-limit-input"
                    value={newCustomer.credit_limit}
                    onChange={(e) => setNewCustomer({...newCustomer, credit_limit: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-credit-days">Credit Days</Label>
                  <Input
                    id="cust-credit-days"
                    type="number"
                    data-testid="customer-credit-days-input"
                    value={newCustomer.credit_days}
                    onChange={(e) => setNewCustomer({...newCustomer, credit_days: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <Button type="submit" data-testid="save-customer-btn">Add Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Customers</span>
          </CardTitle>
          <CardDescription>
            Manage your customer database and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="search-customers-input"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <Table data-testid="customers-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Credit Terms</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={customer.customer_id} data-testid={`customer-row-${index}`}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-gray-500">
                            ID: {customer.customer_id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{customer.city}, {customer.state}</p>
                          <p className="text-xs text-gray-500">{customer.pincode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.gstin ? (
                          <Badge variant="outline">{customer.gstin}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No GSTIN</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">₹{parseFloat(customer.credit_limit || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{customer.credit_days} days</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`edit-customer-${index}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" data-testid={`view-customer-${index}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;