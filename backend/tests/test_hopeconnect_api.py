"""
HopeConnect API Tests - Iteration 2
Tests for resources, jobs, benefits, emergency, and auth endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestResourcesAPI:
    """Tests for /api/resources endpoint"""
    
    def test_get_resources_returns_55_items(self):
        """Verify resources endpoint returns exactly 55 resources"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 55, f"Expected 55 resources, got {len(data)}"
    
    def test_resources_have_required_fields(self):
        """Verify each resource has required fields including lat/lng"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        data = response.json()
        
        for resource in data[:5]:  # Check first 5 resources
            assert "id" in resource
            assert "name" in resource
            assert "category" in resource
            assert "lat" in resource, f"Resource {resource.get('name')} missing lat"
            assert "lng" in resource, f"Resource {resource.get('name')} missing lng"
            assert isinstance(resource["lat"], (int, float))
            assert isinstance(resource["lng"], (int, float))
    
    def test_resources_filter_by_category(self):
        """Test filtering resources by category"""
        response = requests.get(f"{BASE_URL}/api/resources?category=Shelter")
        assert response.status_code == 200
        data = response.json()
        for resource in data:
            assert resource["category"] == "Shelter"


class TestJobsAPI:
    """Tests for /api/jobs endpoint"""
    
    def test_get_jobs_returns_3_items(self):
        """Verify jobs endpoint returns exactly 3 jobs"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 jobs, got {len(data)}"
    
    def test_jobs_have_lat_lng_for_directions(self):
        """Verify each job has lat/lng for Get Directions feature"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        
        for job in data:
            assert "lat" in job, f"Job {job.get('title')} missing lat"
            assert "lng" in job, f"Job {job.get('title')} missing lng"
            assert job["lat"] is not None, f"Job {job.get('title')} has null lat"
            assert job["lng"] is not None, f"Job {job.get('title')} has null lng"
            assert isinstance(job["lat"], (int, float))
            assert isinstance(job["lng"], (int, float))
    
    def test_jobs_have_required_fields(self):
        """Verify jobs have all required fields"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        
        for job in data:
            assert "id" in job
            assert "title" in job
            assert "company" in job
            assert "location" in job
            assert "type" in job
            assert "contact" in job
    
    def test_jobs_filter_by_type(self):
        """Test filtering jobs by type"""
        response = requests.get(f"{BASE_URL}/api/jobs?type=Full-time")
        assert response.status_code == 200
        data = response.json()
        for job in data:
            assert job["type"] == "Full-time"


class TestBenefitsAPI:
    """Tests for /api/benefits endpoint"""
    
    def test_get_benefits_returns_3_items(self):
        """Verify benefits endpoint returns exactly 3 benefits"""
        response = requests.get(f"{BASE_URL}/api/benefits")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 benefits, got {len(data)}"
    
    def test_benefits_have_required_fields(self):
        """Verify benefits have all required fields"""
        response = requests.get(f"{BASE_URL}/api/benefits")
        assert response.status_code == 200
        data = response.json()
        
        for benefit in data:
            assert "id" in benefit
            assert "name" in benefit
            assert "category" in benefit
            assert "description" in benefit
            assert "eligibility" in benefit
            assert "how_to_apply" in benefit


class TestEmergencyAPI:
    """Tests for /api/emergency endpoint"""
    
    def test_get_emergency_returns_4_contacts(self):
        """Verify emergency endpoint returns exactly 4 contacts"""
        response = requests.get(f"{BASE_URL}/api/emergency")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4, f"Expected 4 emergency contacts, got {len(data)}"
    
    def test_emergency_contacts_have_required_fields(self):
        """Verify emergency contacts have all required fields"""
        response = requests.get(f"{BASE_URL}/api/emergency")
        assert response.status_code == 200
        data = response.json()
        
        for contact in data:
            assert "id" in contact
            assert "name" in contact
            assert "phone" in contact
            assert "description" in contact
            assert "available_24_7" in contact


class TestAuthAPI:
    """Tests for authentication endpoints"""
    
    def test_login_with_valid_credentials(self):
        """Test login with demo user credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@hopeconnect.com",
            "password": "demo123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "demo@hopeconnect.com"
        assert data["user"]["name"] == "Demo User"
    
    def test_login_with_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@hopeconnect.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_register_new_user(self):
        """Test user registration"""
        import uuid
        test_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Test User"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == test_email
    
    def test_get_me_with_valid_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@hopeconnect.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        # Then get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "demo@hopeconnect.com"
    
    def test_get_me_without_token(self):
        """Test /auth/me endpoint without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401


class TestMockedSMSAPI:
    """Tests for MOCKED SMS endpoints"""
    
    def test_sms_send_is_mocked(self):
        """Verify SMS send endpoint returns mocked response"""
        response = requests.post(f"{BASE_URL}/api/sms/send", json={
            "phone": "+1234567890",
            "message": "Test message"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("mocked") == True or "MOCKED" in data.get("message", "")
    
    def test_sms_subscribe_works(self):
        """Test SMS subscription endpoint"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@hopeconnect.com",
            "password": "demo123"
        })
        token = login_response.json()["token"]
        
        response = requests.post(f"{BASE_URL}/api/sms/subscribe", 
            json={"phone": "+1234567890", "enabled": True},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
