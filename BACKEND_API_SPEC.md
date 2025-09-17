# Backend API Specification

Base URL: `http://localhost:3001/api`
Authentication: Bearer token in Authorization header

## APIs (15 total)

### 1. GET /dashboard/summary
```json
{
  "success": true,
  "data": {
    "totalCloudAccounts": 30,
    "totalVirtualMachines": 30000,
    "totalApplicationInstances": 1200,
    "totalDatabases": 3000,
    "totalStorage": 300,
    "monthlySpend": 100000,
    "monthlySavings": 10000,
    "potentialSavings": 40000,
    "efficiency": 60
  }
}
```

### 2. GET /cloud-accounts
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "ca-001",
        "cloudAccount": "Cloud Account 1",
        "applications": 45,
        "vms": 120,
        "storage": 8,
        "totalSpends": "$2.4M",
        "totalSavings": "$180K",
        "potentialSavings": "$320K",
        "efficiency": "85%",
        "provider": "AWS",
        "department": "Engineering"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### 3. GET /applications
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-001-001",
        "cloudAccount": "Cloud Account 1",
        "applicationName": "Temp_Core_01",
        "spends": "$700k",
        "potentialSavings": "$700k",
        "efficiency": "90%",
        "department": "Engineering",
        "provider": "AWS"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 4. GET /applications/:applicationId/compute
```json
{
  "success": true,
  "data": [
    {
      "computeType": "Lambda",
      "computeId": "lambda-001",
      "currentServer": "t3a.medium",
      "spends": "$700k",
      "savings": "$700k",
      "potentialSavings": "$700k",
      "efficiency": "90%",
      "maxCpu": "2 vCPU",
      "maxMemory": "4 GB"
    }
  ]
}
```

### 5. GET /applications/:applicationId/storage
```json
{
  "success": true,
  "data": [
    {
      "computeType": "S3 Bucket",
      "computeId": "bucket-app-logs",
      "currentServer": "Standard",
      "spends": "$120k",
      "savings": "$30k",
      "potentialSavings": "$40k",
      "efficiency": "75%"
    }
  ]
}
```

### 6. GET /applications/:applicationId/databases
```json
{
  "success": true,
  "data": [
    {
      "computeType": "RDS (PostgreSQL)",
      "computeId": "db-analytics-01",
      "currentServer": "db.m6g.large",
      "spends": "$300k",
      "savings": "$80k",
      "potentialSavings": "$50k",
      "efficiency": "78%",
      "dbType": "rds"
    }
  ]
}
```

### 7. GET /analytics/trends
```json
{
  "success": true,
  "data": {
    "quarters": ["2025, Q2", "2025, Q1", "2024, Q4", "2024, Q3"],
    "data": {
      "1": [680, 690, 660, 720],
      "2": [640, 630, 650, 600],
      "3": [620, 610, 640, 700]
    }
  }
}
```

### 8. GET /analytics/recommendations
```json
{
  "success": true,
  "data": [
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
}
```

### 9. GET /alerts
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-001",
      "type": "high-spend",
      "severity": "critical",
      "title": "High Spend Alert",
      "message": "Cloud Account 1 has the highest spend of $2.4M this quarter",
      "cloudAccount": "Cloud Account 1",
      "timestamp": "2025-01-27T10:00:00.000Z",
      "isRead": false
    }
  ]
}
```

### 10. PATCH /alerts/:alertId/read
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "isRead": true
  }
}
```

### 11. GET /attention
```json
{
  "success": true,
  "data": [
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
}
```

### 12. GET /spot-utilization
```json
{
  "success": true,
  "data": [
    {
      "account": 1,
      "onDemand": 4500,
      "spot": 1200,
      "savings": 500
    }
  ]
}
```

### 13. GET /spot-utilization/:accountId/details
```json
{
  "success": true,
  "data": [
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
}
```

### 14. GET /cloud-accounts/:accountId
```json
{
  "success": true,
  "data": {
    "id": "ca-001",
    "cloudAccount": "Cloud Account 1",
    "applications": 45,
    "vms": 120,
    "storage": 8,
    "totalSpends": "$2.4M",
    "totalSavings": "$180K",
    "potentialSavings": "$320K",
    "efficiency": "85%",
    "provider": "AWS",
    "department": "Engineering"
  }
}
```

### 15. GET /applications/:applicationId
```json
{
  "success": true,
  "data": {
    "id": "app-001-001",
    "cloudAccount": "Cloud Account 1",
    "applicationName": "Temp_Core_01",
    "spends": "$700k",
    "potentialSavings": "$700k",
    "efficiency": "90%",
    "department": "Engineering",
    "provider": "AWS"
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variable
Set `VITE_API_URL=http://your-backend-url/api` to use real backend instead of mock data.