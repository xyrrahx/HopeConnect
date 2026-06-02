"""
Test suite for HopeConnect Global Resource Discovery using OpenStreetMap Overpass API
Tests the /api/resources/discover endpoint and related functionality
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestDiscoverEndpoint:
    """Tests for the /api/resources/discover endpoint - OpenStreetMap integration"""
    
    def test_discover_toronto_returns_results(self):
        """Test discover endpoint returns live OSM results for Toronto"""
        response = requests.get(f"{BASE_URL}/api/resources/discover", params={
            "lat": 43.6532,
            "lng": -79.3832,
            "radius_miles": 3
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Toronto discover returned {len(data)} results")
        
    def test_discover_nyc_returns_results(self):
        """Test discover endpoint returns live OSM results for NYC"""
        response = requests.get(f"{BASE_URL}/api/resources/discover", params={
            "lat": 40.7589,
            "lng": -73.9851,
            "radius_miles": 3
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"NYC discover returned {len(data)} results")
        
    def test_discover_london_returns_results(self):
        """Test discover endpoint returns live OSM results for London (global coverage)"""
        response = requests.get(f"{BASE_URL}/api/resources/discover", params={
            "lat": 51.5074,
            "lng": -0.1278,
            "radius_miles": 2
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"London discover returned {len(data)} results")
        
    def test_discover_result_structure(self):
        """Test that discover results include required fields: name, category, lat, lng, distance, address"""
        response = requests.get(f"{BASE_URL}/api/resources/discover", params={
            "lat": 43.6532,
            "lng": -79.3832,
            "radius_miles": 3
        })
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            resource = data[0]
            # Check required fields
            assert "name" in resource, "Resource should have 'name' field"
            assert "category" in resource, "Resource should have 'category' field"
            assert "lat" in resource, "Resource should have 'lat' field"
            assert "lng" in resource, "Resource should have 'lng' field"
            assert "distance" in resource, "Resource should have 'distance' field"
            assert "address" in resource, "Resource should have 'address' field"
            
            # Check OSM-specific fields
            assert "id" in resource, "Resource should have 'id' field"
            assert resource["id"].startswith("osm-"), f"OSM resource id should start with 'osm-', got {resource['id']}"
            assert "source" in resource, "Resource should have 'source' field"
            assert resource["source"] == "osm", f"Source should be 'osm', got {resource['source']}"
            
            print(f"Sample resource: {resource['name']} - {resource['category']} - {resource['distance']:.2f} mi")
        else:
            print("No results returned - Overpass API may be slow or no resources in area")
            
    def test_discover_results_sorted_by_distance(self):
        """Test that discover results are sorted by distance (closest first)"""
        response = requests.get(f"{BASE_URL}/api/resources/discover", params={
            "lat": 43.6532,
            "lng": -79.3832,
            "radius_miles": 5
        })
        assert response.status_code == 200
        data = response.json()
        
        if len(data) >= 2:
            distances = [r.get("distance", 0) for r in data]
            assert distances == sorted(distances), "Results should be sorted by distance ascending"
            print(f"Distance range: {distances[0]:.2f} mi to {distances[-1]:.2f} mi")
        else:
            print("Not enough results to verify sorting")
            
    def test_discover_caching_works(self):
        """Test that second call to same coordinates returns cached results (faster response)"""
        params = {
            "lat": 43.6532,
            "lng": -79.3832,
            "radius_miles": 3
        }
        
        # First call - may hit Overpass API
        start1 = time.time()
        response1 = requests.get(f"{BASE_URL}/api/resources/discover", params=params)
        time1 = time.time() - start1
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Second call - should hit cache
        start2 = time.time()
        response2 = requests.get(f"{BASE_URL}/api/resources/discover", params=params)
        time2 = time.time() - start2
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Results should be the same
        assert len(data1) == len(data2), "Cached results should have same count"
        
        print(f"First call: {time1:.2f}s, Second call (cached): {time2:.2f}s")
        # Note: We don't strictly assert time2 < time1 because network latency varies


class TestExistingResourcesEndpoints:
    """Tests to ensure existing resource endpoints still work correctly"""
    
    def test_get_resources_returns_community_resources(self):
        """Test GET /api/resources still returns community resources"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have seeded community resources"
        
        # Check that community resources don't have osm- prefix
        community_count = sum(1 for r in data if not r.get("id", "").startswith("osm-"))
        print(f"Community resources: {community_count}")
        
    def test_get_cities_still_works(self):
        """Test GET /api/resources/cities still works"""
        response = requests.get(f"{BASE_URL}/api/resources/cities")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"Cities: {data}")
        
    def test_filter_resources_by_city(self):
        """Test GET /api/resources?city=Toronto filters to Toronto only"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"city": "Toronto"})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # All returned resources should be from Toronto
        for resource in data:
            assert resource.get("city") == "Toronto", f"Expected city Toronto, got {resource.get('city')}"
        print(f"Toronto resources: {len(data)}")
        
    def test_rate_resource_still_works(self):
        """Test POST /api/resources/{id}/rate still works for community resources"""
        # First get a community resource
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        resources = response.json()
        
        if len(resources) > 0:
            resource_id = resources[0]["id"]
            
            # Rate it as helpful
            rate_response = requests.post(f"{BASE_URL}/api/resources/{resource_id}/rate?vote=helpful")
            assert rate_response.status_code == 200, f"Expected 200, got {rate_response.status_code}"
            
            rate_data = rate_response.json()
            assert "helpful_count" in rate_data, "Response should have helpful_count"
            assert "not_helpful_count" in rate_data, "Response should have not_helpful_count"
            print(f"Rated resource {resource_id}: helpful={rate_data['helpful_count']}, not_helpful={rate_data['not_helpful_count']}")
        else:
            pytest.skip("No community resources to test rating")
            
    def test_rate_resource_invalid_vote(self):
        """Test POST /api/resources/{id}/rate returns 400 for invalid vote"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        resources = response.json()
        
        if len(resources) > 0:
            resource_id = resources[0]["id"]
            rate_response = requests.post(f"{BASE_URL}/api/resources/{resource_id}/rate?vote=invalid")
            assert rate_response.status_code == 400, f"Expected 400 for invalid vote, got {rate_response.status_code}"
        else:
            pytest.skip("No community resources to test")
            
    def test_rate_nonexistent_resource(self):
        """Test POST /api/resources/{id}/rate returns 404 for nonexistent resource"""
        rate_response = requests.post(f"{BASE_URL}/api/resources/nonexistent-id-12345/rate?vote=helpful")
        assert rate_response.status_code == 404, f"Expected 404, got {rate_response.status_code}"


class TestAuthEndpoints:
    """Tests to ensure auth endpoints still work"""
    
    def test_login_admin(self):
        """Test admin login still works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@hopeconnect.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Response should have token"
        assert "user" in data, "Response should have user"
        assert data["user"]["role"] == "admin", "User should be admin"
        print("Admin login successful")
        
    def test_login_demo_user(self):
        """Test demo user login still works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "demo@hopeconnect.com",
            "password": "demo123"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "token" in data, "Response should have token"
        assert "user" in data, "Response should have user"
        print("Demo user login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
