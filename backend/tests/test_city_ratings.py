"""
Test suite for HopeConnect new features:
1. Multi-city support with city filter
2. Anonymous thumbs up/down ratings on resource cards
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCitiesEndpoint:
    """Tests for GET /api/resources/cities endpoint"""
    
    def test_get_cities_returns_list(self):
        """GET /api/resources/cities should return a list of cities"""
        response = requests.get(f"{BASE_URL}/api/resources/cities")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        # At minimum, New York should exist from seed data
        assert len(data) >= 1, "Should have at least one city"
        print(f"Cities found: {data}")
    
    def test_cities_are_sorted(self):
        """Cities should be returned in sorted order"""
        response = requests.get(f"{BASE_URL}/api/resources/cities")
        assert response.status_code == 200
        
        data = response.json()
        assert data == sorted(data), "Cities should be sorted alphabetically"


class TestCityFilter:
    """Tests for city filter on GET /api/resources"""
    
    def test_resources_without_city_filter(self):
        """GET /api/resources without city filter returns all resources"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have resources"
        print(f"Total resources without filter: {len(data)}")
    
    def test_resources_with_city_filter(self):
        """GET /api/resources?city=New+York filters by city"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"city": "New York"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # All returned resources should have city = "New York"
        for resource in data:
            assert resource.get("city") == "New York", f"Resource {resource.get('name')} has city {resource.get('city')}, expected 'New York'"
        print(f"Resources in New York: {len(data)}")
    
    def test_resources_with_all_cities_filter(self):
        """GET /api/resources?city=all returns all resources (same as no filter)"""
        response_all = requests.get(f"{BASE_URL}/api/resources", params={"city": "all"})
        response_none = requests.get(f"{BASE_URL}/api/resources")
        
        assert response_all.status_code == 200
        assert response_none.status_code == 200
        
        # Both should return same count
        assert len(response_all.json()) == len(response_none.json()), "city=all should return same as no filter"
    
    def test_resources_have_city_field(self):
        """All resources should have city field in response"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        
        data = response.json()
        for resource in data:
            assert "city" in resource, f"Resource {resource.get('name')} missing 'city' field"
            assert resource["city"] is not None, f"Resource {resource.get('name')} has null city"


class TestResourceRatings:
    """Tests for anonymous thumbs up/down ratings"""
    
    @pytest.fixture
    def resource_id(self):
        """Get a valid resource ID for testing"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        resources = response.json()
        assert len(resources) > 0, "Need at least one resource for testing"
        return resources[0]["id"]
    
    def test_resources_have_rating_fields(self):
        """All resources should have helpful_count and not_helpful_count fields"""
        response = requests.get(f"{BASE_URL}/api/resources")
        assert response.status_code == 200
        
        data = response.json()
        for resource in data:
            assert "helpful_count" in resource, f"Resource {resource.get('name')} missing 'helpful_count'"
            assert "not_helpful_count" in resource, f"Resource {resource.get('name')} missing 'not_helpful_count'"
            assert isinstance(resource["helpful_count"], int), "helpful_count should be int"
            assert isinstance(resource["not_helpful_count"], int), "not_helpful_count should be int"
    
    def test_rate_helpful_increments_count(self, resource_id):
        """POST /api/resources/{id}/rate?vote=helpful increments helpful_count"""
        # Get initial count
        response = requests.get(f"{BASE_URL}/api/resources")
        initial_resource = next((r for r in response.json() if r["id"] == resource_id), None)
        initial_helpful = initial_resource["helpful_count"]
        
        # Vote helpful
        rate_response = requests.post(f"{BASE_URL}/api/resources/{resource_id}/rate", params={"vote": "helpful"})
        assert rate_response.status_code == 200, f"Expected 200, got {rate_response.status_code}: {rate_response.text}"
        
        rate_data = rate_response.json()
        assert "helpful_count" in rate_data, "Response should contain helpful_count"
        assert "not_helpful_count" in rate_data, "Response should contain not_helpful_count"
        assert rate_data["helpful_count"] == initial_helpful + 1, f"helpful_count should increment from {initial_helpful} to {initial_helpful + 1}"
        print(f"Helpful count incremented: {initial_helpful} -> {rate_data['helpful_count']}")
    
    def test_rate_not_helpful_increments_count(self, resource_id):
        """POST /api/resources/{id}/rate?vote=not_helpful increments not_helpful_count"""
        # Get initial count
        response = requests.get(f"{BASE_URL}/api/resources")
        initial_resource = next((r for r in response.json() if r["id"] == resource_id), None)
        initial_not_helpful = initial_resource["not_helpful_count"]
        
        # Vote not_helpful
        rate_response = requests.post(f"{BASE_URL}/api/resources/{resource_id}/rate", params={"vote": "not_helpful"})
        assert rate_response.status_code == 200, f"Expected 200, got {rate_response.status_code}: {rate_response.text}"
        
        rate_data = rate_response.json()
        assert rate_data["not_helpful_count"] == initial_not_helpful + 1, f"not_helpful_count should increment from {initial_not_helpful} to {initial_not_helpful + 1}"
        print(f"Not helpful count incremented: {initial_not_helpful} -> {rate_data['not_helpful_count']}")
    
    def test_rate_invalid_vote_returns_400(self, resource_id):
        """POST /api/resources/{id}/rate?vote=invalid returns 400"""
        rate_response = requests.post(f"{BASE_URL}/api/resources/{resource_id}/rate", params={"vote": "invalid"})
        assert rate_response.status_code == 400, f"Expected 400 for invalid vote, got {rate_response.status_code}"
        
        error_data = rate_response.json()
        assert "detail" in error_data, "Error response should have detail"
        print(f"Invalid vote error: {error_data['detail']}")
    
    def test_rate_nonexistent_resource_returns_404(self):
        """POST /api/resources/{invalid_id}/rate returns 404"""
        fake_id = "nonexistent-resource-id-12345"
        rate_response = requests.post(f"{BASE_URL}/api/resources/{fake_id}/rate", params={"vote": "helpful"})
        assert rate_response.status_code == 404, f"Expected 404 for nonexistent resource, got {rate_response.status_code}"
    
    def test_rate_no_auth_required(self, resource_id):
        """Rating should work without authentication (anonymous)"""
        # Make request without any auth headers
        rate_response = requests.post(
            f"{BASE_URL}/api/resources/{resource_id}/rate",
            params={"vote": "helpful"},
            headers={}  # No auth
        )
        assert rate_response.status_code == 200, f"Anonymous rating should work, got {rate_response.status_code}"


class TestVerifiedFilterStillWorks:
    """Ensure verified filter still works with new features"""
    
    def test_verified_filter_with_city(self):
        """Verified filter should work alongside city filter"""
        response = requests.get(f"{BASE_URL}/api/resources", params={"verified_only": True, "city": "New York"})
        assert response.status_code == 200
        
        data = response.json()
        for resource in data:
            assert resource.get("verified") == True, "All resources should be verified"
            assert resource.get("city") == "New York", "All resources should be in New York"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
