import { useEffect, useState } from 'react'
import { DEFAULT_PROFILE, loadProfile, saveProfile } from '../../admin/storage'
import CmsImageUploadField from '../../components/CmsImageUploadField'
import {
  fetchAdminProfileFromDatabase,
  upsertAdminProfileToDatabase,
} from '../../lib/adminProfileApi'
import { supabase } from '../../lib/supabaseClient'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(loadProfile())
  const [profileDraft, setProfileDraft] = useState(profile)
  const [editingProfile, setEditingProfile] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let cancelled = false
    void fetchAdminProfileFromDatabase().then(({ profile: remote }) => {
      if (cancelled) return
      if (remote) {
        setProfile(remote)
        setProfileDraft(remote)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleProfileChange = (field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)

    const nextProfile = {
      fullName: profileDraft.fullName.trim() || DEFAULT_PROFILE.fullName,
      email: profileDraft.email.trim() || DEFAULT_PROFILE.email,
      role: profileDraft.role.trim() || DEFAULT_PROFILE.role,
      bio: profileDraft.bio.trim() || DEFAULT_PROFILE.bio,
      avatarUrl: profileDraft.avatarUrl?.trim() || '',
    }

    setProfile(nextProfile)
    setProfileDraft(nextProfile)
    saveProfile(nextProfile)

    if (supabase) {
      const { ok, error } = await upsertAdminProfileToDatabase(nextProfile)
      if (!ok) {
        setSaveError(error || 'Could not save profile to the database.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setEditingProfile(false)
  }

  return (
    <section className="admin-panel-card admin-profile" aria-label="Admin profile">
      <div className="admin-profile-head">
        <h2>Admin Profile</h2>
        {!editingProfile && !loading ? (
          <button type="button" onClick={() => setEditingProfile(true)}>
            Edit Profile
          </button>
        ) : null}
      </div>

      {loading ? <p className="page-empty">Loading profile…</p> : null}

      {!loading && editingProfile ? (
        <form className="admin-profile-form" onSubmit={handleSaveProfile}>
          <CmsImageUploadField
            label="Profile photo"
            value={profileDraft.avatarUrl || ''}
            onChange={(url) => handleProfileChange('avatarUrl', url)}
            variant="avatar"
            hint="Stored in Supabase Storage (cms-media/avatars). Shown in admin areas when set."
          />
          <label htmlFor="adminProfileName">Full Name</label>
          <input
            id="adminProfileName"
            type="text"
            value={profileDraft.fullName}
            onChange={(e) => handleProfileChange('fullName', e.target.value)}
            required
          />
          <label htmlFor="adminProfileEmail">Email</label>
          <input
            id="adminProfileEmail"
            type="email"
            value={profileDraft.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            required
          />
          <label htmlFor="adminProfileRole">Role</label>
          <input
            id="adminProfileRole"
            type="text"
            value={profileDraft.role}
            onChange={(e) => handleProfileChange('role', e.target.value)}
            required
          />
          <label htmlFor="adminProfileBio">Bio</label>
          <textarea
            id="adminProfileBio"
            rows={3}
            value={profileDraft.bio}
            onChange={(e) => handleProfileChange('bio', e.target.value)}
          />
          {saveError ? <p className="field-error">{saveError}</p> : null}
          <div className="admin-profile-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={saving}
              onClick={() => {
                setProfileDraft(profile)
                setEditingProfile(false)
                setSaveError('')
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!loading && !editingProfile ? (
        <div className="admin-profile-view">
          {profile.avatarUrl ? (
            <p className="admin-profile-avatar-wrap">
              <img className="admin-profile-avatar" src={profile.avatarUrl} alt="" />
            </p>
          ) : null}
          <p>
            <strong>Name:</strong> {profile.fullName}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Role:</strong> {profile.role}
          </p>
          <p>
            <strong>Bio:</strong> {profile.bio}
          </p>
          {supabase ? (
            <p className="page-terms-meta">Stored in your admin_user_profiles database row.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
