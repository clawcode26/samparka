"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function OnboardStaff() {
  const [formData, setFormData] = useState({ name: '', role: 'reporter', email: '', beat: '' });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/dashboard/manager" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--neutral-900)' }}>Onboard New Staff</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>Generate credentials for a new reporter or editor.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '32px' }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Subash Pradhan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="name@sampark.in"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
                Role
              </label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="reporter">Reporter</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          </div>

          {formData.role === 'reporter' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px' }}>
                Assigned Beat / Category
              </label>
              <select 
                value={formData.beat}
                onChange={(e) => setFormData({...formData, beat: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '14px', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="">Select Category...</option>
                <option value="politics">Politics</option>
                <option value="sports">Sports</option>
                <option value="business">Business</option>
                <option value="entertainment">Entertainment</option>
                <option value="local">Local News</option>
              </select>
            </div>
          )}

          <div style={{ marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--neutral-900)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              <UserPlus size={16} /> Generate Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
