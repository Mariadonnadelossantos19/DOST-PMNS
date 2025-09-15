// Postman Test Script for Super Admin Tests
// Add this to the "Tests" tab of your requests

// 1. Login Test - Add to Login Super Admin request
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.token).to.exist;
    pm.expect(response.user.role).to.eql("super_admin");
    
    // Set auth token for subsequent requests
    pm.environment.set("authToken", response.token);
    pm.environment.set("superAdminId", response.user._id);
});

// 2. User Management Tests - Add to Get All Users request
pm.test("Get users successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.users).to.be.an('array');
});

// 3. Program Management Tests - Add to Create Program request
pm.test("Program created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.program).to.exist;
    pm.environment.set("programId", response.program._id);
});

// 4. PSTO Management Tests - Add to Create PSTO request
pm.test("PSTO created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.psto).to.exist;
    pm.environment.set("pstoId", response.psto._id);
});

// 5. Proponent Request Tests - Add to Get All Proponent Requests request
pm.test("Get proponent requests successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.requests).to.be.an('array');
    
    // Set first request ID for testing
    if (response.requests.length > 0) {
        pm.environment.set("requestId", response.requests[0]._id);
    }
});

// 6. Enrollment Tests - Add to Get All Enrollments request
pm.test("Get enrollments successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.enrollments).to.be.an('array');
});

// 7. Error Handling Tests - Add to any request
pm.test("No server errors", function () {
    pm.response.to.not.have.status(500);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

// 8. Authentication Tests - Add to protected requests
pm.test("Request is authenticated", function () {
    pm.response.to.not.have.status(401);
    pm.response.to.not.have.status(403);
});
