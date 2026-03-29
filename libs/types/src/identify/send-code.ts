export interface UCallerInitCallRequest {
  phone: number;   
  code?: string;          
  client?: string;        
  unique?: string;
  voice?: boolean;
  mix?: boolean;
}

export interface UCallerInitCallResponse {
  status: boolean;
  ucaller_id: number;       
  phone: string;            
  code: string;             
  client?: string;
  unique_request_id?: string;
  exists: boolean;        
}