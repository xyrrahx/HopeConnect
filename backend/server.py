from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get('JWT_SECRET', 'hope-connect-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    favorites: List[str] = []
    sms_enabled: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    user: User

class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str
    address: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    lat: float
    lng: float
    services: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ResourceCreate(BaseModel):
    name: str
    category: str
    description: str
    address: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    lat: float
    lng: float
    services: List[str] = []

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    description: str
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: str
    salary: Optional[str] = None
    requirements: List[str] = []
    contact: str
    posted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    location: str
    lat: float
    lng: float
    type: str
    salary: Optional[str] = None
    requirements: List[str] = []
    contact: str

class Benefit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str
    eligibility: str
    how_to_apply: str
    website: Optional[str] = None
    phone: Optional[str] = None

class BenefitCreate(BaseModel):
    name: str
    category: str
    description: str
    eligibility: str
    how_to_apply: str
    website: Optional[str] = None
    phone: Optional[str] = None

class CommunityPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    title: str
    content: str
    category: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    likes: int = 0

class PostCreate(BaseModel):
    title: str
    content: str
    category: str

class EmergencyContact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    description: str
    available_24_7: bool = True

class SMSSubscription(BaseModel):
    phone: str
    enabled: bool

class SMSNotification(BaseModel):
    phone: str
    message: str

def create_token(user_id: str, email: str):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: Optional[HTTPAuthorizationCredentials]):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return payload

async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return verify_token(credentials)

@api_router.post("/auth/register", response_model=Token)
async def register(input: UserCreate):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = input.model_dump(exclude={"password"})
    user = User(**user_dict)
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['password_hash'] = pwd_context.hash(input.password)
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email)
    return {"token": token, "user": user}

