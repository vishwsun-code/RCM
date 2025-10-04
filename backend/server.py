from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
import razorpay

# Import models
from models import *
from auth import *

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client (we'll need the keys from user)
try:
    razorpay_client = razorpay.Client(auth=(
        os.environ.get('RAZORPAY_KEY_ID', ''), 
        os.environ.get('RAZORPAY_KEY_SECRET', '')
    ))
except:
    razorpay_client = None

# Create the main app
app = FastAPI(title="Right Choice Medicare System", version="1.0.0")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Password context - using auth module functions instead
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Auth dependency
async def get_current_user_dep(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return await get_current_user(credentials, db)

# ============ AUTH ENDPOINTS ============

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    # Find user by email
    user_data = await db.users.find_one({"email": login_data.email})
    if not user_data or not verify_password(login_data.password, user_data.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = User(**user_data)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_id}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    user_dict["password_hash"] = hashed_password
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict(by_alias=True))
    return user

# ============ COMPANY & LOCATION ENDPOINTS ============

@api_router.post("/companies", response_model=Company)
async def create_company(company_data: Company, current_user: User = Depends(get_current_user_dep)):
    await db.companies.insert_one(company_data.dict(by_alias=True))
    return company_data

@api_router.get("/companies", response_model=List[Company])
async def get_companies(current_user: User = Depends(get_current_user_dep)):
    companies = await db.companies.find({}).to_list(length=None)
    return [Company(**company) for company in companies]

@api_router.post("/locations", response_model=Location)
async def create_location(location_data: Location, current_user: User = Depends(get_current_user_dep)):
    await db.locations.insert_one(location_data.dict(by_alias=True))
    return location_data

@api_router.get("/locations", response_model=List[Location])
async def get_locations(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    locations = await db.locations.find(query).to_list(length=None)
    return [Location(**location) for location in locations]

# ============ ITEM MANAGEMENT ENDPOINTS ============

@api_router.post("/categories", response_model=ItemCategory)
async def create_category(category_data: ItemCategory, current_user: User = Depends(get_current_user_dep)):
    await db.categories.insert_one(category_data.dict(by_alias=True))
    return category_data

@api_router.get("/categories", response_model=List[ItemCategory])
async def get_categories(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    categories = await db.categories.find(query).to_list(length=None)
    return [ItemCategory(**category) for category in categories]

@api_router.post("/items", response_model=Item)
async def create_item(item_data: Item, current_user: User = Depends(get_current_user_dep)):
    await db.items.insert_one(item_data.dict(by_alias=True))
    return item_data

@api_router.get("/items", response_model=List[Item])
async def get_items(company_id: Optional[str] = None, category_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    if category_id:
        query["category_id"] = category_id
    items = await db.items.find(query).to_list(length=None)
    return [Item(**item) for item in items]

@api_router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str, current_user: User = Depends(get_current_user_dep)):
    item = await db.items.find_one({"item_id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return Item(**item)

# ============ CUSTOMER & SUPPLIER ENDPOINTS ============

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: Customer, current_user: User = Depends(get_current_user_dep)):
    await db.customers.insert_one(customer_data.dict(by_alias=True))
    return customer_data

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    customers = await db.customers.find(query).to_list(length=None)
    return [Customer(**customer) for customer in customers]

@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier_data: Supplier, current_user: User = Depends(get_current_user_dep)):
    await db.suppliers.insert_one(supplier_data.dict(by_alias=True))
    return supplier_data

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    suppliers = await db.suppliers.find(query).to_list(length=None)
    return [Supplier(**supplier) for supplier in suppliers]

# ============ PURCHASE MANAGEMENT ENDPOINTS ============

@api_router.post("/purchase-orders", response_model=PurchaseOrder)
async def create_purchase_order(po_data: PurchaseOrder, current_user: User = Depends(get_current_user_dep)):
    po_data.created_by = current_user.user_id
    await db.purchase_orders.insert_one(po_data.dict(by_alias=True))
    return po_data

@api_router.get("/purchase-orders", response_model=List[PurchaseOrder])
async def get_purchase_orders(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    pos = await db.purchase_orders.find(query).to_list(length=None)
    return [PurchaseOrder(**po) for po in pos]

@api_router.get("/purchase-orders/{po_id}", response_model=PurchaseOrder)
async def get_purchase_order(po_id: str, current_user: User = Depends(get_current_user_dep)):
    po = await db.purchase_orders.find_one({"po_id": po_id})
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return PurchaseOrder(**po)

@api_router.post("/grn", response_model=GRN)
async def create_grn(grn_data: GRN, current_user: User = Depends(get_current_user_dep)):
    grn_data.created_by = current_user.user_id
    
    # Update stock for received items
    for item in grn_data.items:
        # Create or update stock
        existing_stock = await db.stock.find_one({
            "item_id": item.item_id,
            "location_id": grn_data.location_id,
            "company_id": grn_data.company_id
        })
        
        if existing_stock:
            await db.stock.update_one(
                {"stock_id": existing_stock["stock_id"]},
                {"$inc": {"quantity": item.received_quantity}}
            )
        else:
            new_stock = Stock(
                company_id=grn_data.company_id,
                item_id=item.item_id,
                location_id=grn_data.location_id,
                quantity=item.received_quantity
            )
            await db.stock.insert_one(new_stock.dict(by_alias=True))
        
        # Create batch if item is batch-tracked
        item_data = await db.items.find_one({"item_id": item.item_id})
        if item_data and item_data.get("is_batch_tracked", False) and item.batch_number:
            batch = Batch(
                company_id=grn_data.company_id,
                item_id=item.item_id,
                batch_number=item.batch_number,
                manufacturing_date=item.manufacturing_date,
                expiry_date=item.expiry_date,
                purchase_date=grn_data.grn_date,
                purchase_price=item.unit_price,
                quantity_received=item.received_quantity,
                quantity_available=item.received_quantity,
                location_id=grn_data.location_id
            )
            await db.batches.insert_one(batch.dict(by_alias=True))
        
        # Create stock movement
        movement = StockMovement(
            company_id=grn_data.company_id,
            item_id=item.item_id,
            location_id=grn_data.location_id,
            movement_type=StockMovementType.PURCHASE,
            quantity=item.received_quantity,
            reference_id=grn_data.po_id,
            reference_type="purchase_order",
            created_by=current_user.user_id
        )
        await db.stock_movements.insert_one(movement.dict(by_alias=True))
    
    await db.grn.insert_one(grn_data.dict(by_alias=True))
    return grn_data

@api_router.get("/grn", response_model=List[GRN])
async def get_grns(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    grns = await db.grn.find(query).to_list(length=None)
    return [GRN(**grn) for grn in grns]

# ============ SALES MANAGEMENT ENDPOINTS ============

@api_router.post("/sales-orders", response_model=SalesOrder)
async def create_sales_order(so_data: SalesOrder, current_user: User = Depends(get_current_user_dep)):
    so_data.created_by = current_user.user_id
    await db.sales_orders.insert_one(so_data.dict(by_alias=True))
    return so_data

@api_router.get("/sales-orders", response_model=List[SalesOrder])
async def get_sales_orders(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    sos = await db.sales_orders.find(query).to_list(length=None)
    return [SalesOrder(**so) for so in sos]

@api_router.get("/sales-orders/{so_id}", response_model=SalesOrder)
async def get_sales_order(so_id: str, current_user: User = Depends(get_current_user_dep)):
    so = await db.sales_orders.find_one({"so_id": so_id})
    if not so:
        raise HTTPException(status_code=404, detail="Sales Order not found")
    return SalesOrder(**so)

@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice_data: Invoice, current_user: User = Depends(get_current_user_dep)):
    invoice_data.created_by = current_user.user_id
    invoice_data.balance_amount = invoice_data.total_amount - invoice_data.paid_amount
    
    # Update stock for invoiced items (FIFO logic)
    for item in invoice_data.items:
        # Find available stock using FIFO
        if invoice_data.company_id:
            stock_records = await db.stock.find({
                "item_id": item.item_id,
                "company_id": invoice_data.company_id,
                "quantity": {"$gt": 0}
            }).sort("last_updated", 1).to_list(length=None)
            
            remaining_qty = item.quantity
            for stock_record in stock_records:
                if remaining_qty <= 0:
                    break
                
                deduct_qty = min(remaining_qty, stock_record["quantity"])
                await db.stock.update_one(
                    {"stock_id": stock_record["stock_id"]},
                    {"$inc": {"quantity": -deduct_qty}}
                )
                remaining_qty -= deduct_qty
                
                # Create stock movement
                movement = StockMovement(
                    company_id=invoice_data.company_id,
                    item_id=item.item_id,
                    location_id=stock_record["location_id"],
                    movement_type=StockMovementType.SALE,
                    quantity=-deduct_qty,
                    reference_id=invoice_data.invoice_id,
                    reference_type="invoice",
                    created_by=current_user.user_id
                )
                await db.stock_movements.insert_one(movement.dict(by_alias=True))
    
    await db.invoices.insert_one(invoice_data.dict(by_alias=True))
    return invoice_data

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    invoices = await db.invoices.find(query).to_list(length=None)
    return [Invoice(**invoice) for invoice in invoices]

@api_router.get("/invoices/{invoice_id}", response_model=Invoice)
async def get_invoice(invoice_id: str, current_user: User = Depends(get_current_user_dep)):
    invoice = await db.invoices.find_one({"invoice_id": invoice_id})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return Invoice(**invoice)

# ============ STOCK & INVENTORY ENDPOINTS ============

@api_router.get("/stock", response_model=List[Stock])
async def get_stock(company_id: Optional[str] = None, location_id: Optional[str] = None, item_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    if location_id:
        query["location_id"] = location_id
    if item_id:
        query["item_id"] = item_id
    
    stock_records = await db.stock.find(query).to_list(length=None)
    return [Stock(**stock) for stock in stock_records]

@api_router.get("/batches", response_model=List[Batch])
async def get_batches(company_id: Optional[str] = None, item_id: Optional[str] = None, location_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    if item_id:
        query["item_id"] = item_id
    if location_id:
        query["location_id"] = location_id
    
    batches = await db.batches.find(query).to_list(length=None)
    return [Batch(**batch) for batch in batches]

@api_router.get("/stock-movements", response_model=List[StockMovement])
async def get_stock_movements(company_id: Optional[str] = None, item_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    if item_id:
        query["item_id"] = item_id
    
    movements = await db.stock_movements.find(query).sort("movement_date", -1).to_list(length=None)
    return [StockMovement(**movement) for movement in movements]

# ============ PAYMENT ENDPOINTS ============

class PaymentOrderRequest(BaseModel):
    invoice_id: str
    amount: float
    currency: str = "INR"

@api_router.post("/payments/create-order")
async def create_payment_order(order_data: PaymentOrderRequest, current_user: User = Depends(get_current_user_dep)):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Payment gateway not configured")
    
    try:
        razor_order = razorpay_client.order.create({
            "amount": int(order_data.amount * 100),  # Convert to paise
            "currency": order_data.currency,
            "payment_capture": 1
        })
        
        # Store payment order in DB
        payment_order = {
            "order_id": razor_order["id"],
            "invoice_id": order_data.invoice_id,
            "amount": order_data.amount,
            "currency": order_data.currency,
            "status": "created",
            "created_by": current_user.user_id,
            "created_at": datetime.now(timezone.utc)
        }
        await db.payment_orders.insert_one(payment_order)
        
        return razor_order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: Payment, current_user: User = Depends(get_current_user_dep)):
    payment_data.created_by = current_user.user_id
    
    # Update invoice paid amount
    invoice = await db.invoices.find_one({"invoice_id": payment_data.invoice_id})
    if invoice:
        new_paid_amount = invoice["paid_amount"] + payment_data.amount
        new_balance = invoice["total_amount"] - new_paid_amount
        
        # Update invoice status
        status = "paid" if new_balance <= 0 else "partially_paid"
        
        await db.invoices.update_one(
            {"invoice_id": payment_data.invoice_id},
            {
                "$set": {
                    "paid_amount": new_paid_amount,
                    "balance_amount": new_balance,
                    "status": status
                }
            }
        )
    
    await db.payments.insert_one(payment_data.dict(by_alias=True))
    return payment_data

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(company_id: Optional[str] = None, current_user: User = Depends(get_current_user_dep)):
    query = {}
    if company_id:
        query["company_id"] = company_id
    payments = await db.payments.find(query).to_list(length=None)
    return [Payment(**payment) for payment in payments]

# ============ DASHBOARD & REPORTS ENDPOINTS ============

@api_router.get("/dashboard/summary")
async def get_dashboard_summary(company_id: str, current_user: User = Depends(get_current_user_dep)):
    # Get key metrics
    total_customers = await db.customers.count_documents({"company_id": company_id})
    total_suppliers = await db.suppliers.count_documents({"company_id": company_id})
    total_items = await db.items.count_documents({"company_id": company_id})
    
    # Pending orders
    pending_sales_orders = await db.sales_orders.count_documents({
        "company_id": company_id,
        "status": {"$in": ["pending", "approved"]}
    })
    
    pending_purchase_orders = await db.purchase_orders.count_documents({
        "company_id": company_id,
        "status": {"$in": ["pending", "approved"]}
    })
    
    # Overdue invoices
    current_date = datetime.now(timezone.utc)
    overdue_invoices = await db.invoices.count_documents({
        "company_id": company_id,
        "due_date": {"$lt": current_date},
        "status": {"$in": ["pending", "partially_paid"]}
    })
    
    # Low stock items
    low_stock_items = []
    stock_records = await db.stock.find({"company_id": company_id}).to_list(length=None)
    for stock in stock_records:
        item = await db.items.find_one({"item_id": stock["item_id"]})
        if item and stock["quantity"] <= item.get("min_stock_level", 0):
            low_stock_items.append({
                "item_id": stock["item_id"],
                "item_name": item["name"],
                "current_stock": stock["quantity"],
                "min_level": item.get("min_stock_level", 0)
            })
    
    return {
        "total_customers": total_customers,
        "total_suppliers": total_suppliers,
        "total_items": total_items,
        "pending_sales_orders": pending_sales_orders,
        "pending_purchase_orders": pending_purchase_orders,
        "overdue_invoices": overdue_invoices,
        "low_stock_items": low_stock_items[:10]  # Limit to 10
    }

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Right Choice Medicare System API is running", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
