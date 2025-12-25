#!/usr/bin/env python3
"""
Hogwarts Music Studio - OTP Flows Testing
Tests specific OTP functionality for admin and user forgot password flows
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class OTPFlowsTester:
    def __init__(self, base_url="https://glassmorphic-hub-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return None

    def test_admin_forgot_password_flow(self):
        """Test admin forgot password OTP flow"""
        print("\n🔐 Testing Admin Forgot Password Flow")
        print("-" * 40)
        
        # Test with valid admin email
        forgot_data = {
            "email": "leocelestine.s@gmail.com",
            "user_type": "admin"
        }
        
        result = self.run_test("Admin Forgot Password Request", "POST", "auth/forgot-password", 200, forgot_data)
        if result:
            self.log_test("Admin Forgot Password Response Format", True, "OTP request successful")
        else:
            self.log_test("Admin Forgot Password Response Format", False, "Invalid response")
        
        # Test with invalid admin email
        invalid_data = {
            "email": "nonexistent@example.com",
            "user_type": "admin"
        }
        
        result = self.run_test("Admin Forgot Password Invalid Email", "POST", "auth/forgot-password", 404, invalid_data)
        return result

    def test_user_forgot_password_flow(self):
        """Test user forgot password OTP flow"""
        print("\n👤 Testing User Forgot Password Flow")
        print("-" * 40)
        
        # First register a test user
        test_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
        user_data = {
            "name": "Test User",
            "email": test_email,
            "password": "TestPass123!"
        }
        
        reg_result = self.run_test("User Registration for Forgot Password Test", "POST", "auth/register", 200, user_data)
        
        if reg_result:
            # Test forgot password with registered user
            forgot_data = {
                "email": test_email,
                "user_type": "user"
            }
            
            result = self.run_test("User Forgot Password Request", "POST", "auth/forgot-password", 200, forgot_data)
            if result:
                self.log_test("User Forgot Password Response Format", True, "OTP request successful")
            else:
                self.log_test("User Forgot Password Response Format", False, "Invalid response")
        
        # Test with invalid user email
        invalid_data = {
            "email": "nonexistent_user@example.com",
            "user_type": "user"
        }
        
        result = self.run_test("User Forgot Password Invalid Email", "POST", "auth/forgot-password", 404, invalid_data)
        return result

    def test_admin_resend_otp_flow(self):
        """Test admin resend OTP functionality"""
        print("\n🔄 Testing Admin Resend OTP Flow")
        print("-" * 40)
        
        # First request OTP
        otp_data = {"email": "leocelestine.s@gmail.com"}
        
        result1 = self.run_test("Admin Initial OTP Request", "POST", "admin/request-otp", 200, otp_data)
        
        if result1:
            # Test resend OTP
            result2 = self.run_test("Admin Resend OTP", "POST", "admin/resend-otp", 200, otp_data)
            if result2:
                self.log_test("Admin Resend OTP Response Format", True, "Resend successful")
            else:
                self.log_test("Admin Resend OTP Response Format", False, "Invalid response")
        
        return result1 and result2

    def test_services_with_hours_requirement(self):
        """Test services endpoint for hours requirement"""
        print("\n⏰ Testing Services Hours Requirement")
        print("-" * 40)
        
        services = self.run_test("Get Services for Hours Check", "GET", "services", 200)
        
        if services:
            # Check Dubbing service
            dubbing = next((s for s in services if s.get('name') == 'Dubbing'), None)
            if dubbing:
                if dubbing.get('requires_hours') == True:
                    self.log_test("Dubbing Requires Hours Flag", True, "requires_hours = True")
                else:
                    self.log_test("Dubbing Requires Hours Flag", False, f"requires_hours = {dubbing.get('requires_hours')}")
                
                if dubbing.get('price') == '₹299/hr':
                    self.log_test("Dubbing Hourly Price", True, "₹299/hr")
                else:
                    self.log_test("Dubbing Hourly Price", False, f"Expected ₹299/hr, got {dubbing.get('price')}")
            else:
                self.log_test("Dubbing Service Found", False, "Dubbing service not found")
            
            # Check Vocal Recording service
            vocal = next((s for s in services if s.get('name') == 'Vocal Recording'), None)
            if vocal:
                if vocal.get('requires_hours') == True:
                    self.log_test("Vocal Recording Requires Hours Flag", True, "requires_hours = True")
                else:
                    self.log_test("Vocal Recording Requires Hours Flag", False, f"requires_hours = {vocal.get('requires_hours')}")
                
                if vocal.get('price') == '₹399/hr':
                    self.log_test("Vocal Recording Hourly Price", True, "₹399/hr")
                else:
                    self.log_test("Vocal Recording Hourly Price", False, f"Expected ₹399/hr, got {vocal.get('price')}")
            else:
                self.log_test("Vocal Recording Service Found", False, "Vocal Recording service not found")
        
        return services

    def test_booking_with_hours(self):
        """Test booking creation with hours"""
        print("\n📅 Testing Booking with Hours")
        print("-" * 40)
        
        services = self.test_services_with_hours_requirement()
        if not services:
            self.log_test("Booking with Hours", False, "No services available")
            return None
        
        # Find Dubbing service
        dubbing = next((s for s in services if s.get('name') == 'Dubbing'), None)
        if not dubbing:
            self.log_test("Booking with Hours", False, "Dubbing service not found")
            return None
        
        booking_data = {
            "full_name": "Test Hours Booking",
            "email": f"hours_test_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+91 9876543210",
            "service_id": dubbing['id'],
            "service_name": dubbing['name'],
            "description": "Test booking with hours for automated testing",
            "preferred_date": "2024-12-25",
            "preferred_time": "10:00 AM",
            "hours": 3
        }
        
        result = self.run_test("Booking Creation with Hours", "POST", "bookings", 200, booking_data)
        if result and 'booking' in result:
            booking = result['booking']
            if booking.get('hours') == 3:
                self.log_test("Booking Hours Saved", True, "3 hours saved correctly")
            else:
                self.log_test("Booking Hours Saved", False, f"Expected 3 hours, got {booking.get('hours')}")
        
        return result

    def run_all_tests(self):
        """Run all OTP flow tests"""
        print("🚀 Starting Hogwarts Music Studio OTP Flows Tests")
        print("=" * 60)
        
        # Test OTP flows
        self.test_admin_forgot_password_flow()
        self.test_user_forgot_password_flow()
        self.test_admin_resend_otp_flow()
        
        # Test services and booking with hours
        self.test_services_with_hours_requirement()
        self.test_booking_with_hours()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 OTP Flow Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = OTPFlowsTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/otp_flows_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())