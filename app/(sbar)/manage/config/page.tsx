import React from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { saveAgencyConfig } from '@/actions/agency-config';
import { normalizeAgencyConfig, resolveActiveAgencyId } from '@/lib/agency-config';

export default async function ManageConfigPage() {
    const session = await getSession();
    if (!session?.id) {
        redirect('/auth/login');
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: Number(session.id) },
        include: { role: true },
    });

    if (!currentUser) {
        redirect('/auth/login');
    }

    const agencyId = resolveActiveAgencyId(currentUser, session.operatingId);
    const isAgencyContext = currentUser.type === 'agency' || Boolean(session.operatingId);
    const isAdmin = currentUser.type === 'admin' || currentUser.role?.role?.toLowerCase().includes('admin');

    if (!agencyId || (!isAgencyContext && !isAdmin)) {
        redirect('/manage');
    }

    const agency = await prisma.user.findUnique({
        where: { id: agencyId },
        select: { id: true, name: true, username: true, type: true },
    });

    if (!agency) {
        redirect('/manage');
    }

    const config = await prisma.agencyConfig.findUnique({
        where: { agencyId },
    });

    const normalized = normalizeAgencyConfig(config);
    const compulsoryFields = normalized?.compulsoryFields.join(', ') || '';
    const defUnits = JSON.stringify(normalized?.defUnits || [
        { field: 'roadSize', unit: 'feet' },
        { field: 'builtUpArea', unit: 'aana' },
    ], null, 2);
    const defaultLocation = normalized?.defaultLocation || {};

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>Agency Config</h1>
                <p style={{ color: '#64748b' }}>
                    Configure compulsory fields, default units, review rules, and agent permissions for @{agency.username}.
                </p>
            </header>

            <form action={saveAgencyConfig} style={{ display: 'grid', gap: '24px' }}>
                <section style={{ background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Listing Rules</h2>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155' }}>Compulsory Fields</label>
                            <textarea
                                name="compulsory_fields"
                                defaultValue={compulsoryFields}
                                placeholder="propertyType, title, province, district"
                                rows={4}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', font: 'inherit' }}
                            />
                            <p style={{ marginTop: '6px', color: '#64748b', fontSize: '0.85rem' }}>Comma or newline separated field names used to decide what can be ignored.</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#334155' }}>Default Units</label>
                            <textarea
                                name="def_units"
                                defaultValue={defUnits}
                                rows={8}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                            />
                            <p style={{ marginTop: '6px', color: '#64748b', fontSize: '0.85rem' }}>Use JSON like: [{`{`}"field": "roadSize", "unit": "feet"{`}`}]</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default Province</span>
                                <input name="default_location_province" defaultValue={defaultLocation.province || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default District</span>
                                <input name="default_location_district" defaultValue={defaultLocation.district || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default City/Village</span>
                                <input name="default_location_cityVillage" defaultValue={defaultLocation.cityVillage || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default Area</span>
                                <input name="default_location_area" defaultValue={defaultLocation.area || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default Ward</span>
                                <input name="default_location_ward" defaultValue={defaultLocation.ward || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                            <label style={{ display: 'grid', gap: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#334155' }}>Default Landmark</span>
                                <input name="default_location_landmark" defaultValue={defaultLocation.landmark || ''} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                            </label>
                        </div>
                    </div>
                </section>

                <section style={{ background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Publishing & Agent Rules</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <input type="checkbox" name="review_required" defaultChecked={Boolean(normalized?.reviewRequired)} />
                            <span style={{ display: 'grid', gap: '4px' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Review required</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Listings stay pending until the agency publishes them.</span>
                            </span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <input type="checkbox" name="can_agent_change_info" defaultChecked={Boolean(normalized?.canAgentChangeInfo)} />
                            <span style={{ display: 'grid', gap: '4px' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Can agent change info</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Allow agents to change their own profile details.</span>
                            </span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                            <input type="checkbox" name="can_agent_delete" defaultChecked={Boolean(normalized?.canAgentDelete)} />
                            <span style={{ display: 'grid', gap: '4px' }}>
                                <span style={{ fontWeight: '700', color: '#0f172a' }}>Can agent delete</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Allow agents to delete their own property listings.</span>
                            </span>
                        </label>
                    </div>
                </section>

                <section style={{ background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Listing Minimums</h2>
                    <div style={{ maxWidth: '280px' }}>
                        <label style={{ display: 'grid', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: '#334155' }}>Min Photo Count</span>
                            <input
                                name="min_photo_count"
                                type="number"
                                min="0"
                                defaultValue={normalized?.minPhotoCount ?? ''}
                                placeholder="e.g. 5"
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                            />
                        </label>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="submit" style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
