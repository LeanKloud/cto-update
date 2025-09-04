# CTO Dashboard API Documentation

## Table of Contents
1. [Cloud Account APIs](#cloud-account-apis)
2. [Application APIs](#application-apis)
3. [Resource APIs](#resource-apis)
4. [Analytics APIs](#analytics-apis)
5. [Budget & Cost APIs](#budget--cost-apis)
6. [Alert & Notification APIs](#alert--notification-apis)
7. [Settings APIs](#settings-apis)

## Cloud Account APIs

### 1. Get All Cloud Accounts
**Endpoint:** `GET /api/cloud-accounts`
**Description:** Retrieves a list of all cloud accounts with their summary information
**Parameters:**
- `provider` (query, optional): Filter by cloud provider (AWS, Azure, GCP)
- `department` (query, optional): Filter by department
- `period` (query, optional): Filter by time period (e.g., "2025-Q1")

**Sample Response:**
```json
{
  "total": 10,
  "accounts": [
    {
      "id": "ca-123",
      "cloudAccount": "Cloud Account 1",
      "applications": 45,
      "vms": 120,
      "storage": 8,
      "totalSpends": "$2.4M",
      "totalSavings": "$180K",
      "potentialSavings": "$320K",
      "efficiency": "85%",
      "provider": "AWS",
      "department": "Engineering",
      "lastUpdated": "2025-09-03T10:00:00Z"
    }
  ]
}
```

### 2. Get Cloud Account Details
**Endpoint:** `GET /api/cloud-accounts/{accountId}`
**Description:** Get detailed information about a specific cloud account

**Sample Response:**
```json
{
  "id": "ca-123",
  "name": "Cloud Account 1",
  "provider": "AWS",
  "department": "Engineering",
  "metrics": {
    "totalApplications": 45,
    "totalVMs": 120,
    "totalStorage": "8TB",
    "totalSpends": "$2.4M",
    "totalSavings": "$180K",
    "potentialSavings": "$320K",
    "efficiency": "85%"
  },
  "trends": {
    "spends": {
      "current": "$2.4M",
      "previous": "$2.2M",
      "change": "+9%"
    },
    "efficiency": {
      "current": "85%",
      "previous": "82%",
      "change": "+3%"
    }
  }
}
```

## Application APIs

### 1. Get Applications List
**Endpoint:** `GET /api/cloud-accounts/{accountId}/applications`
**Description:** Get all applications for a specific cloud account
**Parameters:**
- `sort` (query, optional): Sort by field (spends, efficiency, etc.)
- `order` (query, optional): asc or desc
- `page` (query, optional): Page number
- `limit` (query, optional): Items per page

**Sample Response:**
```json
{
  "total": 45,
  "page": 1,
  "limit": 10,
  "applications": [
    {
      "id": "app-123",
      "cloudAccount": "Cloud Account 1",
      "applicationName": "App A",
      "instanceId": "i-123",
      "volumeId": "vol-456",
      "spends": "$100K",
      "potentialSavings": "$10K",
      "efficiency": "90%",
      "department": "Engineering",
      "provider": "AWS",
      "resources": {
        "compute": 5,
        "storage": 3,
        "database": 2
      }
    }
  ]
}
```

### 2. Get Application Details
**Endpoint:** `GET /api/applications/{applicationId}`
**Description:** Get detailed information about a specific application

**Sample Response:**
```json
{
  "id": "app-123",
  "name": "App A",
  "cloudAccount": "Cloud Account 1",
  "department": "Engineering",
  "provider": "AWS",
  "metrics": {
    "totalSpends": "$100K",
    "potentialSavings": "$10K",
    "efficiency": "90%"
  },
  "resources": {
    "compute": {
      "count": 5,
      "spends": "$50K"
    },
    "storage": {
      "count": 3,
      "spends": "$30K"
    },
    "database": {
      "count": 2,
      "spends": "$20K"
    }
  },
  "trends": {
    "spends": {
      "current": "$100K",
      "previous": "$95K",
      "change": "+5.3%"
    }
  }
}
```

## Resource APIs

### 1. Get Compute Resources
**Endpoint:** `GET /api/applications/{applicationId}/compute`
**Description:** Get compute resources for an application

**Sample Response:**
```json
{
  "total": 5,
  "resources": [
    {
      "id": "comp-123",
      "computeType": "EC2",
      "computeId": "i-123",
      "currentServer": "server-1",
      "spends": "$50K",
      "savings": "$5K",
      "potentialSavings": "$8K",
      "efficiency": "88%",
      "metrics": {
        "maxCpu": "80%",
        "maxMemory": "70%",
        "averageCpu": "65%",
        "averageMemory": "60%"
      },
      "recommendations": [
        {
          "type": "rightsizing",
          "description": "Consider downsizing instance",
          "potentialSavings": "$8K"
        }
      ]
    }
  ]
}
```

### 2. Get Storage Resources
**Endpoint:** `GET /api/applications/{applicationId}/storage`
**Description:** Get storage resources for an application

**Sample Response:**
```json
{
  "total": 3,
  "resources": [
    {
      "id": "stor-123",
      "storageId": "vol-456",
      "type": "SSD",
      "size": "500GB",
      "spends": "$10K",
      "potentialSavings": "$1K",
      "efficiency": "95%",
      "metrics": {
        "iops": "1000",
        "throughput": "100MB/s",
        "utilization": "75%"
      },
      "recommendations": [
        {
          "type": "unused_volume",
          "description": "Volume has been idle for 30 days",
          "potentialSavings": "$1K"
        }
      ]
    }
  ]
}
```

### 3. Get Database Resources
**Endpoint:** `GET /api/applications/{applicationId}/databases`
**Description:** Get database resources for an application

**Sample Response:**
```json
{
  "total": 2,
  "resources": [
    {
      "id": "db-123",
      "dbType": "PostgreSQL",
      "dbId": "db-789",
      "spends": "$20K",
      "potentialSavings": "$2K",
      "efficiency": "92%",
      "metrics": {
        "connections": "100",
        "storage": "100GB",
        "iops": "1000"
      },
      "recommendations": [
        {
          "type": "performance",
          "description": "Consider upgrading instance class",
          "impact": "Medium"
        }
      ]
    }
  ]
}
```

## Analytics APIs

### 1. Get Trend Analysis
**Endpoint:** `GET /api/analytics/trends`
**Description:** Get trend analysis for spends and efficiency
**Parameters:**
- `period` (query, required): Time period (e.g., "2025" or "2025-Q1")
- `type` (query, optional): Data type (spends, efficiency, resources)

**Sample Response:**
```json
{
  "spendTrends": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "data": {
      "2024": [1.2, 1.4, 1.5, 1.6],
      "2025": [1.7, 1.8, 1.9, 2.0]
    },
    "unit": "Million USD"
  },
  "efficiencyTrends": {
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "data": {
      "2024": [75, 78, 80, 82],
      "2025": [83, 85, 86, 88]
    },
    "unit": "Percentage"
  }
}
```

### 2. Get Resource Optimization Recommendations
**Endpoint:** `GET /api/recommendations`
**Description:** Get optimization recommendations across all resources
**Parameters:**
- `type` (query, optional): Recommendation type (rightsizing, unused, etc.)
- `priority` (query, optional): Priority level (high, medium, low)

**Sample Response:**
```json
{
  "total": 25,
  "potentialSavings": "$500K",
  "recommendations": [
    {
      "id": "rec-123",
      "type": "rightsizing",
      "resource": {
        "id": "i-abc123",
        "type": "EC2",
        "name": "Production Server 1"
      },
      "currentCost": "$500/month",
      "projectedSavings": "$200/month",
      "priority": "high",
      "description": "Instance is oversized based on usage patterns",
      "action": {
        "type": "resize",
        "from": "t3.xlarge",
        "to": "t3.large"
      }
    }
  ]
}
```

## Budget & Cost APIs

### 1. Get Cost Allocation
**Endpoint:** `GET /api/cost-allocation`
**Description:** Get cost allocation breakdown
**Parameters:**
- `period` (query, required): Time period
- `groupBy` (query, optional): Group by parameter (department, provider, service)

**Sample Response:**
```json
{
  "totalCost": "$10M",
  "byDepartment": [
    {
      "department": "Engineering",
      "cost": "$1.2M",
      "percentage": 40,
      "trend": "+5%"
    }
  ],
  "byProvider": [
    {
      "provider": "AWS",
      "cost": "$1.5M",
      "percentage": 50,
      "trend": "+3%"
    }
  ],
  "byService": [
    {
      "service": "Compute",
      "cost": "$900K",
      "percentage": 30,
      "trend": "+2%"
    }
  ]
}
```

### 2. Get Budget Information
**Endpoint:** `GET /api/budgets`
**Description:** Get budget and spending information

**Sample Response:**
```json
{
  "overview": {
    "totalBudget": "$10M",
    "spent": "$7.2M",
    "remaining": "$2.8M",
    "forecastedOverage": "$500K"
  },
  "departments": [
    {
      "name": "Engineering",
      "budget": "$3M",
      "spent": "$2.1M",
      "remaining": "$900K",
      "trending": "within_budget",
      "forecast": {
        "endOfMonth": "$2.8M",
        "status": "over_budget",
        "projectedOverage": "$200K"
      }
    }
  ]
}
```

### 3. Update Budget
**Endpoint:** `PUT /api/budgets/{departmentId}`
**Description:** Update budget for a department

**Request Body:**
```json
{
  "budget": "$3.5M",
  "period": "2025-Q4",
  "alerts": {
    "threshold": 80,
    "notification": ["email", "slack"]
  }
}
```

## Alert & Notification APIs

### 1. Get Alerts
**Endpoint:** `GET /api/alerts`
**Description:** Get system alerts and notifications
**Parameters:**
- `status` (query, optional): Filter by status (unread, read)
- `severity` (query, optional): Filter by severity (high, medium, low)

**Sample Response:**
```json
{
  "total": 5,
  "unread": 3,
  "alerts": [
    {
      "id": "alert-123",
      "severity": "high",
      "type": "budget_exceed",
      "message": "Engineering department exceeded monthly budget by 15%",
      "timestamp": "2025-09-03T10:00:00Z",
      "status": "unread",
      "metadata": {
        "department": "Engineering",
        "threshold": "100%",
        "actual": "115%"
      }
    }
  ]
}
```

### 2. Update Alert Status
**Endpoint:** `PUT /api/alerts/{alertId}`
**Description:** Update alert status (mark as read/unread)

**Request Body:**
```json
{
  "status": "read",
  "action": "acknowledge"
}
```

## Settings APIs

### 1. Get User Settings
**Endpoint:** `GET /api/settings`
**Description:** Get user preferences and settings

**Sample Response:**
```json
{
  "notifications": {
    "email": true,
    "slack": false,
    "budgetAlerts": true,
    "securityAlerts": true
  },
  "displayPreferences": {
    "currency": "USD",
    "timezone": "UTC",
    "defaultView": "dashboard"
  },
  "thresholds": {
    "budgetWarning": 80,
    "budgetCritical": 95,
    "efficiencyWarning": 70
  }
}
```

### 2. Update Settings
**Endpoint:** `PUT /api/settings`
**Description:** Update user preferences and settings

**Request Body:**
```json
{
  "notifications": {
    "email": true,
    "slack": true
  },
  "displayPreferences": {
    "currency": "EUR",
    "timezone": "UTC+1"
  }
}
```

## Common Response Structures

### Error Response
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": "Cloud account with ID 'ca-123' does not exist"
  }
}
```

### Pagination Response
```json
{
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "data": [
    // ... array of items
  ]
}
```

### Success Response
```json
{
  "status": "success",
  "message": "Resource created successfully",
  "data": {
    // ... response data
  }
}
```
