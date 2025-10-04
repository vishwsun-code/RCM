import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Save } from 'lucide-react';
import { toast } from 'sonner';

const CompanySettings = () => {
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      toast.success('Company settings saved successfully');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6" data-testid="company-settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600 mt-1">Manage your company information and configuration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Company Information</span>
          </CardTitle>
          <CardDescription>
            Update your company details and GST information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  data-testid="company-name-input"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  placeholder="Your Company Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-gstin">GSTIN</Label>
                <Input
                  id="company-gstin"
                  data-testid="company-gstin-input"
                  value={companyData.gstin}
                  onChange={(e) => setCompanyData({...companyData, gstin: e.target.value})}
                  placeholder="22AAAAA0000A1Z5"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-pan">PAN</Label>
                <Input
                  id="company-pan"
                  data-testid="company-pan-input"
                  value={companyData.pan}
                  onChange={(e) => setCompanyData({...companyData, pan: e.target.value})}
                  placeholder="AAAAA1111A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  data-testid="company-phone-input"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                data-testid="company-email-input"
                value={companyData.email}
                onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                placeholder="info@company.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Textarea
                id="company-address"
                data-testid="company-address-input"
                value={companyData.address}
                onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                placeholder="Company address..."
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-city">City</Label>
                <Input
                  id="company-city"
                  data-testid="company-city-input"
                  value={companyData.city}
                  onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-state">State</Label>
                <Input
                  id="company-state"
                  data-testid="company-state-input"
                  value={companyData.state}
                  onChange={(e) => setCompanyData({...companyData, state: e.target.value})}
                  placeholder="Maharashtra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-pincode">Pincode</Label>
                <Input
                  id="company-pincode"
                  data-testid="company-pincode-input"
                  value={companyData.pincode}
                  onChange={(e) => setCompanyData({...companyData, pincode: e.target.value})}
                  placeholder="400001"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} data-testid="save-company-btn">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;