// ─── DataMammoth MCP Server — Shared Types ───

export interface DMServer {
  id: string;
  hostname: string;
  ipAddress: string;
  status: 'active' | 'suspended' | 'terminated' | 'provisioning';
  region: string;
  productName: string;
  os: string;
  cpu: number;
  ram: number;
  disk: number;
  createdAt: string;
}

export interface DMProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: string;
  cpu: number;
  ram: number;
  disk: number;
  bandwidth: number;
  regions: string[];
}

export interface DMInvoice {
  id: string;
  number: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'cancelled';
  total: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
}

export interface DMTicket {
  id: string;
  subject: string;
  status: 'open' | 'answered' | 'customer-reply' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface DMZone {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  provider: string;
  available: boolean;
}

export interface DMSnapshot {
  id: string;
  serverId: string;
  name: string;
  size: number;
  status: 'creating' | 'available' | 'deleting' | 'error';
  createdAt: string;
}

export interface DMBalance {
  balance: number;
  currency: string;
  credit: number;
  unpaidInvoices: number;
}

export interface DMProfile {
  id: string;
  email: string;
  name: string;
  company: string | null;
  role: string;
  tenantId: string;
  tenantName: string;
  createdAt: string;
}

export interface DMHealthStatus {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  services: {
    api: 'ok' | 'down';
    database: 'ok' | 'down';
    provisioning: 'ok' | 'down';
    billing: 'ok' | 'down';
  };
}

export interface DMMetrics {
  serverId: string;
  period: string;
  cpu: { avg: number; max: number; unit: string };
  ram: { used: number; total: number; unit: string };
  disk: { used: number; total: number; unit: string };
  network: { inbound: number; outbound: number; unit: string };
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  };
}
