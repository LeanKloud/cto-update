// Chatbot service for VM recommendations

export interface ChatbotRequest {
    instance_id: string;
    prompt: string;
  }
  
  export interface ChatbotResponse {
    response: string;
    success: boolean;
    error?: string;
  }
  
  // Base API URL - using the provided ngrok endpoint
  const API_BASE_URL = 'https://79cb983c3067.ngrok-free.app';
  
  // Call the chatbot API endpoint
  export const callChatbotAPI = async (
    instanceId: string,
    prompt: string = ''
  ): Promise<ChatbotResponse> => {
    try {
      console.log(`Calling chatbot API for instance: ${instanceId}, query: "${prompt}"`);
  
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
      // Handle empty prompt correctly (backend requires "" explicitly)
      const params = new URLSearchParams({
        instance_id: instanceId,
        query: prompt === '' ? '""' : prompt
      });
  
      const requestUrl = `${API_BASE_URL}/chatbot?${params.toString()}`;
  
      console.log(`Making GET request to: ${requestUrl}`);
  
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });
  
      clearTimeout(timeoutId);
  
      if (response.ok) {
        const data = await response.json();
        console.log('Chatbot API response:', data);
  
        return {
          response:
            data.response ||
            data.message ||
            data.answer ||
            data.explanation ||
            'No response received',
          success: true
        };
      } else {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
  
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }
    } catch (error) {
      console.error('Error calling chatbot API:', error);
  
      // Handle different types of errors
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - the chatbot service took too long to respond';
        } else {
          errorMessage = error.message;
        }
      }
  
      // Fallback to mock response if API fails
      console.warn('All API endpoints failed, using mock response');
      const mockResponse = getMockChatbotResponse(instanceId, prompt);
  
      return {
        response: mockResponse,
        success: false,
        error: errorMessage
      };
    }
  };
  
  // Mock chatbot response function
  const getMockChatbotResponse = (instanceId: string, prompt: string): string => {
    if (!prompt || prompt.trim() === '' || prompt === '""') {
      // Initial explanation
      return `**VM Recommendation Analysis for Asset: ${instanceId}**
  
  Based on our analysis of your current VM usage patterns, here's a detailed explanation of the recommendation:
  
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
  
  Is there anything specific about this recommendation you'd like me to explain further?`;
    } else {
      // Follow-up question response
      return `Thank you for your question about asset ${instanceId}: "${prompt}"
  
  Based on the VM recommendation analysis, here's what I can tell you:
  
  This recommendation is designed to optimize both cost and performance based on your current usage patterns. The suggested instance type change will provide significant cost savings while maintaining adequate performance for your workload.
  
  Key factors considered:
  - Historical CPU and memory utilization data
  - Cost optimization opportunities
  - Performance requirements
  - Risk assessment
  
  Would you like me to elaborate on any specific aspect of this recommendation?`;
    }
  };
  
  // Get initial explanation for a VM asset
  export const getVMExplanation = async (instanceId: string): Promise<string> => {
    try {
      const result = await callChatbotAPI(instanceId, '');
      return result.response;
    } catch (error) {
      console.error('Error getting VM explanation:', error);
      return `I'm sorry, I couldn't get the explanation for asset ${instanceId} right now. Please try again later.`;
    }
  };
  
  // Ask a follow-up question about a VM asset
  export const askVMQuestion = async (
    instanceId: string,
    question: string
  ): Promise<string> => {
    try {
      const result = await callChatbotAPI(instanceId, question);
      return result.response;
    } catch (error) {
      console.error('Error asking VM question:', error);
      return `I'm sorry, I couldn't process your question about asset ${instanceId} right now. Please try again later.`;
    }
  };


