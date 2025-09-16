# Program Application API Documentation

## Base URL
```
http://localhost:4000/api/program-applications
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Submit Program Application
**POST** `/submit`

Submit a new program application with file uploads.

**Content-Type:** `multipart/form-data`

**Required Fields:**
- `programCode` (string): Program code (SETUP, GIA, CEST, SSCP)
- `programName` (string): Program name
- `enterpriseName` (string): Name of enterprise
- `contactPerson` (string): Contact person name
- `officeAddress` (string): Office address
- `position` (string): Position in enterprise
- `contactPersonTel` (string): Contact person telephone
- `contactPersonEmail` (string): Contact person email
- `yearEstablished` (number): Year enterprise was established
- `organizationType` (string): Type of organization
- `profitType` (string): Profit type
- `registrationNo` (string): Enterprise registration number
- `yearRegistered` (number): Year registered
- `capitalClassification` (string): Capital classification
- `employmentClassification` (string): Employment classification
- `businessActivity` (string): Business activity
- `specificProduct` (string): Specific product/service
- `enterpriseBackground` (string): Enterprise background
- `letterOfIntent` (file): Letter of Intent document
- `enterpriseProfile` (file): Enterprise Profile document

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "SETUP-000001",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get My Applications
**GET** `/my-applications`

Get all applications submitted by the authenticated proponent.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "applicationId": "SETUP-000001",
      "programCode": "SETUP",
      "programName": "Small Enterprise Technology Upgrading Program",
      "enterpriseName": "ABC Company",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00.000Z",
      "assignedPSTO": {
        "name": "PSTO Marinduque",
        "location": "Marinduque"
      }
    }
  ]
}
```

### 3. Get Application by ID
**GET** `/:applicationId`

Get detailed information about a specific application.

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": "SETUP-000001",
    "programCode": "SETUP",
    "programName": "Small Enterprise Technology Upgrading Program",
    "enterpriseName": "ABC Company",
    "contactPerson": "John Doe",
    "officeAddress": "123 Main St, City",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00.000Z",
    "assignedPSTO": {
      "name": "PSTO Marinduque",
      "location": "Marinduque"
    },
    "letterOfIntent": {
      "filename": "letterOfIntent-1234567890.pdf",
      "originalName": "Letter of Intent.pdf",
      "path": "uploads/program-applications/letterOfIntent-1234567890.pdf",
      "size": 1024000,
      "mimetype": "application/pdf"
    },
    "enterpriseProfile": {
      "filename": "enterpriseProfile-1234567890.pdf",
      "originalName": "Enterprise Profile.pdf",
      "path": "uploads/program-applications/enterpriseProfile-1234567890.pdf",
      "size": 2048000,
      "mimetype": "application/pdf"
    }
  }
}
```

### 4. Get All Applications (Admin/PSTO)
**GET** `/`

Get all applications with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (pending, under_review, approved, rejected, returned)
- `programCode` (optional): Filter by program code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
  }
}
```

### 5. Update Application Status (Admin/PSTO)
**PUT** `/:applicationId/status`

Update the status of an application.

**Body:**
```json
{
  "status": "under_review",
  "reviewComments": "Application is being reviewed by the technical team"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "applicationId": "SETUP-000001",
    "status": "under_review",
    "reviewedBy": "60f7b3b3b3b3b3b3b3b3b3b3",
    "reviewedAt": "2024-01-16T09:00:00.000Z",
    "reviewComments": "Application is being reviewed by the technical team"
  }
}
```

### 6. Download File
**GET** `/:applicationId/download/:fileType`

Download uploaded files (letterOfIntent or enterpriseProfile).

**Response:** File download

### 7. Get Application Statistics
**GET** `/stats/overview`

Get application statistics for dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "statusStats": [
      { "_id": "pending", "count": 25 },
      { "_id": "under_review", "count": 10 },
      { "_id": "approved", "count": 15 },
      { "_id": "rejected", "count": 5 }
    ],
    "programStats": [
      { "_id": "SETUP", "count": 30 },
      { "_id": "GIA", "count": 15 },
      { "_id": "CEST", "count": 8 },
      { "_id": "SSCP", "count": 2 }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
