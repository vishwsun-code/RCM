import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Package, Edit, Eye } from 'lucide-react';
import axios from 'axios';
import { API } from '../App';
import { useAuth } from '../App';
import { toast } from 'sonner';

const ItemManagement = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    hsn_code: '',
    category_id: '',
    unit: '',
    gst_rate: '',
    purchase_price: '',
    selling_price: '',
    min_stock_level: '',
    max_stock_level: '',
    is_batch_tracked: false,
    company_id: user?.company_id || 'demo-company'
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    company_id: user?.company_id || 'demo-company'
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/items?company_id=${user?.company_id || 'demo-company'}`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories?company_id=${user?.company_id || 'demo-company'}`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/items`, newItem);
      toast.success('Item added successfully');
      setNewItem({
        name: '',
        description: '',
        sku: '',
        hsn_code: '',
        category_id: '',
        unit: '',
        gst_rate: '',
        purchase_price: '',
        selling_price: '',
        min_stock_level: '',
        max_stock_level: '',
        is_batch_tracked: false,
        company_id: user?.company_id || 'demo-company'
      });
      setShowAddItem(false);
      fetchItems();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/categories`, newCategory);
      toast.success('Category added successfully');
      setNewCategory({
        name: '',
        description: '',
        company_id: user?.company_id || 'demo-company'
      });
      setShowAddCategory(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div className="space-y-6" data-testid="item-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog and inventory items</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="add-category-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your items
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Category Name</Label>
                  <Input
                    id="cat-name"
                    data-testid="category-name-input"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Medicines, Surgical Items, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Textarea
                    id="cat-desc"
                    data-testid="category-desc-input"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Category description..."
                  />
                </div>
                <Button type="submit" data-testid="save-category-btn">Add Category</Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button data-testid="add-item-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory catalog
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      data-testid="item-name-input"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Paracetamol 500mg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-sku">SKU</Label>
                    <Input
                      id="item-sku"
                      data-testid="item-sku-input"
                      value={newItem.sku}
                      onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                      placeholder="MED-001"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-desc">Description</Label>
                  <Textarea
                    id="item-desc"
                    data-testid="item-desc-input"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Item description..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-category">Category</Label>
                    <Select 
                      value={newItem.category_id}
                      onValueChange={(value) => setNewItem({...newItem, category_id: value})}
                      required
                    >
                      <SelectTrigger data-testid="item-category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-unit">Unit</Label>
                    <Select 
                      value={newItem.unit}
                      onValueChange={(value) => setNewItem({...newItem, unit: value})}
                      required
                    >
                      <SelectTrigger data-testid="item-unit-select">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="tablets">Tablets</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="vials">Vials</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="ml">Milliliters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-hsn">HSN Code</Label>
                    <Input
                      id="item-hsn"
                      data-testid="item-hsn-input"
                      value={newItem.hsn_code}
                      onChange={(e) => setNewItem({...newItem, hsn_code: e.target.value})}
                      placeholder="30049099"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-gst">GST Rate (%)</Label>
                    <Select 
                      value={newItem.gst_rate}
                      onValueChange={(value) => setNewItem({...newItem, gst_rate: value})}
                      required
                    >
                      <SelectTrigger data-testid="item-gst-select">
                        <SelectValue placeholder="GST %" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-purchase-price">Purchase Price</Label>
                    <Input
                      id="item-purchase-price"
                      type="number"
                      step="0.01"
                      data-testid="item-purchase-price-input"
                      value={newItem.purchase_price}
                      onChange={(e) => setNewItem({...newItem, purchase_price: e.target.value})}
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-selling-price">Selling Price</Label>
                    <Input
                      id="item-selling-price"
                      type="number"
                      step="0.01"
                      data-testid="item-selling-price-input"
                      value={newItem.selling_price}
                      onChange={(e) => setNewItem({...newItem, selling_price: e.target.value})}
                      placeholder="150.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-min-stock">Min Stock Level</Label>
                    <Input
                      id="item-min-stock"
                      type="number"
                      data-testid="item-min-stock-input"
                      value={newItem.min_stock_level}
                      onChange={(e) => setNewItem({...newItem, min_stock_level: e.target.value})}
                      placeholder="10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-max-stock">Max Stock Level</Label>
                    <Input
                      id="item-max-stock"
                      type="number"
                      data-testid="item-max-stock-input"
                      value={newItem.max_stock_level}
                      onChange={(e) => setNewItem({...newItem, max_stock_level: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="batch-tracked"
                    data-testid="batch-tracked-switch"
                    checked={newItem.is_batch_tracked}
                    onCheckedChange={(checked) => setNewItem({...newItem, is_batch_tracked: checked})}
                  />
                  <Label htmlFor="batch-tracked">Enable Batch Tracking</Label>
                </div>
                
                <Button type="submit" data-testid="save-item-btn">Add Item</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Items Catalog</span>
          </CardTitle>
          <CardDescription>
            Manage your pharmaceutical products and inventory items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              data-testid="search-items-input"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first item to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <Table data-testid="items-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>GST Rate</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Batch Tracked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <TableRow key={item.item_id} data-testid={`item-row-${index}`}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.sku}</Badge>
                      </TableCell>
                      <TableCell>{getCategoryName(item.category_id)}</TableCell>
                      <TableCell className="capitalize">{item.unit}</TableCell>
                      <TableCell>₹{parseFloat(item.purchase_price).toFixed(2)}</TableCell>
                      <TableCell>₹{parseFloat(item.selling_price).toFixed(2)}</TableCell>
                      <TableCell>{item.gst_rate}%</TableCell>
                      <TableCell>{item.min_stock_level}</TableCell>
                      <TableCell>
                        {item.is_batch_tracked ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Batch Tracked
                          </Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="ghost" data-testid={`edit-item-${index}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" data-testid={`view-item-${index}`}>
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

export default ItemManagement;
