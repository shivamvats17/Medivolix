import React, { useState, useMemo } from 'react';
import {
  Code,
  Play,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  Search,
  RefreshCw,
  Server,
  Clock,
  Lock,
  Globe
} from 'lucide-react';

const ENDPOINTS = [
  // --- SYSTEM ---
  {
    id: 'sys-health',
    tag: 'System',
    method: 'GET',
    path: '/health',
    summary: 'System Health & DB Pool Diagnostics',
    description: 'Retrieves live platform operational status, HikariCP JDBC connection pool health, and JVM memory statistics.',
    auth: 'PUBLIC',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'System healthy and database connection verified' }
    ]
  },
  {
    id: 'sys-openapi',
    tag: 'System',
    method: 'GET',
    path: '/openapi.json',
    summary: 'OpenAPI 3.0 Specification Document',
    description: 'Returns the full OpenAPI 3.0 specification definition in JSON format.',
    auth: 'PUBLIC',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Complete OpenAPI 3.0.3 specification JSON' }
    ]
  },

  // --- AUTHENTICATION ---
  {
    id: 'auth-register',
    tag: 'Authentication',
    method: 'POST',
    path: '/auth/register',
    summary: 'Register Customer Account',
    description: 'Registers a new customer/patient account with salted BCrypt password encryption and initializes an authenticated session.',
    auth: 'PUBLIC',
    parameters: [],
    sampleBody: JSON.stringify({
      fullName: 'Vikram Mehta',
      email: 'vikram.mehta@example.com',
      phone: '+91 98765 22334',
      password: 'Password@1234'
    }, null, 2),
    sampleResponses: [
      { status: 201, description: 'Customer account created' },
      { status: 400, description: 'Validation error or email already in use' }
    ]
  },
  {
    id: 'auth-login',
    tag: 'Authentication',
    method: 'POST',
    path: '/auth/login',
    summary: 'Authenticate Session (Login)',
    description: 'Verifies email and password against stored BCrypt hashes. Issues a secure HTTP session cookie.',
    auth: 'PUBLIC',
    parameters: [],
    sampleBody: JSON.stringify({
      email: 'careplus@medivolix.com',
      password: 'Pharmacy@1234'
    }, null, 2),
    sampleResponses: [
      { status: 200, description: 'Login successful with UserDto payload' },
      { status: 401, description: 'Invalid email or password' }
    ]
  },
  {
    id: 'auth-logout',
    tag: 'Authentication',
    method: 'POST',
    path: '/auth/logout',
    summary: 'Terminate Session (Logout)',
    description: 'Invalidates the active HTTP session cookie and clears server session attributes.',
    auth: 'AUTHENTICATED',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Session successfully invalidated' }
    ]
  },
  {
    id: 'auth-me',
    tag: 'Authentication',
    method: 'GET',
    path: '/auth/me',
    summary: 'Get Current Authenticated Profile',
    description: 'Returns the active user profile, permission role, and associated pharmacy bindings.',
    auth: 'AUTHENTICATED',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Active profile details' },
      { status: 401, description: 'Not authenticated' }
    ]
  },

  // --- MEDICINES ---
  {
    id: 'med-search',
    tag: 'Medicines',
    method: 'GET',
    path: '/medicines/search',
    summary: 'Search Medicines & Pharmacy Stock',
    description: 'Searches medications by brand name, generic salt, or category. Calculates Haversine distance in km and 24-hour stock freshness.',
    auth: 'PUBLIC',
    parameters: [
      { name: 'q', in: 'query', type: 'string', required: false, defaultValue: 'augmentin', description: 'Medicine brand or generic name' },
      { name: 'lat', in: 'query', type: 'number', required: false, defaultValue: '12.9719', description: 'User latitude (e.g., Bengaluru)' },
      { name: 'lng', in: 'query', type: 'number', required: false, defaultValue: '77.6412', description: 'User longitude (e.g., Bengaluru)' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Matching medicines with reporting pharmacy stock, distance, and freshness' }
    ]
  },
  {
    id: 'med-detail',
    tag: 'Medicines',
    method: 'GET',
    path: '/medicines/{id}',
    summary: 'Get Medicine Specifications',
    description: 'Returns full clinical specifications, dosage form, prescription requirement, and participating pharmacy stock for a medicine ID.',
    auth: 'PUBLIC',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Medicine primary key ID' },
      { name: 'lat', in: 'query', type: 'number', required: false, defaultValue: '12.9719', description: 'User latitude' },
      { name: 'lng', in: 'query', type: 'number', required: false, defaultValue: '77.6412', description: 'User longitude' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Medicine details and pharmacy list' },
      { status: 404, description: 'Medicine not found' }
    ]
  },
  {
    id: 'med-list',
    tag: 'Medicines',
    method: 'GET',
    path: '/medicines',
    summary: 'List All Catalog Medicines',
    description: 'Retrieves the standard catalog of all approved medications.',
    auth: 'PUBLIC',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Array of medicine catalog items' }
    ]
  },

  // --- PHARMACIES ---
  {
    id: 'pharm-list',
    tag: 'Pharmacies',
    method: 'GET',
    path: '/pharmacies',
    summary: 'List Approved Participating Pharmacies',
    description: 'Returns all verified pharmacies with status APPROVED, sorted by distance if GPS coordinates are provided.',
    auth: 'PUBLIC',
    parameters: [
      { name: 'lat', in: 'query', type: 'number', required: false, defaultValue: '12.9719', description: 'User latitude' },
      { name: 'lng', in: 'query', type: 'number', required: false, defaultValue: '77.6412', description: 'User longitude' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'List of approved pharmacies' }
    ]
  },
  {
    id: 'pharm-detail',
    tag: 'Pharmacies',
    method: 'GET',
    path: '/pharmacies/{id}',
    summary: 'Get Pharmacy Store Profile',
    description: 'Retrieves store details, license number, contact phone, physical address, and operating hours.',
    auth: 'PUBLIC',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Pharmacy ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Pharmacy details' },
      { status: 404, description: 'Pharmacy not found' }
    ]
  },
  {
    id: 'pharm-inventory',
    tag: 'Pharmacies',
    method: 'GET',
    path: '/pharmacies/{id}/medicines',
    summary: 'Get Pharmacy Medicine Inventory',
    description: 'Returns the catalog of medicines currently reported as stocked by the given pharmacy.',
    auth: 'PUBLIC',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Pharmacy ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Pharmacy inventory items' }
    ]
  },

  // --- PHARMACY INVENTORY ---
  {
    id: 'inv-get',
    tag: 'Pharmacy Inventory',
    method: 'GET',
    path: '/pharmacy/inventory',
    summary: 'List Pharmacy Inventory (Admin)',
    description: 'Returns inventory list for the authenticated pharmacy administrator\'s store.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Current store inventory' },
      { status: 403, description: 'Pharmacy administrator access required' }
    ]
  },
  {
    id: 'inv-save',
    tag: 'Pharmacy Inventory',
    method: 'POST',
    path: '/pharmacy/inventory',
    summary: 'Add / Update Stock Item',
    description: 'Updates stock quantity, price, threshold, and optionally records initial batch information with audit logging.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: JSON.stringify({
      medicineId: 1,
      stockQuantity: 45,
      price: 204.50,
      isAvailable: true,
      lowStockThreshold: 10,
      batchNumber: 'AUG-2026-X1',
      expiryDate: '2027-09-30'
    }, null, 2),
    sampleResponses: [
      { status: 200, description: 'Inventory saved successfully' },
      { status: 400, description: 'Validation failed' }
    ]
  },
  {
    id: 'inv-unavailable',
    tag: 'Pharmacy Inventory',
    method: 'POST',
    path: '/pharmacy/inventory/{id}/unavailable',
    summary: 'Mark Item Unavailable',
    description: 'Immediately sets stock quantity to 0 and flags item as unavailable.',
    auth: 'PHARMACY_ADMIN',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Inventory record ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Item flagged as unavailable' },
      { status: 400, description: 'Record not found or unassociated pharmacy' }
    ]
  },
  {
    id: 'inv-batch',
    tag: 'Pharmacy Inventory',
    method: 'POST',
    path: '/pharmacy/inventory/batch',
    summary: 'Record Medicine Batch',
    description: 'Adds a manufacturer batch number with expiration date and batch quantity, increasing total sellable stock.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: JSON.stringify({
      inventoryId: 1,
      batchNumber: 'BATCH-2026-R9',
      quantity: 30,
      expiryDate: '2027-11-30'
    }, null, 2),
    sampleResponses: [
      { status: 201, description: 'Batch recorded' }
    ]
  },
  {
    id: 'inv-lowstock',
    tag: 'Pharmacy Inventory',
    method: 'GET',
    path: '/pharmacy/inventory/low-stock',
    summary: 'Get Low Stock Items',
    description: 'Returns stock items where current quantity is at or below the configured lowStockThreshold.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Items needing replenishment' }
    ]
  },
  {
    id: 'inv-expiry',
    tag: 'Pharmacy Inventory',
    method: 'GET',
    path: '/pharmacy/inventory/expiry',
    summary: 'Get Approaching Expiry Batches',
    description: 'Returns non-expired medicine batches with expiration dates within 45 days.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Expiring batches list' }
    ]
  },
  {
    id: 'inv-audit',
    tag: 'Pharmacy Inventory',
    method: 'GET',
    path: '/pharmacy/inventory/audit',
    summary: 'Get Inventory Audit Trail',
    description: 'Retrieves immutable audit logs showing previous quantity changes, timestamps, and modification reasons.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Audit trail records' }
    ]
  },

  // --- AVAILABILITY INQUIRIES ---
  {
    id: 'req-create',
    tag: 'Availability Inquiries',
    method: 'POST',
    path: '/availability-requests',
    summary: 'Submit Availability Inquiry',
    description: 'Allows a customer to ask a pharmacy to confirm medication stock before traveling.',
    auth: 'CUSTOMER',
    parameters: [],
    sampleBody: JSON.stringify({
      pharmacyId: 1,
      medicineId: 1,
      requestedQuantity: 2,
      customerNotes: 'Valid prescription available. Can I pick up around 6 PM?'
    }, null, 2),
    sampleResponses: [
      { status: 201, description: 'Inquiry submitted with PENDING status' },
      { status: 400, description: 'Missing required fields' }
    ]
  },
  {
    id: 'req-my',
    tag: 'Availability Inquiries',
    method: 'GET',
    path: '/availability-requests/my',
    summary: 'Get Customer Inquiries',
    description: 'Returns all inquiries submitted by the authenticated customer.',
    auth: 'CUSTOMER',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'List of customer inquiries' }
    ]
  },
  {
    id: 'req-cancel',
    tag: 'Availability Inquiries',
    method: 'POST',
    path: '/availability-requests/{id}/cancel',
    summary: 'Cancel Availability Inquiry',
    description: 'Allows customer to cancel an inquiry while still in PENDING status.',
    auth: 'CUSTOMER',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Inquiry ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Inquiry cancelled' }
    ]
  },
  {
    id: 'req-pharmacy',
    tag: 'Availability Inquiries',
    method: 'GET',
    path: '/pharmacy/requests',
    summary: 'Get Pharmacy Incoming Inquiries',
    description: 'Retrieves incoming inquiries received by the authenticated pharmacy administrator\'s store.',
    auth: 'PHARMACY_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Pharmacy requests list' }
    ]
  },
  {
    id: 'req-status',
    tag: 'Availability Inquiries',
    method: 'POST',
    path: '/pharmacy/requests/{id}/status',
    summary: 'Update Inquiry Status (Pharmacist)',
    description: 'Updates inquiry status to CONFIRMED, UNAVAILABLE, or COMPLETED with pharmacist reply notes.',
    auth: 'PHARMACY_ADMIN',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '1', description: 'Inquiry ID' }
    ],
    sampleBody: JSON.stringify({
      status: 'CONFIRMED',
      notes: '2 units reserved under your name until 8:00 PM.'
    }, null, 2),
    sampleResponses: [
      { status: 200, description: 'Status updated' },
      { status: 400, description: 'Inquiry not found or wrong pharmacy' }
    ]
  },

  // --- ADMINISTRATION ---
  {
    id: 'admin-overview',
    tag: 'Administration',
    method: 'GET',
    path: '/admin/overview',
    summary: 'Platform Overview & Live Metrics',
    description: 'Returns system-wide counts: total users, approved pharmacies, catalog medicines, and inquiry totals.',
    auth: 'SYSTEM_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Platform metrics' },
      { status: 403, description: 'System Administrator privileges required' }
    ]
  },
  {
    id: 'admin-users',
    tag: 'Administration',
    method: 'GET',
    path: '/admin/users',
    summary: 'List All System Users',
    description: 'Returns all registered users with role and status details.',
    auth: 'SYSTEM_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'All users list' }
    ]
  },
  {
    id: 'admin-pharmacies',
    tag: 'Administration',
    method: 'GET',
    path: '/admin/pharmacies',
    summary: 'List All Pharmacies (All Statuses)',
    description: 'Returns all pharmacies across PENDING, APPROVED, and SUSPENDED states for regulatory review.',
    auth: 'SYSTEM_ADMIN',
    parameters: [],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'All pharmacies list' }
    ]
  },
  {
    id: 'admin-approve',
    tag: 'Administration',
    method: 'POST',
    path: '/admin/pharmacies/{id}/approve',
    summary: 'Approve Pharmacy Application',
    description: 'Transitions pharmacy from PENDING to APPROVED status, enabling public listing and search visibility.',
    auth: 'SYSTEM_ADMIN',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '4', description: 'Pharmacy ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Pharmacy approved' }
    ]
  },
  {
    id: 'admin-suspend',
    tag: 'Administration',
    method: 'POST',
    path: '/admin/pharmacies/{id}/suspend',
    summary: 'Suspend Pharmacy Account',
    description: 'Transitions pharmacy to SUSPENDED status, hiding all inventory from public discovery.',
    auth: 'SYSTEM_ADMIN',
    parameters: [
      { name: 'id', in: 'path', type: 'integer', required: true, defaultValue: '4', description: 'Pharmacy ID' }
    ],
    sampleBody: null,
    sampleResponses: [
      { status: 200, description: 'Pharmacy suspended' }
    ]
  }
];

