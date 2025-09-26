import { 
  ArrowBack,
  Assignment,
  Build,
  CheckCircle,
  PhotoCamera,
  Save
} from '@mui/icons-material';

export default function ItemDetails() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between p-md border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-md">
          <button className="btn-secondary" style={{ padding: '8px', minHeight: 'auto' }}>
            <ArrowBack />
          </button>
          <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Item Details</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ maxWidth: '600px', padding: 'var(--spacing-lg)' }}>
        
        {/* Item Card */}
        <div className="card mb-lg">
          {/* Item Image */}
          <div className="text-center mb-md">
            <div 
              className="image-preview mx-auto mb-sm"
              style={{ 
                width: '150px', 
                height: '150px', 
                backgroundColor: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border)'
              }}
            >
              <PhotoCamera style={{ fontSize: '3rem', color: 'var(--text-secondary)' }} />
            </div>
            <button className="btn btn-secondary">
              <PhotoCamera style={{ fontSize: '1rem' }} />
              Update Photo
            </button>
          </div>

          {/* Item Information */}
          <div className="text-center mb-lg">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
              Dell Laptop - L001
            </h2>
            <div className="status-assigned mb-md">
              Assigned
            </div>
            <div className="text-secondary">
              <p>Serial: DL-2024-001</p>
              <p>Location: Office Floor 2</p>
              <p>Assigned to: John Smith</p>
              <p>Last Updated: Jan 15, 2024</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-md">
            <button className="btn btn-primary">
              <Assignment style={{ fontSize: '1.25rem' }} />
              Reassign Asset
            </button>
            
            <button className="btn btn-secondary">
              <CheckCircle style={{ fontSize: '1.25rem' }} />
              Check In
            </button>
            
            <button className="btn" style={{ 
              backgroundColor: 'var(--warning)', 
              color: 'white',
              border: 'none'
            }}>
              <Build style={{ fontSize: '1.25rem' }} />
              Schedule Maintenance
            </button>
          </div>
        </div>

        {/* Maintenance Form */}
        <div className="card">
          <h3 className="mb-md">Maintenance Report</h3>
          
          <div className="form-group">
            <label className="form-label">Issue Description</label>
            <textarea 
              className="form-input" 
              rows={4}
              placeholder="Describe the maintenance issue or work performed..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select className="form-input">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Maintenance Photos</label>
            <div className="image-upload">
              <PhotoCamera style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }} />
              <p className="text-secondary">Click to upload photos</p>
              <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Max 150px preview</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technician Notes</label>
            <textarea 
              className="form-input" 
              rows={3}
              placeholder="Additional notes or recommendations..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }}>
            <Save style={{ fontSize: '1.25rem' }} />
            Save Maintenance Report
          </button>
        </div>

        {/* Status History */}
        <div className="card mt-lg">
          <h3 className="mb-md">Status History</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-sm" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div className="status-assigned mb-sm">Assigned</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Jan 15, 2024 - John Smith
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-sm" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div className="status-available mb-sm">Available</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Jan 10, 2024 - System
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-sm" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div className="status-maintenance mb-sm">Maintenance</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Jan 5, 2024 - Tech Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}