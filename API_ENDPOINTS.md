# API Endpoints Documentation

This document lists all API endpoints used in the frontend application.

**Note**: Endpoints 1-4 are real backend APIs. Endpoints 5-11 currently use mock data as fallback.

## 1. GET /api/optimization/cloud-accounts (REAL API)

Query Parameters:
- start (optional)
- end (optional)

Example Query Parameters:
- start = 2025-10-01
- end = 2025-12-31

Sample Response:
```json
[
  {
    "cloudAccount": "Cloud Account 1",
    "applications": 45,
    "vms": 120,
    "totalSpends": 2400000,
    "totalSavings": 180000,
    "potentialSavings": 320000,
    "efficiency": 85,
    "provider": "AWS",
    "department": "Engineering"
  }
]
```

## 2. GET /api/optimization/cloud-accounts/summary (REAL API)

Query Parameters:
None

Example Query Parameters:
None

Sample Response:
```json
[
  {
    "total_accounts": 30,
    "total_vms": 30000,
    "total_applications": 1200,
    "total_spends": 100000,
    "total_savings": 10000,
    "avg_efficiency": 60
  }
]
```

## 3. GET /api/optimization/cloud-accounts/{cloudAccount}/applications (REAL API)

Query Parameters:
None

Example Query Parameters:
None

Sample Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "app-ca1-001",
      "cloudAccount": "Cloud Account 1",
      "applicationName": "Temp_Core_01",
      "spends": "$700k",
      "potentialSavings": "$700k",
      "efficiency": "90%",
      "department": "Engineering",
      "provider": "AWS"
    }
  ]
}
```

## 4. GET /api/optimization/applications (REAL API)

Query Parameters:
- application (required)

Example Query Parameters:
- application = Temp_Core_01

Sample Response:
```json
{
  "assigned": [
    {
      "asset_id": "vm-001",
      "service_type": "Compute",
      "cloud_service_name": "EC2",
      "hw_family_name": "t3a.medium",
      "dept_name": "Engineering",
      "recos": [
        {
          "current_month_spend": 700,
          "realized_savings": 300,
          "projected_monthly_saving": 400,
          "projected_monthly_util": 85.5,
          "new_hw_family_name": "t3a.small"
        }
      ]
    }
  ],
  "unassigned": []
}
```

## 5. GET /api/optimization/analytics/trends (MOCK DATA)

Query Parameters:
- period (required)
- type (optional)
- granularity (optional)

Example Query Parameters:
- period = 2025-Q4
- type = spends
- granularity = monthly

Sample Response:
```json
{
  "quarters": ["2025, Q2", "2025, Q1", "2024, Q4"],
  "data": {
    "1": [680, 690, 660],
    "2": [640, 630, 650]
  }
}
```

## 6. GET /api/optimization/analytics/recommendations (MOCK DATA)

Query Parameters:
- type (optional)
- priority (optional)
- limit (optional)

Example Query Parameters:
- type = cost-optimization
- priority = high
- limit = 10

Sample Response:
```json
[
  {
    "id": "rec-001",
    "type": "cost-optimization",
    "priority": "high",
    "title": "Right-size EC2 instances in Cloud Account 1",
    "description": "Several EC2 instances are over-provisioned and can be downsized",
    "potentialSavings": "$45K",
    "cloudAccount": "Cloud Account 1",
    "affectedResources": 12
  }
]
```

## 7. GET /api/optimization/alerts (MOCK DATA)

Query Parameters:
- severity (optional)
- isRead (optional)
- limit (optional)

Example Query Parameters:
- severity = critical
- isRead = false
- limit = 5

Sample Response:
```json
[
  {
    "id": "alert-001",
    "type": "high-spend",
    "severity": "critical",
    "title": "High Spend Alert",
    "message": "Cloud Account 1 has the highest spend of $2.4M this quarter",
    "cloudAccount": "Cloud Account 1",
    "timestamp": "2025-01-15T10:30:00Z",
    "isRead": false
  }
]
```

## 8. PATCH /api/optimization/alerts/{alertId}/read (MOCK DATA)

Query Parameters:
None

Example Query Parameters:
None

Sample Response:
```json
{
  "id": "alert-001",
  "isRead": true
}
```

## 9. GET /api/optimization/attention (MOCK DATA)

Query Parameters:
- category (optional)
- filter (optional)
- search (optional)

Example Query Parameters:
- category = usage-cost
- filter = Cloud Account 1
- search = temp_core

Sample Response:
```json
[
  {
    "cloudAccount": "Cloud Account 1",
    "applicationName": "Temp_Core_01",
    "computeUsage": 60,
    "dbUsage": 70,
    "storage": 80,
    "diskUtilisation": 65,
    "idleInstances": 12,
    "spends": 3000,
    "savings": 10,
    "status": "active"
  }
]
```

## 10. GET /api/optimization/spot-utilization (MOCK DATA)

Query Parameters:
- sort (optional)
- order (optional)

Example Query Parameters:
- sort = savings
- order = desc

Sample Response:
```json
[
  {
    "account": 1,
    "onDemand": 4500,
    "spot": 1200,
    "savings": 500
  }
]
```

## 11. GET /api/optimization/spot-utilization/{accountId}/details (MOCK DATA)

Query Parameters:
- sort (optional)
- order (optional)

Example Query Parameters:
- sort = onDemandCost
- order = desc

Sample Response:
```json
[
  {
    "id": "savings-1-1",
    "cloudAccount": "Cloud Account 1",
    "applicationName": "Temp_Core_01",
    "onDemandCost": 6000,
    "savingsWithSpot": 3000,
    "savingsWithoutSpot": 1000,
    "percentageSavings": 50
  }
]
```