'use client';

import { createBank } from '../actions';

export default function CreateBankPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Add New Bank</h1>

            <div className="card" style={{ padding: '32px' }}>
                <form action={createBank} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Bank Name</label>
                        <input name="name" type="text" className="form-control" placeholder="e.g. Nabil Bank" required />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Icon URL</label>
                        <input name="icon" type="url" className="form-control" placeholder="https://..." />
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Square logo recommended.</div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description (Optional)</label>
                        <textarea name="description" className="form-control" rows={4} placeholder="Short description about the bank..."></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Bank</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
