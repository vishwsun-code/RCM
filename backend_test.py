#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class MedicalERPTester:
    def __init__(self, base_url="https://medi-inventory-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.company_id = "demo-company"
        
        # Test data storage
        self.created_category_id = None
        self.created_item_id = None
        self.created_customer_id = None
        self.created_supplier_id = None

    def log_result(self, test_name, success, details="", error_msg=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {error_msg}")
        
        self.test_results.append({
            "test_name": test_name,
            "success": success,
            "details": details,
            "error": error_msg
        })

    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            return response
        except Exception as e:
            return None

    def test_health_check(self):
        """Test API health check"""
        response = self.make_request('GET', '')
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("API Health Check", True, f"API Version: {data.get('version', 'Unknown')}")
            return True
        else:
            self.log_result("API Health Check", False, error_msg="API not responding")
            return False

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@medicalerp.com",
            "name": "Test User",
            "phone": "9876543210",
            "role": "admin",
            "company_id": self.company_id,
            "password": "TestPass123!"
        }
        
        response = self.make_request('POST', 'auth/register', test_user_data)
        if response and response.status_code == 200:
            self.log_result("User Registration", True, "User registered successfully")
            return True, test_user_data
        else:
            error_msg = response.json().get('detail', 'Registration failed') if response else 'No response'
            self.log_result("User Registration", False, error_msg=error_msg)
            return False, None

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get('access_token')
            self.user_data = data.get('user')
            self.log_result("User Login", True, f"Token received, User: {self.user_data.get('name')}")
            return True
        else:
            error_msg = response.json().get('detail', 'Login failed') if response else 'No response'
            self.log_result("User Login", False, error_msg=error_msg)
            return False

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint"""
        response = self.make_request('GET', 'dashboard/summary', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Dashboard Summary", True, 
                          f"Customers: {data.get('total_customers', 0)}, "
                          f"Suppliers: {data.get('total_suppliers', 0)}, "
                          f"Items: {data.get('total_items', 0)}")
            return True
        else:
            error_msg = response.json().get('detail', 'Dashboard failed') if response else 'No response'
            self.log_result("Dashboard Summary", False, error_msg=error_msg)
            return False

    def test_create_category(self):
        """Test creating item category"""
        category_data = {
            "name": "Test Medicines",
            "description": "Test category for medicines",
            "company_id": self.company_id
        }
        
        response = self.make_request('POST', 'categories', category_data)
        if response and response.status_code == 200:
            data = response.json()
            self.created_category_id = data.get('category_id')
            self.log_result("Create Category", True, f"Category ID: {self.created_category_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Category creation failed') if response else 'No response'
            self.log_result("Create Category", False, error_msg=error_msg)
            return False

    def test_get_categories(self):
        """Test getting categories"""
        response = self.make_request('GET', 'categories', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Categories", True, f"Found {len(data)} categories")
            return True
        else:
            error_msg = response.json().get('detail', 'Get categories failed') if response else 'No response'
            self.log_result("Get Categories", False, error_msg=error_msg)
            return False

    def test_create_item(self):
        """Test creating item"""
        if not self.created_category_id:
            self.log_result("Create Item", False, error_msg="No category available")
            return False
            
        item_data = {
            "name": "Test Paracetamol 500mg",
            "description": "Test medicine for fever",
            "sku": f"MED-{datetime.now().strftime('%H%M%S')}",
            "hsn_code": "30049099",
            "category_id": self.created_category_id,
            "unit": "tablets",
            "gst_rate": 12.0,
            "purchase_price": 100.0,
            "selling_price": 150.0,
            "min_stock_level": 10,
            "max_stock_level": 1000,
            "is_batch_tracked": True,
            "company_id": self.company_id
        }
        
        response = self.make_request('POST', 'items', item_data)
        if response and response.status_code == 200:
            data = response.json()
            self.created_item_id = data.get('item_id')
            self.log_result("Create Item", True, f"Item ID: {self.created_item_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Item creation failed') if response else 'No response'
            self.log_result("Create Item", False, error_msg=error_msg)
            return False

    def test_get_items(self):
        """Test getting items"""
        response = self.make_request('GET', 'items', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Items", True, f"Found {len(data)} items")
            return True
        else:
            error_msg = response.json().get('detail', 'Get items failed') if response else 'No response'
            self.log_result("Get Items", False, error_msg=error_msg)
            return False

    def test_create_customer(self):
        """Test creating customer"""
        customer_data = {
            "name": "Test Customer Ltd",
            "email": "customer@testcompany.com",
            "phone": "9876543210",
            "gstin": "22AAAAA0000A1Z5",
            "billing_address": "123 Test Street, Test Area",
            "shipping_address": "123 Test Street, Test Area",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001",
            "credit_limit": 50000.0,
            "credit_days": 30,
            "company_id": self.company_id
        }
        
        response = self.make_request('POST', 'customers', customer_data)
        if response and response.status_code == 200:
            data = response.json()
            self.created_customer_id = data.get('customer_id')
            self.log_result("Create Customer", True, f"Customer ID: {self.created_customer_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Customer creation failed') if response else 'No response'
            self.log_result("Create Customer", False, error_msg=error_msg)
            return False

    def test_get_customers(self):
        """Test getting customers"""
        response = self.make_request('GET', 'customers', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Customers", True, f"Found {len(data)} customers")
            return True
        else:
            error_msg = response.json().get('detail', 'Get customers failed') if response else 'No response'
            self.log_result("Get Customers", False, error_msg=error_msg)
            return False

    def test_create_supplier(self):
        """Test creating supplier"""
        supplier_data = {
            "name": "Test Supplier Pvt Ltd",
            "email": "supplier@testcompany.com",
            "phone": "9876543211",
            "gstin": "22BBBBB0000B1Z5",
            "address": "456 Supplier Street, Industrial Area",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411001",
            "payment_terms": "Net 30",
            "company_id": self.company_id
        }
        
        response = self.make_request('POST', 'suppliers', supplier_data)
        if response and response.status_code == 200:
            data = response.json()
            self.created_supplier_id = data.get('supplier_id')
            self.log_result("Create Supplier", True, f"Supplier ID: {self.created_supplier_id}")
            return True
        else:
            error_msg = response.json().get('detail', 'Supplier creation failed') if response else 'No response'
            self.log_result("Create Supplier", False, error_msg=error_msg)
            return False

    def test_get_suppliers(self):
        """Test getting suppliers"""
        response = self.make_request('GET', 'suppliers', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Suppliers", True, f"Found {len(data)} suppliers")
            return True
        else:
            error_msg = response.json().get('detail', 'Get suppliers failed') if response else 'No response'
            self.log_result("Get Suppliers", False, error_msg=error_msg)
            return False

    def test_stock_endpoints(self):
        """Test stock-related endpoints"""
        # Test get stock
        response = self.make_request('GET', 'stock', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Stock", True, f"Found {len(data)} stock records")
        else:
            error_msg = response.json().get('detail', 'Get stock failed') if response else 'No response'
            self.log_result("Get Stock", False, error_msg=error_msg)

        # Test get batches
        response = self.make_request('GET', 'batches', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Batches", True, f"Found {len(data)} batch records")
        else:
            error_msg = response.json().get('detail', 'Get batches failed') if response else 'No response'
            self.log_result("Get Batches", False, error_msg=error_msg)

        # Test get stock movements
        response = self.make_request('GET', 'stock-movements', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Stock Movements", True, f"Found {len(data)} movement records")
        else:
            error_msg = response.json().get('detail', 'Get stock movements failed') if response else 'No response'
            self.log_result("Get Stock Movements", False, error_msg=error_msg)

    def test_order_endpoints(self):
        """Test order-related endpoints"""
        # Test get purchase orders
        response = self.make_request('GET', 'purchase-orders', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Purchase Orders", True, f"Found {len(data)} purchase orders")
        else:
            error_msg = response.json().get('detail', 'Get purchase orders failed') if response else 'No response'
            self.log_result("Get Purchase Orders", False, error_msg=error_msg)

        # Test get sales orders
        response = self.make_request('GET', 'sales-orders', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Sales Orders", True, f"Found {len(data)} sales orders")
        else:
            error_msg = response.json().get('detail', 'Get sales orders failed') if response else 'No response'
            self.log_result("Get Sales Orders", False, error_msg=error_msg)

        # Test get invoices
        response = self.make_request('GET', 'invoices', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Invoices", True, f"Found {len(data)} invoices")
        else:
            error_msg = response.json().get('detail', 'Get invoices failed') if response else 'No response'
            self.log_result("Get Invoices", False, error_msg=error_msg)

        # Test get GRNs
        response = self.make_request('GET', 'grn', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get GRNs", True, f"Found {len(data)} GRN records")
        else:
            error_msg = response.json().get('detail', 'Get GRNs failed') if response else 'No response'
            self.log_result("Get GRNs", False, error_msg=error_msg)

        # Test get payments
        response = self.make_request('GET', 'payments', params={'company_id': self.company_id})
        if response and response.status_code == 200:
            data = response.json()
            self.log_result("Get Payments", True, f"Found {len(data)} payment records")
        else:
            error_msg = response.json().get('detail', 'Get payments failed') if response else 'No response'
            self.log_result("Get Payments", False, error_msg=error_msg)

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Medical ERP Backend API Tests...")
        print(f"📍 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ API health check failed. Stopping tests.")
            return False
        
        # Authentication flow
        success, user_data = self.test_user_registration()
        if not success:
            print("❌ User registration failed. Stopping tests.")
            return False
            
        if not self.test_user_login(user_data):
            print("❌ User login failed. Stopping tests.")
            return False
        
        # Core functionality tests
        self.test_dashboard_summary()
        
        # Item management
        self.test_create_category()
        self.test_get_categories()
        self.test_create_item()
        self.test_get_items()
        
        # Customer & Supplier management
        self.test_create_customer()
        self.test_get_customers()
        self.test_create_supplier()
        self.test_get_suppliers()
        
        # Stock and order endpoints
        self.test_stock_endpoints()
        self.test_order_endpoints()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main function to run tests"""
    tester = MedicalERPTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "failed_tests": tester.tests_run - tester.tests_passed,
        "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())