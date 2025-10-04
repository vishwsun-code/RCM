import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Truck, Edit, Eye, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { useAuth } from '../App';
import { toast } from 'sonner';

const SupplierManagement = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    payment_terms: 'Net 30',
    company_id: user?.company_id || 'demo-company'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers?company_id=${user?.company_id || 'demo-company'}`);
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers`, newSupplier);
      toast.success('Supplier added successfully');
      setNewSupplier({
        name: '',
        email: '',
        phone: '',
        gstin: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        payment_terms: 'Net 30',
        company_id: user?.company_id || 'demo-company'
      });
      setShowAddSupplier(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to add supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6" data-testid="supplier-management-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage your supplier database and vendor relationships</p>
        </div>
        <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
          <DialogTrigger asChild>
            <Button data-testid="add-supplier-btn">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier to your vendor database
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supp-name">Supplier Name</Label>
                  <Input
                    id="supp-name"
                    data-testid="supplier-name-input"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    placeholder="Supplier Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supp-phone">Phone</Label>
                  <Input
                    id="supp-phone"
                    data-testid="supplier-phone-input"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supp-email">Email</Label>
                  <Input
                    id="supp-email"
                    type="email"
                    data-testid="supplier-email-input"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    placeholder="supplier@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supp-gstin">GSTIN</Label>
                  <Input
                    id="supp-gstin"
                    data-testid="supplier-gstin-input"
                    value={newSupplier.gstin}
                    onChange={(e) => setNewSupplier({...newSupplier, gstin: e.target.value})}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supp-address">Address</Label>
                <Textarea
                  id="supp-address"
                  data-testid="supplier-address-input"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  placeholder="Supplier address..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supp-city">City</Label>
                  <Input
                    id="supp-city"
                    data-testid="supplier-city-input"
                    value={newSupplier.city}
                    onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supp-state">State</Label>
                  <Input
                    id="supp-state"
                    data-testid="supplier-state-input"
                    value={newSupplier.state}
                    onChange={(e) => setNewSupplier({...newSupplier, state: e.target.value})}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supp-pincode">Pincode</Label>
                  <Input
                    id="supp-pincode"
                    data-testid="supplier-pincode-input"
                    value={newSupplier.pincode}
                    onChange={(e) => setNewSupplier({...newSupplier, pincode: e.target.value})}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supp-payment-terms">Payment Terms</Label>
                <Input
                  id="supp-payment-terms"
                  data-testid="supplier-payment-terms-input"
                  value={newSupplier.payment_terms}
                  onChange={(e) => setNewSupplier({...newSupplier, payment_terms: e.target.value})}
                  placeholder="Net 30"
                  required
                />
              </div>
              
              <Button type="submit" data-testid="save-supplier-btn">Add Supplier</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Suppliers</span>
          </CardTitle>
          <CardDescription>
            Manage your supplier database and vendor information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search suppliers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="search-suppliers-input"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading suppliers...</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No suppliers found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first supplier to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <Table data-testid="suppliers-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier, index) => (
                    <TableRow key={supplier.supplier_id} data-testid={`supplier-row-${index}`}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{supplier.name}</p>
                          <p className="text-sm text-gray-500">
                            ID: {supplier.supplier_id.substring(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                          {supplier.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{supplier.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{supplier.city}, {supplier.state}</p>
                          <p className="text-xs text-gray-500">{supplier.pincode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.gstin ? (
                          <Badge variant="outline">{supplier.gstin}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No GSTIN</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.payment_terms}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`edit-supplier-${index}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" data-testid={`view-supplier-${index}`}>
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

export default SupplierManagement;