import { useState } from 'react'
import { DEFAULT_PROFILE, loadProfile, saveProfile } from '../../admin/storage'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(loadProfile())
  const [profileDraft, setProfileDraft] = useState(profile)
  const [editingProfile, setEditingProfile] = useState(false)

  const handleProfileChange = (field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const nextProfile = {
      fullName: profileDraft.fullName.trim() || DEFAULT_PROFILE.fullName,
      email: profileDraft.email.trim() || DEFAULT_PROFILE.email,
      role: profileDraft.role.trim() || DEFAULT_PROFILE.role,
      bio: profileDraft.bio.trim() || DEFAULT_PROFILE.bio,
    }

    setProfile(nextProfile)
    setProfileDraft(nextProfile)
    saveProfile(nextProfile)
    setEditingProfile(false)
  }

  return (
    <section className="admin-panel-card admin-profile" aria-label="Admin profile">
      <div className="admin-profile-head">
        <h2>Admin Profile</h2>
        {!editingProfile && (
          <button type="button" onClick={() => setEditingProfile(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editingProfile ? (
        <form className="admin-profile-form" onSubmit={handleSaveProfile}>
          <label htmlFor="adminProfileName">Full Name</label>
          <input id="adminProfileName" type="text" value={profileDraft.fullName} onChange={(e) => handleProfileChange('fullName', e.target.value)} required />
          <label htmlFor="adminProfileEmail">Email</label>
          <input id="adminProfileEmail" type="email" value={profileDraft.email} onChange={(e) => handleProfileChange('email', e.target.value)} required />
          <label htmlFor="adminProfileRole">Role</label>
          <input id="adminProfileRole" type="text" value={profileDraft.role} onChange={(e) => handleProfileChange('role', e.target.value)} required />
          <label htmlFor="adminProfileBio">Bio</label>
          <textarea id="adminProfileBio" rows={3} value={profileDraft.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} />
          <div className="admin-profile-actions">
            <button type="submit">Save Profile</button>
            <button type="button" className="btn-secondary" onClick={() => { setProfileDraft(profile); setEditingProfile(false) }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="admin-profile-view">
          <p><strong>Name:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
        </div>
      )}
    </section>
  )
}
