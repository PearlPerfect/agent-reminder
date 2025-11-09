// utils/errorHandler.ts
export class ToolExecutionError extends Error {
  public details: any;

  constructor(message: string, details: any = {}) {
    super(message);
    this.name = 'ToolExecutionError';
    this.details = details;
  }
}

export interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
  request?: any;
}

export const handleApiError = (error: ApiError): ToolExecutionError => {
  if (error.response) {
    // API responded with error status
    return new ToolExecutionError(
      `API Error: ${error.response.status} - ${error.response.statusText}`, 
      {
        status: error.response.status,
        data: error.response.data
      }
    );
  } else if (error.request) {
    // Request made but no response
    return new ToolExecutionError('Network Error: No response received from API');
  } else {
    // Other errors
    return new ToolExecutionError(`Unexpected Error: ${error.message}`);
  }
};

// Rate limiting helper
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));