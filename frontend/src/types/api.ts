export interface Location {
  lat: number;
  lng: number;
}

export interface Shipment {
  id: number;
  tracking_id: str;
  company_id: number;
  origin: string;
  destination: string;
  product_category: string;
  current_location?: Location;
  temperature?: number;
  humidity?: number;
  status: 'in_transit' | 'delayed' | 'at_risk' | 'delivered';
  estimated_delivery: string;
  actual_delivery?: string;
  value_usd: number;
  carrier: string;
  created_at: string;
  updated_at: string;
}

export interface ActionRecommendation {
  action_type: 'REROUTE' | 'NEGOTIATE' | 'INSURE' | 'NOTIFY' | 'HOLD';
  priority: 'high' | 'medium' | 'low';
  estimated_cost: number;
  expected_risk_reduction: number;
  action_details?: Record<string, any>;
}

export interface RiskAssessment {
  id: number;
  shipment_id: number;
  agent_id: string;
  risk_score: number;
  risk_category: string;
  reasoning: string;
  recommended_actions: ActionRecommendation[];
  confidence: number;
  created_at: string;
}

export interface AgentAction {
  id: number;
  risk_assessment_id: number;
  action_type: 'REROUTE' | 'NEGOTIATE' | 'INSURE' | 'NOTIFY' | 'HOLD';
  action_details: Record<string, any>;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed';
  estimated_cost: number;
  expected_risk_reduction: number;
  user_approved_by?: number;
  approved_at?: string;
  executed_at?: string;
  result?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  company_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  change_data?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  company_id: number;
  role: 'admin' | 'operator' | 'viewer';
}

type str = string;
