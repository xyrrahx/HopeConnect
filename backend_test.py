import requests
import sys
import json
from datetime import datetime

class HopeConnectAPITester:
    def __init__(self, base_url="https://hope-connect-10.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n=== TESTING AUTHENTICATION ===")
        
        # Test registration
        register_data = {
            "email": "demo@hopeconnect.com",
            "password": "demo123",
            "name": "Demo User",
            "phone": "+1234567890"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"✅ Registration successful, token obtained")
        else:
            # Try login if registration fails (user might already exist)
            login_data = {
                "email": "demo@hopeconnect.com",
                "password": "demo123"
            }
            
            success, response = self.run_test(
                "User Login",
                "POST",
                "auth/login",
                200,
                data=login_data
            )
            
            if success and 'token' in response:
                self.token = response['token']
                self.user_id = response['user']['id']
                print(f"✅ Login successful, token obtained")

        # Test get current user
        if self.token:
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )

    def test_resources_endpoints(self):
        """Test resources endpoints"""
        print("\n=== TESTING RESOURCES ===")
        
        # Get all resources
        success, resources = self.run_test(
            "Get All Resources",
            "GET",
            "resources",
            200
        )
        
        if success and resources:
            print(f"✅ Found {len(resources)} resources")
            
            # Test filtering by category
            if resources:
                categories = set(r.get('category') for r in resources)
                for category in list(categories)[:2]:  # Test first 2 categories
                    self.run_test(
                        f"Filter Resources by {category}",
                        "GET",
                        f"resources?category={category}",
                        200
                    )
        
        # Test nearby resources (mocked)
        self.run_test(
            "Get Nearby Resources",
            "GET",
            "resources/nearby?lat=40.7589&lng=-73.9851",
            200
        )

    def test_jobs_endpoints(self):
        """Test jobs endpoints"""
        print("\n=== TESTING JOBS ===")
        
        # Get all jobs
        success, jobs = self.run_test(
            "Get All Jobs",
            "GET",
            "jobs",
            200
        )
        
        if success and jobs:
            print(f"✅ Found {len(jobs)} jobs")
            
            # Test filtering by type
            if jobs:
                job_types = set(j.get('type') for j in jobs)
                for job_type in list(job_types)[:2]:  # Test first 2 types
                    self.run_test(
                        f"Filter Jobs by {job_type}",
                        "GET",
                        f"jobs?type={job_type}",
                        200
                    )

    def test_benefits_endpoints(self):
        """Test benefits endpoints"""
        print("\n=== TESTING BENEFITS ===")
        
        # Get all benefits
        success, benefits = self.run_test(
            "Get All Benefits",
            "GET",
            "benefits",
            200
        )
        
        if success and benefits:
            print(f"✅ Found {len(benefits)} benefits")
            
            # Test filtering by category
            if benefits:
                categories = set(b.get('category') for b in benefits)
                for category in list(categories)[:2]:  # Test first 2 categories
                    self.run_test(
                        f"Filter Benefits by {category}",
                        "GET",
                        f"benefits?category={category}",
                        200
                    )

    def test_community_endpoints(self):
        """Test community endpoints"""
        print("\n=== TESTING COMMUNITY ===")
        
        # Get all posts
        success, posts = self.run_test(
            "Get Community Posts",
            "GET",
            "community",
            200
        )
        
        if success:
            print(f"✅ Found {len(posts)} community posts")
        
        # Test creating a post (requires auth)
        if self.token:
            post_data = {
                "title": "Test Post",
                "content": "This is a test post from the API tester",
                "category": "General"
            }
            
            self.run_test(
                "Create Community Post",
                "POST",
                "community",
                200,
                data=post_data
            )

    def test_emergency_endpoints(self):
        """Test emergency endpoints"""
        print("\n=== TESTING EMERGENCY ===")
        
        # Get emergency contacts
        success, contacts = self.run_test(
            "Get Emergency Contacts",
            "GET",
            "emergency",
            200
        )
        
        if success and contacts:
            print(f"✅ Found {len(contacts)} emergency contacts")

    def test_favorites_endpoints(self):
        """Test favorites functionality"""
        print("\n=== TESTING FAVORITES ===")
        
        if not self.token:
            print("❌ Skipping favorites tests - no auth token")
            return
        
        # Get resources first to have an ID to favorite
        success, resources = self.run_test(
            "Get Resources for Favorites Test",
            "GET",
            "resources",
            200
        )
        
        if success and resources:
            resource_id = resources[0]['id']
            
            # Toggle favorite
            self.run_test(
                "Toggle Favorite Resource",
                "POST",
                f"user/favorites/{resource_id}",
                200
            )

    def test_sms_endpoints(self):
        """Test SMS endpoints (mocked)"""
        print("\n=== TESTING SMS (MOCKED) ===")
        
        # Test SMS subscription
        if self.token:
            sms_data = {
                "phone": "+1234567890",
                "enabled": True
            }
            
            self.run_test(
                "SMS Subscription",
                "POST",
                "sms/subscribe",
                200,
                data=sms_data
            )
        
        # Test sending SMS notification
        notification_data = {
            "phone": "+1234567890",
            "message": "Test notification"
        }
        
        success, response = self.run_test(
            "Send SMS Notification",
            "POST",
            "sms/send",
            200,
            data=notification_data
        )
        
        if success and response.get('mocked'):
            print("✅ SMS is properly mocked")

def main():
    """Run all API tests"""
    print("🚀 Starting HopeConnect API Tests...")
    
    tester = HopeConnectAPITester()
    
    # Run all test suites
    tester.test_auth_flow()
    tester.test_resources_endpoints()
    tester.test_jobs_endpoints()
    tester.test_benefits_endpoints()
    tester.test_community_endpoints()
    tester.test_emergency_endpoints()
    tester.test_favorites_endpoints()
    tester.test_sms_endpoints()
    
    # Print final results
    print(f"\n📊 FINAL RESULTS:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())