@api_router.post("/auth/login", response_model=Token)
async def login(input: UserLogin):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc or not pwd_context.verify(input.password, user_doc.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_doc.pop('password_hash', None)
    user = User(**user_doc)
    
    token = create_token(user.id, user.email)
    return {"token": token, "user": user}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_doc.pop('password_hash', None)
    return User(**user_doc)

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(category: Optional[str] = None):
    query = {"category": category} if category else {}
    resources = await db.resources.find(query, {"_id": 0}).to_list(1000)
    
    for res in resources:
        if isinstance(res['created_at'], str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
    
    return resources

@api_router.post("/resources", response_model=Resource)
async def create_resource(input: ResourceCreate):
    resource = Resource(**input.model_dump())
    
    doc = resource.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.resources.insert_one(doc)
    return resource

@api_router.get("/resources/nearby")
async def get_nearby_resources(lat: float, lng: float, category: Optional[str] = None):
    query = {"category": category} if category else {}
    resources = await db.resources.find(query, {"_id": 0}).to_list(1000)
    
    for res in resources:
        if isinstance(res['created_at'], str):
            res['created_at'] = datetime.fromisoformat(res['created_at'])
    
    return resources

@api_router.get("/jobs/test")
async def test_jobs():
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(1000)
    return {"count": len(jobs), "first_job": jobs[0] if jobs else None}

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(type: Optional[str] = None):
    query = {"type": type} if type else {}
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(1000)
    
    for job in jobs:
        if isinstance(job['posted_at'], str):
            job['posted_at'] = datetime.fromisoformat(job['posted_at'])
        logging.info(f"Job {job.get('title')}: lat={job.get('lat')}, lng={job.get('lng')}")
    
    return jobs

@api_router.post("/jobs", response_model=Job)
async def create_job(input: JobCreate):
    job = Job(**input.model_dump())
    
    doc = job.model_dump()
    doc['posted_at'] = doc['posted_at'].isoformat()
    
    await db.jobs.insert_one(doc)
    return job

@api_router.get("/benefits", response_model=List[Benefit])
async def get_benefits(category: Optional[str] = None):
    query = {"category": category} if category else {}
    benefits = await db.benefits.find(query, {"_id": 0}).to_list(1000)
    return benefits

@api_router.post("/benefits", response_model=Benefit)
async def create_benefit(input: BenefitCreate):
    benefit = Benefit(**input.model_dump())
    await db.benefits.insert_one(benefit.model_dump())
    return benefit

@api_router.get("/community", response_model=List[CommunityPost])
async def get_posts(category: Optional[str] = None):
    query = {"category": category} if category else {}
    posts = await db.community_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return posts

@api_router.post("/community", response_model=CommunityPost)
async def create_post(input: PostCreate, current_user = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    post = CommunityPost(
        user_id=current_user['user_id'],
        user_name=user_doc['name'],
        **input.model_dump()
    )
    
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.community_posts.insert_one(doc)
    return post

@api_router.get("/emergency", response_model=List[EmergencyContact])
async def get_emergency_contacts():
    contacts = await db.emergency_contacts.find({}, {"_id": 0}).to_list(1000)
    return contacts

@api_router.post("/sms/subscribe")
async def subscribe_sms(input: SMSSubscription, current_user = Depends(get_current_user_optional)):
    if current_user:
        await db.users.update_one(
            {"id": current_user['user_id']},
            {"$set": {"phone": input.phone, "sms_enabled": input.enabled}}
        )
    
    return {"status": "success", "message": "SMS notifications (MOCKED) updated"}

@api_router.post("/sms/send")
async def send_sms_notification(input: SMSNotification):
    logging.info(f"MOCKED SMS to {input.phone}: {input.message}")
    return {"status": "success", "message": "SMS sent (MOCKED)", "mocked": True}

@api_router.post("/user/favorites/{resource_id}")
async def toggle_favorite(resource_id: str, current_user = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorites = user_doc.get('favorites', [])
    if resource_id in favorites:
        favorites.remove(resource_id)
        action = "removed"
    else:
        favorites.append(resource_id)
        action = "added"
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$set": {"favorites": favorites}}
    )
    
    return {"status": "success", "action": action, "favorites": favorites}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    await db.emergency_contacts.delete_many({})
    emergency_contacts = [
        {"id": str(uuid.uuid4()), "name": "National Suicide Prevention Lifeline", "phone": "988", "description": "24/7 crisis support", "available_24_7": True},
        {"id": str(uuid.uuid4()), "name": "Crisis Text Line", "phone": "741741", "description": "Text HOME for 24/7 crisis support", "available_24_7": True},
        {"id": str(uuid.uuid4()), "name": "National Domestic Violence Hotline", "phone": "1-800-799-7233", "description": "24/7 support for domestic violence", "available_24_7": True},
        {"id": str(uuid.uuid4()), "name": "Homeless Shelter Directory", "phone": "211", "description": "Dial 211 for local resources", "available_24_7": True},
    ]
    await db.emergency_contacts.insert_many(emergency_contacts)
    
    count = await db.resources.count_documents({})
    if count == 0:
        sample_resources = [
            {"id": str(uuid.uuid4()), "name": "Hope Shelter", "category": "Shelter", "description": "Emergency overnight shelter with meals", "address": "123 Main St, City", "phone": "555-0101", "hours": "24/7", "lat": 40.7589, "lng": -73.9851, "services": ["Beds", "Meals", "Showers"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Food Bank", "category": "Food", "description": "Free groceries and hot meals", "address": "456 Oak Ave, City", "phone": "555-0102", "hours": "Mon-Fri 9AM-5PM", "lat": 40.7614, "lng": -73.9776, "services": ["Food Pantry", "Hot Meals"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Free Health Clinic", "category": "Healthcare", "description": "No-cost medical services", "address": "789 Elm St, City", "phone": "555-0103", "hours": "Tue-Thu 10AM-4PM", "lat": 40.7580, "lng": -73.9855, "services": ["Primary Care", "Dental", "Mental Health"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Central Park Public Restroom", "category": "Public Washroom", "description": "Clean public restroom facility", "address": "Central Park West, City", "phone": None, "hours": "6AM-10PM Daily", "lat": 40.7650, "lng": -73.9700, "services": ["Restrooms", "Wheelchair Accessible"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Library Plaza Washrooms", "category": "Public Washroom", "description": "Public washroom facilities near main library", "address": "5th Avenue, City", "phone": None, "hours": "7AM-9PM Daily", "lat": 40.7530, "lng": -73.9820, "services": ["Restrooms", "Baby Changing Station"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "City Hall Public Facilities", "category": "Public Washroom", "description": "Public restrooms at City Hall", "address": "City Hall Plaza, City", "phone": None, "hours": "8AM-6PM Weekdays", "lat": 40.7490, "lng": -73.9890, "services": ["Restrooms", "Wheelchair Accessible"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Transit Hub Washrooms", "category": "Public Washroom", "description": "Clean facilities at main transit center", "address": "Transit Center, City", "phone": None, "hours": "5AM-12AM Daily", "lat": 40.7550, "lng": -73.9750, "services": ["Restrooms", "Family Room", "Wheelchair Accessible"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Park & Ride Facilities", "category": "Public Washroom", "description": "Public restrooms at Park & Ride lot", "address": "North Park & Ride, City", "phone": None, "hours": "24/7", "lat": 40.7720, "lng": -73.9680, "services": ["Restrooms", "Wheelchair Accessible"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Waterfront Park Restrooms", "category": "Public Washroom", "description": "Waterfront public facilities", "address": "Waterfront Park, City", "phone": None, "hours": "6AM-9PM Daily", "lat": 40.7600, "lng": -73.9920, "services": ["Restrooms", "Outdoor Showers"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Downtown Community Centre", "category": "Community Centre", "description": "Free showers, recreation programs, and community support", "address": "100 Community Way, City", "phone": "555-0104", "hours": "Mon-Sat 8AM-8PM", "lat": 40.7560, "lng": -73.9880, "services": ["Free Showers", "Laundry", "Recreation", "Computer Access"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Riverside Recreation Center", "category": "Community Centre", "description": "Gym, showers, and activities for all ages", "address": "Riverside Drive, City", "phone": "555-0105", "hours": "Daily 7AM-9PM", "lat": 40.7690, "lng": -73.9750, "services": ["Free Showers", "Gym", "Swimming Pool", "Sports Programs"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "East Side Rec Centre", "category": "Community Centre", "description": "Community programs and shower facilities", "address": "East Side Ave, City", "phone": "555-0106", "hours": "Mon-Fri 6AM-10PM, Weekends 8AM-6PM", "lat": 40.7520, "lng": -73.9690, "services": ["Free Showers", "Fitness Classes", "Youth Programs"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Hope Laundromat", "category": "Free Laundromat", "description": "Government-funded free laundry service for those in need", "address": "250 Hope Street, City", "phone": "555-0107", "hours": "Mon-Sat 7AM-8PM", "lat": 40.7570, "lng": -73.9780, "services": ["Free Washers", "Free Dryers", "Detergent Provided", "Assistance Available"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Wash Center", "category": "Free Laundromat", "description": "Free laundry program - bring valid ID", "address": "412 Community Blvd, City", "phone": "555-0108", "hours": "Tue-Sun 8AM-7PM", "lat": 40.7620, "lng": -73.9830, "services": ["Free Washers", "Free Dryers", "Soap Included"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Clean Start Laundry", "category": "Free Laundromat", "description": "City-sponsored free laundry facility", "address": "88 Clean Way, City", "phone": "555-0109", "hours": "Mon-Fri 6AM-9PM, Sat 8AM-6PM", "lat": 40.7540, "lng": -73.9710, "services": ["Free Washers", "Free Dryers", "Detergent Available", "Folding Tables"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Fresh Threads Program", "category": "Free Laundromat", "description": "Non-profit free laundry service - no questions asked", "address": "156 Helping Hand St, City", "phone": "555-0110", "hours": "Daily 7AM-8PM", "lat": 40.7680, "lng": -73.9860, "services": ["Free Washers", "Free Dryers", "Free Soap", "Clothing Exchange"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Goodwill Clothing Bank", "category": "Clothing Bank", "description": "Free clothing for those in need - no purchase required", "address": "320 Charity Lane, City", "phone": "555-0111", "hours": "Mon-Sat 9AM-6PM", "lat": 40.7595, "lng": -73.9795, "services": ["Free Clothes", "Shoes", "Winter Gear", "Work Attire"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "St. Vincent's Clothing Closet", "category": "Clothing Bank", "description": "Free clothing and accessories - dignity for all", "address": "75 Church Street, City", "phone": "555-0112", "hours": "Tue-Fri 10AM-4PM", "lat": 40.7510, "lng": -73.9840, "services": ["Free Clothes", "Personal Care Items", "Shoes", "Accessories"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Clothes Closet", "category": "Clothing Bank", "description": "Free professional clothing and casual wear", "address": "200 Support Ave, City", "phone": "555-0113", "hours": "Mon-Thu 11AM-5PM", "lat": 40.7640, "lng": -73.9720, "services": ["Free Clothes", "Job Interview Attire", "Alterations", "Style Help"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Main Library Charging Station", "category": "Phone Charging", "description": "Free public charging outlets and USB ports", "address": "Public Library, 5th Ave, City", "phone": "555-0114", "hours": "Mon-Sat 9AM-9PM, Sun 12PM-6PM", "lat": 40.7535, "lng": -73.9815, "services": ["Wall Outlets", "USB Ports", "Wireless Charging", "WiFi"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Transit Center Power Hub", "category": "Phone Charging", "description": "24/7 charging stations with security", "address": "Main Transit Center, City", "phone": None, "hours": "24/7", "lat": 40.7552, "lng": -73.9748, "services": ["Wall Outlets", "USB Ports", "Secure Lockers", "WiFi"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Centre Charging", "category": "Phone Charging", "description": "Free charging while you use other services", "address": "100 Community Way, City", "phone": "555-0104", "hours": "Mon-Sat 8AM-8PM", "lat": 40.7560, "lng": -73.9880, "services": ["Wall Outlets", "USB Charging", "Phone Lockers"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Park Plaza Charging Bench", "category": "Phone Charging", "description": "Solar-powered outdoor charging bench", "address": "Central Park Plaza, City", "phone": None, "hours": "24/7 (weather permitting)", "lat": 40.7655, "lng": -73.9705, "services": ["USB Ports", "Solar Powered", "Outdoor Seating"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "City Hall Public Outlets", "category": "Phone Charging", "description": "Public charging area in lobby", "address": "City Hall, City", "phone": None, "hours": "Mon-Fri 8AM-6PM", "lat": 40.7492, "lng": -73.9888, "services": ["Wall Outlets", "Bench Seating", "Indoor Access"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Public Library WiFi", "category": "Free WiFi", "description": "High-speed free WiFi - no library card required", "address": "Public Library, 5th Ave, City", "phone": "555-0114", "hours": "Mon-Sat 9AM-9PM, Sun 12PM-6PM", "lat": 40.7535, "lng": -73.9815, "services": ["High-Speed WiFi", "Computer Access", "Printing", "Study Areas"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Centre WiFi", "category": "Free WiFi", "description": "Free WiFi for all visitors", "address": "100 Community Way, City", "phone": "555-0104", "hours": "Mon-Sat 8AM-8PM", "lat": 40.7560, "lng": -73.9880, "services": ["Free WiFi", "Computer Lab", "Tech Support"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Transit Center WiFi", "category": "Free WiFi", "description": "24/7 public WiFi hotspot", "address": "Main Transit Center, City", "phone": None, "hours": "24/7", "lat": 40.7552, "lng": -73.9748, "services": ["Free WiFi", "24/7 Access", "High Traffic Area"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "City Park WiFi Zone", "category": "Free WiFi", "description": "Outdoor WiFi coverage in park", "address": "Central Park, City", "phone": None, "hours": "24/7", "lat": 40.7652, "lng": -73.9702, "services": ["Free WiFi", "Outdoor Coverage", "Benches"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "City Hall Water Fountain", "category": "Water Refill", "description": "Free filtered water fountain", "address": "City Hall Plaza, City", "phone": None, "hours": "24/7 Outdoor Access", "lat": 40.7490, "lng": -73.9890, "services": ["Filtered Water", "Bottle Refill Station", "ADA Accessible"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Transit Hub Water Station", "category": "Water Refill", "description": "Multiple water stations inside transit center", "address": "Main Transit Center, City", "phone": None, "hours": "5AM-12AM", "lat": 40.7552, "lng": -73.9748, "services": ["Filtered Water", "Cold Water", "Multiple Stations"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Library Water Fountain", "category": "Water Refill", "description": "Filtered water fountain and bottle refill", "address": "Public Library, 5th Ave, City", "phone": "555-0114", "hours": "Mon-Sat 9AM-9PM, Sun 12PM-6PM", "lat": 40.7535, "lng": -73.9815, "services": ["Filtered Water", "Bottle Refill", "Indoor Access"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Park Water Fountain", "category": "Water Refill", "description": "Public fountain with bottle refill station", "address": "Central Park, City", "phone": None, "hours": "6AM-10PM (Seasonal)", "lat": 40.7650, "lng": -73.9700, "services": ["Filtered Water", "Bottle Refill", "Pet Fountain"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Recreation Center Water", "category": "Water Refill", "description": "Free water stations in rec center", "address": "Riverside Drive, City", "phone": "555-0105", "hours": "Daily 7AM-9PM", "lat": 40.7690, "lng": -73.9750, "services": ["Filtered Water", "Cold Water", "Sports Bottles OK"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Community Soup Kitchen", "category": "Free Meals", "description": "Hot meals served daily - no questions asked", "address": "45 Charity Street, City", "phone": "555-0115", "hours": "Breakfast 7-9AM, Lunch 12-2PM, Dinner 5-7PM", "lat": 40.7545, "lng": -73.9765, "services": ["Hot Meals", "Take-Out Available", "Dietary Accommodations"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "St. Mary's Meal Program", "category": "Free Meals", "description": "Free lunch and dinner program", "address": "88 Church Way, City", "phone": "555-0116", "hours": "Lunch 11AM-1PM, Dinner 5-7PM Daily", "lat": 40.7605, "lng": -73.9795, "services": ["Hot Meals", "Weekend Service", "Bag Lunches"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Hope Kitchen", "category": "Free Meals", "description": "Breakfast and lunch served - warm welcome", "address": "200 Hope Ave, City", "phone": "555-0117", "hours": "Mon-Fri: Breakfast 6-8AM, Lunch 11AM-1PM", "lat": 40.7575, "lng": -73.9725, "services": ["Hot Meals", "Coffee All Day", "Food Bags"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Dinner Program", "category": "Free Meals", "description": "Evening meals 7 days a week", "address": "Community Centre, City", "phone": "555-0104", "hours": "Daily 5:30-7PM", "lat": 40.7560, "lng": -73.9880, "services": ["Hot Dinner", "Family Friendly", "Vegetarian Options"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Safe Haven Harm Reduction", "category": "Harm Reduction", "description": "Harm reduction supplies and support - judgment-free", "address": "350 Health Street, City", "phone": "555-0118", "hours": "Mon-Fri 9AM-5PM", "lat": 40.7585, "lng": -73.9805, "services": ["Clean Supplies", "Naloxone/Narcan", "Drug Checking", "Fentanyl Test Strips", "Referrals"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Health Outreach", "category": "Harm Reduction", "description": "Mobile harm reduction services", "address": "Transit Center (mobile unit), City", "phone": "555-0119", "hours": "Tue-Thu 2-6PM, Sat 10AM-2PM", "lat": 40.7552, "lng": -73.9748, "services": ["Clean Needles", "Naloxone", "Drug Testing", "Safe Disposal", "Wound Care"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Street Medicine Program", "category": "Harm Reduction", "description": "Free harm reduction supplies - no ID required", "address": "100 Care Lane, City", "phone": "555-0120", "hours": "Mon-Sat 10AM-6PM", "lat": 40.7625, "lng": -73.9740, "services": ["Clean Supplies", "Naloxone Training", "Drug Checking Service", "Fentanyl Test Strips", "Overdose Prevention"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Legal Aid Society", "category": "Legal Aid", "description": "Free legal assistance for low-income individuals", "address": "75 Justice Way, City", "phone": "555-0121", "hours": "Mon-Fri 9AM-5PM", "lat": 40.7510, "lng": -73.9850, "services": ["Legal Consultation", "Court Representation", "Housing Issues", "Benefits Appeals"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Legal Center", "category": "Legal Aid", "description": "Walk-in legal help - no appointment needed", "address": "Community Centre, City", "phone": "555-0122", "hours": "Tue-Thu 1-4PM", "lat": 40.7560, "lng": -73.9880, "services": ["Legal Advice", "Document Review", "Referrals", "Know Your Rights"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Pro Bono Legal Clinic", "category": "Legal Aid", "description": "Free legal services by volunteer attorneys", "address": "200 Law Street, City", "phone": "555-0123", "hours": "Wed 5-8PM, Sat 10AM-2PM", "lat": 40.7595, "lng": -73.9770, "services": ["Free Legal Help", "Eviction Defense", "Criminal Records", "Family Law"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "ID Recovery Program", "category": "ID Services", "description": "Help obtaining identification documents - free of charge", "address": "50 Identity Lane, City", "phone": "555-0124", "hours": "Mon-Fri 10AM-4PM", "lat": 40.7530, "lng": -73.9800, "services": ["ID Applications", "Birth Certificates", "Social Security Cards", "Document Replacement"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Document Assistance Center", "category": "ID Services", "description": "Free help with ID and vital records", "address": "City Hall, City", "phone": "555-0125", "hours": "Tue-Thu 9AM-3PM", "lat": 40.7492, "lng": -73.9888, "services": ["ID Cards", "Birth Certificates", "Passport Photos", "Notary Services"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Homeless ID Project", "category": "ID Services", "description": "Specialized ID services for homeless individuals", "address": "Downtown Shelter, City", "phone": "555-0126", "hours": "Mon-Wed 1-5PM", "lat": 40.7555, "lng": -73.9815, "services": ["Free IDs", "Birth Certificate Replacement", "Mail Address Service", "Photo Services"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Veterans Support Center", "category": "Veterans Services", "description": "Comprehensive services for homeless and at-risk veterans", "address": "250 Veterans Way, City", "phone": "555-0127", "hours": "Mon-Fri 8AM-6PM", "lat": 40.7600, "lng": -73.9760, "services": ["Housing Assistance", "VA Benefits Help", "Job Training", "Mental Health"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Stand Down for Veterans", "category": "Veterans Services", "description": "Emergency services and resources for veterans", "address": "Community Centre, City", "phone": "555-0128", "hours": "Tue-Thu 9AM-4PM", "lat": 40.7560, "lng": -73.9880, "services": ["Emergency Supplies", "Medical Care", "Legal Aid", "Benefits Counseling"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Pets of the Homeless", "category": "Pet Services", "description": "Free veterinary care and pet food for homeless pets", "address": "100 Animal Lane, City", "phone": "555-0129", "hours": "Wed-Sat 10AM-4PM", "lat": 40.7580, "lng": -73.9790, "services": ["Free Vet Care", "Pet Food", "Vaccinations", "Emergency Care"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Community Pet Food Bank", "category": "Pet Services", "description": "Free pet food and supplies - no judgment", "address": "Food Bank Location, City", "phone": "555-0130", "hours": "Mon-Fri 12-3PM", "lat": 40.7615, "lng": -73.9775, "services": ["Dog Food", "Cat Food", "Pet Supplies", "Leashes/Collars"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Free Bus Pass Program", "category": "Transportation", "description": "Free monthly bus passes for those in need", "address": "Transit Center, City", "phone": "555-0131", "hours": "Mon-Fri 7AM-6PM", "lat": 40.7552, "lng": -73.9748, "services": ["Free Bus Passes", "Metro Cards", "Job Interview Transport"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Ride to Work Program", "category": "Transportation", "description": "Free transportation to job interviews and first weeks of work", "address": "Community Centre, City", "phone": "555-0132", "hours": "By Appointment", "lat": 40.7560, "lng": -73.9880, "services": ["Job Interview Rides", "Work Transportation", "Medical Appointments"], "created_at": datetime.now(timezone.utc).isoformat()},
            
            {"id": str(uuid.uuid4()), "name": "Summer Cooling Center", "category": "Seasonal Resources", "description": "Air-conditioned space during heat waves - open to all", "address": "Community Centre, City", "phone": "555-0104", "hours": "June-Sept: Daily 9AM-8PM when temp >90°F", "lat": 40.7560, "lng": -73.9880, "services": ["Air Conditioning", "Cold Water", "Rest Area", "Health Monitoring"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Winter Warming Center", "category": "Seasonal Resources", "description": "Emergency overnight shelter when temp below freezing", "address": "Downtown Church, City", "phone": "555-0133", "hours": "Nov-Mar: Opens when temp <32°F", "lat": 40.7540, "lng": -73.9820, "services": ["Overnight Shelter", "Hot Meals", "Blankets", "Hot Showers"], "created_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "name": "Cold Weather Outreach", "category": "Seasonal Resources", "description": "Mobile team providing winter supplies and transport to warming centers", "address": "Mobile Service, City", "phone": "555-0134", "hours": "Nov-Mar: 24/7 Hotline", "lat": 40.7589, "lng": -73.9851, "services": ["Winter Coats", "Blankets", "Hot Drinks", "Shelter Transport"], "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.resources.insert_many(sample_resources)
    
    job_count = await db.jobs.count_documents({})
    if job_count == 0:
        sample_jobs = [
            {"id": str(uuid.uuid4()), "title": "Warehouse Associate", "company": "QuickShip Logistics", "description": "Entry-level position, no experience needed", "location": "Downtown", "lat": 40.7500, "lng": -73.9900, "type": "Full-time", "salary": "$15/hr", "requirements": ["Must be 18+", "Able to lift 50lbs"], "contact": "jobs@quickship.com", "posted_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Kitchen Helper", "company": "Sunrise Diner", "description": "Help with food prep and cleaning", "location": "Midtown", "lat": 40.7589, "lng": -73.9851, "type": "Part-time", "salary": "$14/hr + tips", "requirements": ["Food handler's permit (we can help you get it)"], "contact": "555-0201", "posted_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "title": "Retail Cashier", "company": "Corner Market", "description": "Friendly cashier position", "location": "Uptown", "lat": 40.7700, "lng": -73.9700, "type": "Part-time", "salary": "$13.50/hr", "requirements": ["Customer service skills", "Basic math"], "contact": "555-0202", "posted_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.jobs.insert_many(sample_jobs)
    
    benefit_count = await db.benefits.count_documents({})
    if benefit_count == 0:
        sample_benefits = [
            {"id": str(uuid.uuid4()), "name": "SNAP (Food Stamps)", "category": "Food Assistance", "description": "Monthly benefits for groceries", "eligibility": "Income below 130% of poverty line", "how_to_apply": "Apply online or at local SNAP office", "website": "https://www.fns.usda.gov/snap", "phone": "1-800-221-5689"},
            {"id": str(uuid.uuid4()), "name": "Medicaid", "category": "Healthcare", "description": "Free or low-cost health coverage", "eligibility": "Low income individuals and families", "how_to_apply": "Apply through Healthcare.gov or state Medicaid office", "website": "https://www.medicaid.gov", "phone": "1-877-267-2323"},
            {"id": str(uuid.uuid4()), "name": "Housing Assistance (Section 8)", "category": "Housing", "description": "Vouchers to help pay rent", "eligibility": "Very low income families", "how_to_apply": "Contact local Public Housing Agency", "website": "https://www.hud.gov", "phone": "1-800-569-4287"},
        ]
        await db.benefits.insert_many(sample_benefits)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()