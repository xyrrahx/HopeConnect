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