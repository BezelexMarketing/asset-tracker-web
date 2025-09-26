const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock data for development
const mockClients = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'TechCorp Solutions',
    subdomain: 'techcorp',
    contact_email: 'admin@techcorp.com',
    subscription_plan: 'enterprise',
    max_devices: 100,
    is_active: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Manufacturing Plus',
    subdomain: 'mfgplus',
    contact_email: 'contact@mfgplus.com',
    subscription_plan: 'professional',
    max_devices: 50,
    is_active: true,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20')
  }
];



// GET /api/clients - Get all clients
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let clients = [...mockClients];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.contact_email.toLowerCase().includes(searchLower) ||
        client.subdomain.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status !== undefined) {
      const isActive = status === 'true';
      clients = clients.filter(client => client.is_active === isActive);
    }

    res.json({
      success: true,
      data: clients,
      total: clients.length
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

// GET /api/clients/:id - Get specific client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = mockClients.find(c => c.id === id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client'
    });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res) => {
  try {
    const { name, subdomain, contact_email, subscription_plan, max_devices } = req.body;

    // Validate required fields
    if (!name || !subdomain || !contact_email) {
      return res.status(400).json({
        success: false,
        error: 'Name, subdomain, and contact email are required'
      });
    }

    // Check if subdomain already exists
    const existingClient = mockClients.find(c => c.subdomain === subdomain);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain already exists'
      });
    }

    const newClient = {
      id: uuidv4(),
      name,
      subdomain,
      contact_email,
      subscription_plan: subscription_plan || 'basic',
      max_devices: max_devices || 10,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    mockClients.push(newClient);

    res.status(201).json({
      success: true,
      data: newClient
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client'
    });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const clientIndex = mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Update client
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      ...updates,
      updated_at: new Date()
    };

    res.json({
      success: true,
      data: mockClients[clientIndex]
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
});

module.exports = router;