const TAGS = ['All', 'System', 'Authentication', 'Medicines', 'Pharmacies', 'Pharmacy Inventory', 'Availability Inquiries', 'Administration'];

const AUTH_PRESETS = [
  { label: 'Guest (No Token)', token: '', role: 'Guest' },
  { label: 'Customer (John Doe - ID 3)', token: '3', role: 'CUSTOMER' },
  { label: 'Pharmacy Admin (CarePlus - ID 2)', token: '2', role: 'PHARMACY_ADMIN' },
  { label: 'System Admin (ID 1)', token: '1', role: 'SYSTEM_ADMIN' }
];

export default function ApiExplorer() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEndpointId, setActiveEndpointId] = useState(ENDPOINTS[0].id);

  // Authentication simulator state
  const [selectedAuthPreset, setSelectedAuthPreset] = useState(AUTH_PRESETS[0]);
  const [customToken, setCustomToken] = useState('');
  const [useCustomToken, setUseCustomToken] = useState(false);

  // Live tester execution state
  const [paramValues, setParamValues] = useState({});
  const [requestBodyText, setRequestBodyText] = useState('');
  const [executing, setExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseLatency, setResponseLatency] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [responseTab, setResponseTab] = useState('body');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return ENDPOINTS.filter((ep) => {
      const matchesTag = selectedTag === 'All' || ep.tag === selectedTag;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ep.path.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.tag.toLowerCase().includes(q);
      return matchesTag && matchesSearch;
    });
  }, [selectedTag, searchQuery]);

  // Active endpoint
  const activeEndpoint = useMemo(() => {
    return ENDPOINTS.find((ep) => ep.id === activeEndpointId) || ENDPOINTS[0];
  }, [activeEndpointId]);

  // When active endpoint changes, seed default parameters and sample body
  const handleSelectEndpoint = (endpoint) => {
    setActiveEndpointId(endpoint.id);
    const initialParams = {};
    endpoint.parameters.forEach((p) => {
      initialParams[p.name] = p.defaultValue || '';
    });
    setParamValues(initialParams);
    setRequestBodyText(endpoint.sampleBody || '');
    setResponseStatus(null);
    setResponseLatency(null);
    setResponseData(null);
  };

  // Determine effective bearer token
  const effectiveBearerToken = useCustomToken ? customToken.trim() : selectedAuthPreset.token;

  // Build full request URL
  const buildRequestUrl = () => {
    let resolvedPath = activeEndpoint.path;
    const queryParams = new URLSearchParams();

    activeEndpoint.parameters.forEach((param) => {
      const val = paramValues[param.name];
      if (val !== undefined && val !== '') {
        if (param.in === 'path') {
          resolvedPath = resolvedPath.replace(`{${param.name}}`, encodeURIComponent(val));
        } else if (param.in === 'query') {
          queryParams.append(param.name, val);
        }
      }
    });

    const queryString = queryParams.toString();
    const finalPath = queryString ? `${resolvedPath}?${queryString}` : resolvedPath;
    return `/api${finalPath}`;
  };

  // Generate curl command
  const generateCurlCommand = () => {
    const url = `http://localhost:8080${buildRequestUrl()}`;
    let curl = `curl -X ${activeEndpoint.method} "${url}" \\\n  -H "Accept: application/json"`;
    if (effectiveBearerToken) {
      curl += ` \\\n  -H "Authorization: Bearer ${effectiveBearerToken}"`;
    }
    if (activeEndpoint.method !== 'GET' && requestBodyText.trim()) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBodyText.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  // Execute live API request
  const handleExecuteRequest = async () => {
    setExecuting(true);
    setResponseStatus(null);
    setResponseLatency(null);
    setResponseData(null);
    setResponseHeaders(null);

    const targetUrl = buildRequestUrl();
    const headers = {
      Accept: 'application/json'
    };

    if (effectiveBearerToken) {
      headers['Authorization'] = `Bearer ${effectiveBearerToken}`;
    }

    const options = {
      method: activeEndpoint.method,
      headers,
      credentials: 'include'
    };

    if (activeEndpoint.method !== 'GET' && activeEndpoint.method !== 'HEAD' && requestBodyText.trim()) {
      headers['Content-Type'] = 'application/json';
      options.body = requestBodyText;
    }

    const startTime = performance.now();
    try {
      const res = await fetch(targetUrl, options);
      const endTime = performance.now();
      setResponseLatency(Math.round(endTime - startTime));
      setResponseStatus({
        code: res.status,
        statusText: res.statusText,
        ok: res.ok
      });

      const headerObj = {};
      res.headers.forEach((v, k) => {
        headerObj[k] = v;
      });
      setResponseHeaders(headerObj);

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setResponseData(json);
      } else {
        const text = await res.text();
        setResponseData(text);
      }
    } catch (err) {
      const endTime = performance.now();
      setResponseLatency(Math.round(endTime - startTime));
      setResponseStatus({
        code: 0,
        statusText: 'Network Error',
        ok: false
      });
      setResponseData({ error: err.message, note: 'Ensure backend server is running on localhost:8080' });
    } finally {
      setExecuting(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'response') {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } else if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'GET':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'POST':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'PUT':
      case 'PATCH':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'DELETE':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getAuthBadge = (auth) => {
    switch (auth) {
      case 'PUBLIC':
        return { label: 'Public', bg: '#f0fdf4', color: '#15803d', icon: Globe };
      case 'CUSTOMER':
        return { label: 'Customer', bg: '#eff6ff', color: '#1d4ed8', icon: Lock };
      case 'PHARMACY_ADMIN':
        return { label: 'Pharmacy Admin', bg: '#fef3c7', color: '#92400e', icon: Lock };
      case 'SYSTEM_ADMIN':
        return { label: 'System Admin', bg: '#fee2e2', color: '#991b1b', icon: Shield };
      default:
        return { label: 'Auth Required', bg: '#f1f5f9', color: '#475569', icon: Lock };
    }
  };

  const currentAuthBadge = getAuthBadge(activeEndpoint.auth);
  const currentMethodBadge = getMethodBadge(activeEndpoint.method);

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: 'calc(100vh - 68px)', padding: '32px 0 64px 0' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 700
                }}>
                  <Code size={16} /> OpenAPI 3.0.3
                </div>
                <div style={{
                  backgroundColor: '#f1f5f9',
                  color: 'var(--text-secondary)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Server size={14} /> Base URL: <code style={{ fontFamily: 'var(--font-mono)' }}>/api</code>
                </div>
                <div style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}>
                  v1.0.0
                </div>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                Medivolix REST API Explorer
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
                Interactive specification and developer testing workbench for Medivolix. Inspect endpoint schemas, query parameters, authentication scopes, and execute live HTTP requests directly against your local backend.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="/openapi.json"
                download="medivolix-openapi.json"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
              >
                <Download size={15} /> Download openapi.json
              </a>
              <a
                href="/api/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}
              >
                <ExternalLink size={15} /> Raw Spec URL
              </a>
            </div>
          </div>

          {/* Auth Simulation Toolbar */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Testing Authentication:
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              {!useCustomToken ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AUTH_PRESETS.map((preset) => {
                    const isSelected = selectedAuthPreset.label === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSelectedAuthPreset(preset)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--primary)' : '#f8fafc',
                          color: isSelected ? '#ffffff' : 'var(--text-main)',
                          border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-strong)'}`,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '400px' }}>
                  <input
                    type="text"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Enter custom Bearer token or User ID..."
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-mono)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)'
                    }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseCustomToken(!useCustomToken)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 500
                }}
              >
                {useCustomToken ? 'Use Quick Presets' : 'Custom Token'}
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Header: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {effectiveBearerToken ? `Authorization: Bearer ${effectiveBearerToken}` : 'None (Cookie Session or Anonymous)'}
              </code>
            </div>
          </div>
        </div>

        {/* Main 2-Pane Explorer Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Column: Navigation, Search, and Endpoint List */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search endpoints or path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            {/* Tag Pills */}
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: selectedTag === tag ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: selectedTag === tag ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: selectedTag === tag ? 'var(--primary-light)' : '#ffffff',
                    color: selectedTag === tag ? 'var(--primary-dark)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div style={{
              maxHeight: '620px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {filteredEndpoints.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No matching endpoints found
                </div>
              ) : (
                filteredEndpoints.map((ep) => {
                  const isSelected = ep.id === activeEndpoint.id;
                  const badge = getMethodBadge(ep.method);
                  return (
                    <div
                      key={ep.id}
                      onClick={() => handleSelectEndpoint(ep)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {ep.method}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ep.path}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {ep.summary}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Endpoint Workbench */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Endpoint Summary Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: currentMethodBadge.bg,
                  color: currentMethodBadge.color,
                  border: `1px solid ${currentMethodBadge.border}`,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {activeEndpoint.method}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-main)'
                }}>
                  {activeEndpoint.path}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: currentAuthBadge.bg,
                color: currentAuthBadge.color,
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <currentAuthBadge.icon size={13} />
                {currentAuthBadge.label}
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {activeEndpoint.summary}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {activeEndpoint.description}
            </p>

            {/* Resolved URL Preview */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem'
            }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>URL: </span>
                <strong style={{ color: 'var(--primary-dark)' }}>{buildRequestUrl()}</strong>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(generateCurlCommand(), 'curl')}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
              >
                {copiedCurl ? <Check size={13} style={{ color: 'var(--primary)' }} /> : <Copy size={13} />}
                {copiedCurl ? 'Copied cURL' : 'Copy cURL'}
              </button>
            </div>

            {/* Parameters Table (if any) */}
            {activeEndpoint.parameters.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                  Parameters
                </h3>
                <div style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>Name</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>Type</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>In</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>Description</th>
                        <th style={{ padding: '8px 12px', fontWeight: 700 }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEndpoint.parameters.map((param) => (
                        <tr key={param.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {param.name} {param.required && <span style={{ color: '#dc2626' }}>*</span>}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{param.type}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{param.in}</td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{param.description}</td>
                          <td style={{ padding: '6px 12px', width: '220px' }}>
                            <input
                              type="text"
                              value={paramValues[param.name] ?? ''}
                              onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                              placeholder={param.defaultValue || 'Enter value...'}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '0.8125rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-strong)',
                                fontFamily: 'var(--font-mono)'
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Request Body (if POST/PUT) */}
            {activeEndpoint.sampleBody !== null && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    JSON Request Body
                  </h3>
                  <button
                    type="button"
                    onClick={() => setRequestBodyText(activeEndpoint.sampleBody)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={12} /> Reset to Sample
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {/* Send Request Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <button
                type="button"
                onClick={handleExecuteRequest}
                disabled={executing}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.9375rem',
                  fontWeight: 700
                }}
              >
                {executing ? <RefreshCw size={16} className="spin-animation" /> : <Play size={16} />}
                {executing ? 'Sending Request...' : 'Send Request'}
              </button>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Targeting: <code style={{ fontFamily: 'var(--font-mono)' }}>{activeEndpoint.method} {buildRequestUrl()}</code>
              </div>
            </div>

            {/* Live Response Panel */}
            {responseStatus && (
              <div style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                marginBottom: '28px'
              }}>
                {/* Response Status Bar */}
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: responseStatus.ok ? '#dcfce7' : '#fee2e2',
                      color: responseStatus.ok ? '#166534' : '#991b1b',
                      border: `1px solid ${responseStatus.ok ? '#bbf7d0' : '#fecaca'}`,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {responseStatus.code} {responseStatus.statusText}
                    </span>

                    {responseLatency !== null && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={13} /> {responseLatency} ms
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setResponseTab('body')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: responseTab === 'body' ? 700 : 500,
                          backgroundColor: responseTab === 'body' ? 'var(--primary)' : '#ffffff',
                          color: responseTab === 'body' ? '#ffffff' : 'var(--text-main)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Body
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseTab('headers')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: responseTab === 'headers' ? 700 : 500,
                          backgroundColor: responseTab === 'headers' ? 'var(--primary)' : '#ffffff',
                          color: responseTab === 'headers' ? '#ffffff' : 'var(--text-main)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Headers {responseHeaders ? `(${Object.keys(responseHeaders).length})` : ''}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(JSON.stringify(responseData, null, 2), 'response')}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {copiedResponse ? <Check size={13} style={{ color: 'var(--primary)' }} /> : <Copy size={13} />}
                      {copiedResponse ? 'Copied Response' : 'Copy JSON'}
                    </button>
                  </div>
                </div>

                {/* Content Panel: Body or Headers */}
                {responseTab === 'body' ? (
                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    backgroundColor: '#0f172a',
                    color: '#38bdf8',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    overflowX: 'auto',
                    maxHeight: '400px',
                    lineHeight: 1.5
                  }}>
                    {typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2)}
                  </pre>
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', maxHeight: '400px', overflowY: 'auto' }}>
                    {responseHeaders ? (
                      Object.entries(responseHeaders).map(([key, val]) => (
                        <div key={key} style={{ padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                          <span style={{ color: '#94a3b8' }}>{key}: </span>
                          <span style={{ color: '#38bdf8' }}>{val}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#94a3b8' }}>No response headers captured.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Expected Responses Documentation */}
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
                OpenAPI Documented Responses
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeEndpoint.sampleResponses.map((sr) => {
                  const isSuccess = sr.status >= 200 && sr.status < 300;
                  return (
                    <div
                      key={sr.status}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
                        color: isSuccess ? '#166534' : '#991b1b',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {sr.status}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {sr.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
