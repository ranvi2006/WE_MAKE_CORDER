import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminInterviewPractice(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState({})
  const [updatingIds, setUpdatingIds] = useState(new Set())

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    client.get('/api/admin/interview-practice')
      .then(res => {
        if(!mounted) return
        const data = Array.isArray(res.data) ? res.data : (res.data?.items || [])
        setItems(data)
      })
      .catch(err => {
        if(!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load interview requests')
      })
      .finally(()=> mounted && setLoading(false))

    return ()=>{ mounted = false }
  }, [])

  function startEdit(it){
    // prefill meeting date/time from possible meetingDateTime or meetingDate+meetingTime
    const dt = it.meetingDateTime ? new Date(it.meetingDateTime) : null
    const meetingDate = dt ? dt.toISOString().slice(0,10) : (it.meetingDate || '')
    const meetingTime = dt ? dt.toTimeString().slice(0,5) : (it.meetingTime || '')
    setEditing(prev => ({ ...prev, [it.id]: { meetingDate, meetingTime, meetingLink: it.meetingLink || '', status: it.status || '', dirty:false }}))
  }

  function changeEdit(id, field, value){
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id]||{}), [field]: value, dirty:true }}))
  }

  async function saveEdit(id){
    const ed = editing[id]
    if(!ed) return
    // combine date+time into ISO if both present
    let meetingDateTime = null
    if(ed.meetingDate){
      const t = ed.meetingTime || '00:00'
      meetingDateTime = new Date(`${ed.meetingDate}T${t}:00`).toISOString()
    }
    const payload = { meetingDateTime, meetingLink: ed.meetingLink, status: ed.status }
    setUpdatingIds(prev => new Set(prev).add(id))
    try{
      const res = await client.put(`/api/admin/interview-practice/${id}`, payload)
      const updated = res.data || {}
      setItems(prev => prev.map(it => it.id === id ? { ...it, ...updated, meetingLink: updated.meetingLink ?? ed.meetingLink, status: updated.status ?? ed.status } : it))
      setEditing(prev => ({ ...prev, [id]: { ...prev[id], dirty:false }}))
    }catch(err){
      console.error('save failed', err)
      setError(err?.response?.data?.message || err.message || 'Failed to save')
    }finally{
      setUpdatingIds(prev => { const copy = new Set(prev); copy.delete(id); return copy })
    }
  }

  function cancelEdit(id){ setEditing(prev=>{ const copy={...prev}; delete copy[id]; return copy }) }

  const statusOptions = ['new','reviewed','scheduled','completed','closed']

  return (
    <section>
      <div className="card">
        <h2>Interview Practice Requests</h2>
        <p className="muted">Schedule interviews and set meeting links for students.</p>

        {loading && <p className="muted">Loading…</p>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="admin-table">
            <div className="table-head admin-row">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Experience</div>
              <div>Availability</div>
              <div>Status</div>
              <div>Meeting</div>
              <div></div>
            </div>

            {items.map(it => {
              const ed = editing[it.id]
              const isUpdating = updatingIds.has(it.id)
              const meetingDisplay = it.meetingDateTime ? new Date(it.meetingDateTime).toLocaleString() : (it.meetingDate || '—')
              return (
                <div key={it.id} className="table-row admin-row" style={{alignItems:'start'}}>
                  <div>{it.name}</div>
                  <div>{it.email}</div>
                  <div>{it.role}</div>
                  <div>{it.experience}</div>
                  <div style={{maxWidth:180}}>{it.availability}</div>
                  <div>
                    {ed ? (
                      <select value={ed.status} onChange={e=>changeEdit(it.id,'status',e.target.value)}>
                        {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <div style={{fontWeight:700}}>{it.status || '—'}</div>
                    )}
                  </div>
                  <div>
                    {ed ? (
                      <div style={{display:'flex',gap:8}}>
                        <input type="date" value={ed.meetingDate} onChange={e=>changeEdit(it.id,'meetingDate',e.target.value)} />
                        <input type="time" value={ed.meetingTime} onChange={e=>changeEdit(it.id,'meetingTime',e.target.value)} />
                      </div>
                    ) : (
                      <div>{meetingDisplay}</div>
                    )}
                    <div style={{marginTop:6}}>
                      {ed ? (
                        <input placeholder="Meeting link" style={{width:220}} value={ed.meetingLink} onChange={e=>changeEdit(it.id,'meetingLink',e.target.value)} />
                      ) : (
                        it.meetingLink ? <a href={it.meetingLink} target="_blank" rel="noreferrer">Join</a> : '—'
                      )}
                    </div>
                  </div>
                  <div>
                    {ed ? (
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>saveEdit(it.id)} disabled={!ed.dirty || isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
                        <button onClick={()=>cancelEdit(it.id)} disabled={isUpdating}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>startEdit(it)}>Edit</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
