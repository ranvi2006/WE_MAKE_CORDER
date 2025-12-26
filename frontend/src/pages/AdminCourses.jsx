import { useEffect, useState } from 'react'
import client from '../api/client'

export default function AdminCourses(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newCourse, setNewCourse] = useState({ title:'', description:'', duration:'', level:'Beginner', published:false })
  const [editing, setEditing] = useState({})
  const [updatingIds, setUpdatingIds] = useState(new Set())

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    client.get('/api/admin/courses')
      .then(res => {
        if(!mounted) return
        const data = Array.isArray(res.data) ? res.data : (res.data?.courses || [])
        setCourses(data)
      })
      .catch(err => {
        if(!mounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load courses')
      })
      .finally(()=> mounted && setLoading(false))

    return ()=>{ mounted = false }
  }, [])

  async function createCourse(e){
    e.preventDefault()
    setError('')
    try{
      const res = await client.post('/api/admin/courses', newCourse)
      const created = res.data
      setCourses(prev => [created, ...prev])
      setNewCourse({ title:'', description:'', duration:'', level:'Beginner', published:false })
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Create failed')
    }
  }

  function startEdit(course){
    setEditing(prev => ({ ...prev, [course.id]: { ...course, dirty:false }}))
  }

  function changeEdit(id, field, value){
    setEditing(prev => ({ ...prev, [id]: { ...(prev[id]||{}), [field]: value, dirty:true }}))
  }

  async function saveEdit(id){
    const ed = editing[id]
    if(!ed) return
    const payload = { title: ed.title, description: ed.description, duration: ed.duration, level: ed.level, published: !!ed.published }
    setUpdatingIds(prev => new Set(prev).add(id))
    try{
      const res = await client.put(`/api/admin/courses/${id}`, payload)
      const updated = res.data || {}
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
      setEditing(prev => ({ ...prev, [id]: { ...prev[id], dirty:false }}))
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Save failed')
    }finally{
      setUpdatingIds(prev => { const copy = new Set(prev); copy.delete(id); return copy })
    }
  }

  async function deleteCourse(id){
    if(!confirm('Delete this course?')) return
    setUpdatingIds(prev => new Set(prev).add(id))
    try{
      await client.delete(`/api/admin/courses/${id}`)
      setCourses(prev => prev.filter(c => c.id !== id))
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Delete failed')
    }finally{
      setUpdatingIds(prev => { const copy = new Set(prev); copy.delete(id); return copy })
    }
  }

  async function togglePublished(id, current){
    setUpdatingIds(prev => new Set(prev).add(id))
    try{
      const res = await client.put(`/api/admin/courses/${id}`, { published: !current })
      const updated = res.data || {}
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    }catch(err){
      setError(err?.response?.data?.message || err.message || 'Toggle failed')
    }finally{
      setUpdatingIds(prev => { const copy = new Set(prev); copy.delete(id); return copy })
    }
  }

  return (
    <section>
      <div className="card">
        <h2>Course Management</h2>
        <p className="muted">Create, edit, and delete courses.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={createCourse} style={{marginTop:12,marginBottom:18}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <input placeholder="Title" value={newCourse.title} onChange={e=>setNewCourse({...newCourse, title:e.target.value})} style={{flex:2,minWidth:200}} />
            <input placeholder="Duration" value={newCourse.duration} onChange={e=>setNewCourse({...newCourse, duration:e.target.value})} style={{width:140}} />
            <select value={newCourse.level} onChange={e=>setNewCourse({...newCourse, level:e.target.value})}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <label style={{display:'flex',alignItems:'center',gap:6}}>
              <input type="checkbox" checked={newCourse.published} onChange={e=>setNewCourse({...newCourse, published:e.target.checked})} /> Published
            </label>
            <button className="btn" type="submit">Add Course</button>
          </div>
          <div style={{marginTop:8}}>
            <textarea placeholder="Description" value={newCourse.description} onChange={e=>setNewCourse({...newCourse, description:e.target.value})} style={{width:'100%',minHeight:80,marginTop:8}} />
          </div>
        </form>

        {loading ? (
          <p className="muted">Loading courses…</p>
        ) : (
          <div className="admin-table">
            <div className="table-head admin-row">
              <div>Title</div>
              <div>Duration</div>
              <div>Level</div>
              <div>Published</div>
              <div>Description</div>
              <div></div>
            </div>

            {courses.map(c => {
              const ed = editing[c.id]
              const isUpdating = updatingIds.has(c.id)
              return (
                <div key={c.id} className="table-row admin-row">
                  <div>
                    {ed ? <input value={ed.title} onChange={e=>changeEdit(c.id,'title',e.target.value)} /> : <strong>{c.title}</strong>}
                  </div>
                  <div>{ed ? <input value={ed.duration} onChange={e=>changeEdit(c.id,'duration',e.target.value)} style={{width:120}} /> : c.duration}</div>
                  <div>{ed ? (
                    <select value={ed.level} onChange={e=>changeEdit(c.id,'level',e.target.value)}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  ) : c.level}</div>
                  <div>
                    <label style={{display:'flex',alignItems:'center',gap:6}}>
                      <input type="checkbox" checked={(ed ? !!ed.published : !!c.published)} onChange={e=>{
                        if(ed){ changeEdit(c.id,'published',e.target.checked) }
                        else { togglePublished(c.id, !!c.published) }
                      }} />
                    </label>
                  </div>
                  <div>
                    {ed ? <textarea value={ed.description} onChange={e=>changeEdit(c.id,'description',e.target.value)} style={{minHeight:48}} /> : <div style={{maxWidth:420}}>{c.description}</div>}
                  </div>
                  <div>
                    {ed ? (
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>saveEdit(c.id)} disabled={!ed.dirty || isUpdating}>{isUpdating ? 'Saving...' : 'Save'}</button>
                        <button onClick={()=>setEditing(prev=>{ const copy={...prev}; delete copy[c.id]; return copy })} disabled={isUpdating}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>startEdit(c)}>Edit</button>
                        <button onClick={()=>deleteCourse(c.id)} disabled={isUpdating} style={{background:'#ef4444'}}>Delete</button>
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
