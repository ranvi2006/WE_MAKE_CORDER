import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminCounseling(){
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState({}) // { [id]: {status, notes, dirty} }
  const [updatingIds, setUpdatingIds] = useState(new Set())

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    client.get('/api/admin/counseling')
      .then(res => {
        if(!mounted) return
        const data = Array.isArray(res.data) ? res.data : (res.data?.requests || [])
        setRequests(data)
      })
      .catch(err => {
        if(!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load counseling requests')
      })
      .finally(()=> mounted && setLoading(false))

    return ()=>{ mounted = false }
  }, [])

  function startEdit(item){
    setEditing(prev => ({ ...prev, [item.id]: { status: item.status ?? '', notes: item.notes ?? '', dirty: false }}))
  }

  function changeEdit(id, field, value){
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value, dirty: true }}))
  }

  async function saveEdit(id){
    const ed = editing[id]
    if(!ed) return
    const payload = { status: ed.status, notes: ed.notes }
    setUpdatingIds(prev => new Set(prev).add(id))
    try{
      const res = await client.put(`/api/admin/counseling/${id}`, payload)
      // update local requests list
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...res.data, status: res.data.status ?? ed.status, notes: res.data.notes ?? ed.notes } : r))
      setEditing(prev => ({ ...prev, [id]: { ...prev[id], dirty: false }}))
    }catch(err){
      // show error inline
      console.error('Save failed', err)
      setError(err?.response?.data?.message || err.message || 'Failed to save')
    }finally{
      setUpdatingIds(prev => { const copy = new Set(prev); copy.delete(id); return copy })
    }
  }

  function cancelEdit(id){
    setEditing(prev => { const copy = { ...prev }; delete copy[id]; return copy })
  }

  const statusOptions = ['new','in_progress','scheduled','completed','closed']

  return (
    <section>
      <div className="card">
        <h2>Counseling Requests</h2>
        <p className="muted">Manage counseling requests submitted by users.</p>

        {loading && <p className="muted">Loading requests…</p>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div>
            <div className="admin-table">
              <div className="table-head admin-row">
                <div>Name</div>
                <div>Email</div>
                <div>Goal</div>
                <div>Message</div>
                <div>Status</div>
                <div>Created At</div>
                <div>Notes</div>
                <div></div>
              </div>

              {requests.map(item => {
                const ed = editing[item.id]
                const isUpdating = updatingIds.has(item.id)
                return (
                  <div key={item.id} className="table-row admin-row" style={{alignItems:'start'}}>
                    <div>{item.name}</div>
                    <div>{item.email}</div>
                    <div style={{maxWidth:160}}>{item.goal}</div>
                    <div style={{maxWidth:220}}>{item.message}</div>
                    <div>
                      {ed ? (
                        <select value={ed.status} onChange={e=>changeEdit(item.id,'status',e.target.value)}>
                          {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <div style={{fontWeight:700}}>{item.status || '—'}</div>
                      )}
                    </div>
                    <div>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</div>
                    <div>
                      {ed ? (
                        <textarea value={ed.notes} onChange={e=>changeEdit(item.id,'notes',e.target.value)} rows={2} style={{width:220}} />
                      ) : (
                        <div style={{maxWidth:220}}>{item.notes}</div>
                      )}
                    </div>
                    <div>
                      {ed ? (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn" onClick={()=>saveEdit(item.id)} disabled={!ed.dirty || isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
                          <button onClick={()=>cancelEdit(item.id)} disabled={isUpdating}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn" onClick={()=>startEdit(item)}>Edit</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
