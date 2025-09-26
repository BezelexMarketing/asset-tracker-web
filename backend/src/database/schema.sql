-- Asset Tracker Pro Database Schema
-- Multi-tenant SaaS architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table (your customers)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1976D2',
    secondary_color VARCHAR(7) DEFAULT '#4CAF50',
    contact_email VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    max_devices INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subclients table (client's customers, operators, teams, or sites)
CREATE TABLE subclients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'customer' CHECK (type IN ('customer', 'operator', 'team', 'site', 'department')),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, name)
);

-- Users table (admins and staff per client)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'client_admin', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, email)
);

-- Operators table (staff or external persons responsible for items)
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subclient_id UUID REFERENCES subclients(id) ON DELETE SET NULL,
    employee_id VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, employee_id)
);

-- Items table (equipment/products/tools)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subclient_id UUID REFERENCES subclients(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'lost')),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    maintenance_schedule_days INTEGER DEFAULT 365,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    image_thumbnail_url TEXT,
    image_standard_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, serial_number)
);

-- NFC Tags table (linked to items)
CREATE TABLE nfc_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tag_uid VARCHAR(100) NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, tag_uid)
);

-- Item Assignments table (history of item → operator assignment)
CREATE TABLE item_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subclient_id UUID NOT NULL REFERENCES subclients(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unassigned_at TIMESTAMP WITH TIME ZONE,
    unassigned_by UUID REFERENCES users(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action Logs table (universal logs of all actions with Client/Subclient tracking)
CREATE TABLE action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subclient_id UUID NOT NULL REFERENCES subclients(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('lookup', 'assign', 'unassign', 'checkin', 'checkout', 'maintenance', 'create_item', 'update_item', 'delete_item', 'inventory_update')),
    nfc_tag_uid VARCHAR(100),
    location VARCHAR(255),
    notes TEXT,
    images JSONB, -- Array of image URLs
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Logs table (detailed maintenance records)
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    subclient_id UUID NOT NULL REFERENCES subclients(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    parts_used TEXT,
    time_spent_minutes INTEGER,
    next_maintenance_date DATE,
    images JSONB, -- Array of image URLs
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_subdomain ON clients(subdomain);
CREATE INDEX idx_subclients_client_active ON subclients(client_id, is_active);
CREATE INDEX idx_subclients_client_type ON subclients(client_id, type);
CREATE INDEX idx_users_client_email ON users(client_id, email);
CREATE INDEX idx_users_client_role ON users(client_id, role);
CREATE INDEX idx_operators_client_active ON operators(client_id, is_active);
CREATE INDEX idx_operators_subclient ON operators(subclient_id);
CREATE INDEX idx_items_client_status ON items(client_id, status);
CREATE INDEX idx_items_client_category ON items(client_id, category);
CREATE INDEX idx_items_subclient ON items(subclient_id);
CREATE INDEX idx_nfc_tags_client_uid ON nfc_tags(client_id, tag_uid);
CREATE INDEX idx_nfc_tags_item ON nfc_tags(item_id);
CREATE INDEX idx_item_assignments_client_active ON item_assignments(client_id, is_active);
CREATE INDEX idx_item_assignments_subclient ON item_assignments(subclient_id);
CREATE INDEX idx_item_assignments_item ON item_assignments(item_id);
CREATE INDEX idx_item_assignments_operator ON item_assignments(operator_id);
CREATE INDEX idx_action_logs_client_type ON action_logs(client_id, action_type);
CREATE INDEX idx_action_logs_client_timestamp ON action_logs(client_id, timestamp DESC);
CREATE INDEX idx_action_logs_subclient ON action_logs(subclient_id);
CREATE INDEX idx_action_logs_item ON action_logs(item_id);
CREATE INDEX idx_maintenance_logs_client_item ON maintenance_logs(client_id, item_id);
CREATE INDEX idx_maintenance_logs_subclient ON maintenance_logs(subclient_id);
CREATE INDEX idx_maintenance_logs_timestamp ON maintenance_logs(timestamp DESC);

-- Row Level Security (RLS) for multi-tenant isolation
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subclients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subclients_updated_at BEFORE UPDATE ON subclients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfc_tags_updated_at BEFORE UPDATE ON nfc_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update item status based on assignments
CREATE OR REPLACE FUNCTION update_item_status_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE items SET status = 'assigned' WHERE id = NEW.item_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE items SET status = 'available' WHERE id = NEW.item_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_item_status_on_assignment
    AFTER INSERT OR UPDATE ON item_assignments
    FOR EACH ROW EXECUTE FUNCTION update_item_status_on_assignment();