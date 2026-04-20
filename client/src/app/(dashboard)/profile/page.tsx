'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

const USER = {
    name: 'Admin User',
    email: 'admin@shieldwaf.io',
    role: 'Administrator',
    joinedAt: 'January 2025',
    avatar: 'AD',
}

const USAGE = [
    { label: 'Requests Monitored', value: '2,418,340', color: '#1a6cff' },
    { label: 'Attacks Blocked', value: '18,421', color: '#ef4444' },
    { label: 'Rules Active', value: '7', color: '#22c55e' },
    { label: 'WAF Uptime', value: '99.98%', color: '#f59e0b' },
]

export default function ProfilePage() {
    const { toast } = useToast()
    const [name, setName] = useState(USER.name)
    const [email, setEmail] = useState(USER.email)
    const [saving, setSaving] = useState(false)

    const [oldPw, setOldPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [confPw, setConfPw] = useState('')
    const [pwSaving, setPwSaving] = useState(false)

    const [notifications, setNotifications] = useState({
        email: true,
        browser: false,
        critical: true,
    })

    const saveProfile = async () => {
        setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setSaving(false)
        toast('Profile updated successfully', 'success')
    }

    const savePassword = async () => {
        if (!oldPw || !newPw || !confPw) return toast('Fill all password fields', 'error')
        if (newPw !== confPw) return toast('New passwords do not match', 'error')
        if (newPw.length < 6) return toast('Password must be at least 6 characters', 'error')
        setPwSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setPwSaving(false)
        setOldPw(''); setNewPw(''); setConfPw('')
        toast('Password changed successfully', 'success')
    }

    const card = {
        background: '#0c1118',
        border: '1px solid #1a2535',
        borderRadius: 12,
        padding: '24px',
        marginBottom: 16,
    } as const

    const label = {
        display: 'block', fontSize: 11, color: '#8899b0',
        textTransform: 'uppercase' as const, letterSpacing: '0.07em',
        marginBottom: 6, fontWeight: 500,
    }

    const inp = {
        width: '100%', background: '#101620', border: '1px solid #1a2535',
        color: '#dde6f0', fontSize: 13, padding: '9px 12px',
        borderRadius: 7, outline: 'none', fontFamily: 'inherit',
        boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
    }

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', animation: 'fadein 0.3s ease' }}>

            {/* Avatar + name */}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1a6cff, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, color: '#fff',
                }}>
                    {USER.avatar}
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#dde6f0' }}>{USER.name}</div>
                    <div style={{ fontSize: 12, color: '#8899b0', marginTop: 2 }}>{USER.email}</div>
                    <div style={{
                        display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 99, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: 'rgba(26,108,255,0.12)', color: '#60a5fa', border: '1px solid rgba(26,108,255,0.2)',
                    }}>
                        {USER.role}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#3d5570' }}>
                    Member since {USER.joinedAt}
                </div>
            </div>

            {/* Usage stats */}
            <div style={{ ...card, padding: '18px 24px' }}>
                <div style={{ fontSize: 11, color: '#3d5570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontWeight: 600 }}>
                    Usage Statistics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                    {USAGE.map(u => (
                        <div key={u.label} style={{ background: '#101620', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: u.color, letterSpacing: '-0.5px' }}>{u.value}</div>
                            <div style={{ fontSize: 11, color: '#3d5570', marginTop: 2 }}>{u.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit profile */}
            <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dde6f0', marginBottom: 16 }}>Edit Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={label}>Full Name</label>
                        <input style={inp} value={name} onChange={e => setName(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = '#1a6cff')}
                            onBlur={e => (e.target.style.borderColor = '#1a2535')} />
                    </div>
                    <div>
                        <label style={label}>Email</label>
                        <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = '#1a6cff')}
                            onBlur={e => (e.target.style.borderColor = '#1a2535')} />
                    </div>
                </div>
                <div style={{ marginTop: 12 }}>
                    <label style={label}>Role</label>
                    <input style={{ ...inp, color: '#3d5570', cursor: 'not-allowed' }} value={USER.role} readOnly />
                </div>
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    style={{
                        marginTop: 16, padding: '9px 20px', background: '#1a6cff', color: '#fff',
                        border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
                    }}
                >
                    {saving ? 'Saving…' : 'Save Profile'}
                </button>
            </div>

            {/* Change password */}
            <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dde6f0', marginBottom: 16 }}>Change Password</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { label: 'Current Password', value: oldPw, set: setOldPw },
                        { label: 'New Password', value: newPw, set: setNewPw },
                        { label: 'Confirm New Password', value: confPw, set: setConfPw },
                    ].map(f => (
                        <div key={f.label}>
                            <label style={label}>{f.label}</label>
                            <input type="password" style={inp} value={f.value}
                                onChange={e => f.set(e.target.value)}
                                placeholder="••••••••"
                                onFocus={e => (e.target.style.borderColor = '#1a6cff')}
                                onBlur={e => (e.target.style.borderColor = '#1a2535')} />
                        </div>
                    ))}
                </div>
                <button
                    onClick={savePassword}
                    disabled={pwSaving}
                    style={{
                        marginTop: 16, padding: '9px 20px', background: '#101620', color: '#dde6f0',
                        border: '1px solid #1a2535', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        opacity: pwSaving ? 0.7 : 1, transition: 'opacity 0.15s',
                    }}
                >
                    {pwSaving ? 'Updating…' : 'Update Password'}
                </button>
            </div>

            {/* Notification preferences */}
            <div style={card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#dde6f0', marginBottom: 16 }}>Notification Preferences</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                        { key: 'email', label: 'Email Alerts', desc: 'Receive attack alerts via email' },
                        { key: 'browser', label: 'Browser Alerts', desc: 'Show in-browser notifications' },
                        { key: 'critical', label: 'Critical Only', desc: 'Only notify for Critical severity' },
                    ].map((item, i, arr) => (
                        <div key={item.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '13px 0',
                            borderBottom: i < arr.length - 1 ? '1px solid #1a2535' : 'none',
                        }}>
                            <div>
                                <div style={{ fontSize: 13, color: '#dde6f0', fontWeight: 500 }}>{item.label}</div>
                                <div style={{ fontSize: 11, color: '#3d5570', marginTop: 2 }}>{item.desc}</div>
                            </div>
                            <button
                                onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                                style={{
                                    width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
                                    background: notifications[item.key as keyof typeof notifications] ? '#1a6cff' : '#243044',
                                    position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                                }}
                            >
                                <span style={{
                                    position: 'absolute', top: 3,
                                    left: notifications[item.key as keyof typeof notifications] ? 21 : 3,
                                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                    transition: 'left 0.2s',
                                }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sign out */}
            <div style={{ ...card, marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 10 }}>Danger Zone</div>
                <p style={{ fontSize: 12, color: '#3d5570', marginBottom: 14 }}>
                    Sign out of this session. Your data and settings will be preserved.
                </p>
                <button
                    onClick={() => toast('Signed out successfully', 'info')}
                    style={{
                        padding: '9px 20px', background: 'rgba(239,68,68,0.08)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontSize: 13,
                        fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)')}
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}