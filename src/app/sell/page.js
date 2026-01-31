"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createListing } from './actions/listing';

export default function SellPage() {
    const [category, setCategory] = useState('House');

    return (
        <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <header className="full-width-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <div className="layout-container header-content">
                    <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', textDecoration: 'none' }}>
                        Namsari<span style={{ color: 'var(--color-gold)' }}>.</span>
                    </Link>
                    <nav style={{ display: 'flex', gap: '32px', fontWeight: '500', fontSize: '0.9rem', alignItems: 'center' }}>
                        <Link href="/">Browse</Link>
                        <Link href="/manage" style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none' }}>
                            Management
                        </Link>
                    </nav>
                </div>
            </header>

            <div className="layout-container" style={{ maxWidth: '800px', paddingTop: '60px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>List Your Property</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Reach verified institutional buyers and premium residential seekers.</p>
                </div>

                <form action={createListing} className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Main Category</label>
                            <select
                                name="main_category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                                required
                            >
                                <option value="House">House</option>
                                <option value="Land">Land</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Building">Building (Complex, Hospital, etc.)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Sub-Category (Optional)</label>
                            <select name="commercial_sub_category" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}>
                                <option value="">Select Sub-type</option>
                                {category === 'Land' && (
                                    <>
                                        <option value="Agriculture">Agriculture/Farm Land</option>
                                        <option value="Factory">Factory Land</option>
                                    </>
                                )}
                                {category === 'Building' && (
                                    <>
                                        <option value="Office">Office Space</option>
                                        <option value="Rental">Rental Building</option>
                                        <option value="Complex">Complex</option>
                                        <option value="Hospital">Hospital</option>
                                        <option value="Hotel">Hotel</option>
                                    </>
                                )}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Property Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. The Sterling Penthouse"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Price</label>
                            <input
                                type="text"
                                name="price"
                                placeholder="e.g. $2,500,000"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Manhattan, NY"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>Specifications & Description</label>
                        <textarea
                            name="specs"
                            rows="4"
                            placeholder="e.g. 4 Beds • 5 Baths • 4500 Sqft"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}
                            required
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontWeight: '700',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Post Listing
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
