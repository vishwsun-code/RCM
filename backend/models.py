from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
from bson import ObjectId
import uuid

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

# User Management
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"
    ACCOUNTANT = "accountant"

class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    phone: str
    role: UserRole
    company_id: str
    location_ids: List[str] = []
    password_hash: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserCreate(BaseModel):
    email: str
    name: str
    phone: str
    role: UserRole
    company_id: str
    location_ids: List[str] = []
    password: str

# Company & Location Management
class Company(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    company_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    gstin: str
    pan: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Location(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    location_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    is_warehouse: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Item & Inventory Management
class ItemCategory(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    category_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    parent_category_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Item(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    item_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: Optional[str] = None
    sku: str
    hsn_code: str  # HSN code for GST
    category_id: str
    unit: str  # kg, pieces, liters, etc.
    gst_rate: float  # GST percentage
    purchase_price: float
    selling_price: float
    min_stock_level: int = 0
    max_stock_level: Optional[int] = None
    is_batch_tracked: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Batch(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    batch_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    item_id: str
    batch_number: str
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    purchase_date: datetime
    purchase_price: float
    quantity_received: int
    quantity_available: int
    location_id: str
    supplier_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Stock(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    stock_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    item_id: str
    location_id: str
    batch_id: Optional[str] = None  # For batch-tracked items
    quantity: int
    reserved_quantity: int = 0  # For pending orders
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Customer & Supplier Management
class Customer(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    customer_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    email: Optional[str] = None
    phone: str
    gstin: Optional[str] = None
    billing_address: str
    shipping_address: Optional[str] = None
    city: str
    state: str
    pincode: str
    credit_limit: float = 0.0
    credit_days: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Supplier(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    supplier_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    email: Optional[str] = None
    phone: str
    gstin: Optional[str] = None
    address: str
    city: str
    state: str
    pincode: str
    payment_terms: str = "Net 30"
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Purchase Management
class PurchaseOrderStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    PARTIALLY_RECEIVED = "partially_received"
    RECEIVED = "received"
    CANCELLED = "cancelled"

class PurchaseOrderItem(BaseModel):
    item_id: str
    quantity: int
    unit_price: float
    gst_rate: float
    total_amount: float
    received_quantity: int = 0

class PurchaseOrder(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    po_id: str = Field(default_factory=lambda: f"PO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}")
    company_id: str
    supplier_id: str
    location_id: str
    po_number: str
    po_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expected_delivery: Optional[datetime] = None
    items: List[PurchaseOrderItem]
    subtotal: float
    gst_amount: float
    total_amount: float
    status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class GRNStatus(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    COMPLETE = "complete"

class GRNItem(BaseModel):
    item_id: str
    ordered_quantity: int
    received_quantity: int
    unit_price: float
    batch_number: Optional[str] = None
    manufacturing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class GRN(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    grn_id: str = Field(default_factory=lambda: f"GRN-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}")
    company_id: str
    po_id: str
    supplier_id: str
    location_id: str
    grn_number: str
    grn_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    items: List[GRNItem]
    status: GRNStatus = GRNStatus.PENDING
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Sales Management
class SalesOrderStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    PARTIALLY_FULFILLED = "partially_fulfilled"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"

class SalesOrderItem(BaseModel):
    item_id: str
    quantity: int
    unit_price: float
    gst_rate: float
    total_amount: float
    fulfilled_quantity: int = 0

class SalesOrder(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    so_id: str = Field(default_factory=lambda: f"SO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}")
    company_id: str
    customer_id: str
    location_id: str
    so_number: str
    so_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    delivery_date: Optional[datetime] = None
    items: List[SalesOrderItem]
    subtotal: float
    gst_amount: float
    total_amount: float
    status: SalesOrderStatus = SalesOrderStatus.DRAFT
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PAID = "paid"
    PARTIALLY_PAID = "partially_paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class InvoiceItem(BaseModel):
    item_id: str
    quantity: int
    unit_price: float
    gst_rate: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total_amount: float

class Invoice(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    invoice_id: str = Field(default_factory=lambda: f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}")
    company_id: str
    customer_id: str
    so_id: Optional[str] = None
    invoice_number: str
    invoice_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: Optional[datetime] = None
    items: List[InvoiceItem]
    subtotal: float
    total_cgst: float
    total_sgst: float
    total_igst: float
    total_gst: float
    total_amount: float
    paid_amount: float = 0.0
    balance_amount: float
    status: InvoiceStatus = InvoiceStatus.DRAFT
    payment_terms: str = "Net 30"
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Payment Management
class PaymentMode(str, Enum):
    CASH = "cash"
    CHEQUE = "cheque"
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CARD = "card"
    ONLINE = "online"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Payment(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    payment_id: str = Field(default_factory=lambda: f"PAY-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}")
    company_id: str
    invoice_id: str
    customer_id: str
    amount: float
    payment_mode: PaymentMode
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reference_number: Optional[str] = None
    gateway_payment_id: Optional[str] = None  # For online payments
    status: PaymentStatus = PaymentStatus.PENDING
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# GST & Accounting
class GSTReturn(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    return_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    month: int
    year: int
    gstr1_data: Optional[Dict[str, Any]] = None
    gstr3b_data: Optional[Dict[str, Any]] = None
    filed_date: Optional[datetime] = None
    is_filed: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Stock Movement Tracking
class StockMovementType(str, Enum):
    PURCHASE = "purchase"
    SALE = "sale"
    TRANSFER = "transfer"
    ADJUSTMENT = "adjustment"
    RETURN = "return"

class StockMovement(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    movement_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    item_id: str
    batch_id: Optional[str] = None
    location_id: str
    movement_type: StockMovementType
    quantity: int  # Positive for inward, negative for outward
    reference_id: str  # PO ID, SO ID, etc.
    reference_type: str  # "purchase_order", "sales_order", etc.
    movement_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
