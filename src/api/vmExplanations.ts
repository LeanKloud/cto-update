// Mock API for VM explanations - can be replaced with real API calls

export interface VMExplanation {
  asset_id: string;
  explanation: string;
  recommendations: {
    current_config: {
      instance_type: string;
      monthly_cost: number;
      cpu_utilization: number;
      memory_utilization: number;
    };
    recommended_config: {
      instance_type: string;
      monthly_cost: number;
      expected_cpu_utilization: number;
      expected_memory_utilization: number;
    };
    savings: {
      monthly: number;
      annual: number;
      percentage: number;
    };
    risk_assessment: {
      level: 'low' | 'medium' | 'high';
      description: string;
    };
  };
}

// Mock function to get VM explanation
export const getMockVMExplanation = (assetId: string): VMExplanation => {
  return {
    asset_id: assetId,
    explanation: `Based on our analysis of your current VM usage patterns, here's a detailed explanation of the recommendation for asset ${assetId}:

**Current Configuration:**
- Instance Type: t3.large (2 vCPUs, 8 GB RAM)
- Monthly Cost: $67.20
- Average CPU Utilization: 35%
- Average Memory Utilization: 45%

**Recommended Configuration:**
- Instance Type: t3.medium (2 vCPUs, 4 GB RAM)
- Projected Monthly Cost: $33.60
- Expected CPU Utilization: 60%
- Expected Memory Utilization: 80%

**Cost Analysis:**
- Monthly Savings: $33.60 (50% reduction)
- Annual Savings: $403.20
- ROI: Immediate cost savings with no upfront investment

**Performance Impact:**
- CPU performance will remain adequate for current workload
- Memory reduction is acceptable based on usage patterns
- No expected impact on application response times

**Risk Assessment:**
- Low Risk: Current memory usage is well below the recommended instance capacity
- Monitoring recommended for first 30 days after migration
- Easy rollback option available if performance issues arise

Is there anything specific about this recommendation you'd like me to explain further?`,
    recommendations: {
      current_config: {
        instance_type: 't3.large',
        monthly_cost: 67.20,
        cpu_utilization: 35,
        memory_utilization: 45
      },
      recommended_config: {
        instance_type: 't3.medium',
        monthly_cost: 33.60,
        expected_cpu_utilization: 60,
        expected_memory_utilization: 80
      },
      savings: {
        monthly: 33.60,
        annual: 403.20,
        percentage: 50
      },
      risk_assessment: {
        level: 'low',
        description: 'Current memory usage is well below the recommended instance capacity'
      }
    }
  };
};


