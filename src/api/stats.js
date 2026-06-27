import { supabase } from './supabase'

export const getCommunityStats = async () => {
  try {
    const { count: postsCount } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })

    const { count: reactionsCount } = await supabase
      .from('reactions')
      .select('id', { count: 'exact', head: true })

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: activeWeek } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('updated_at', weekAgo)

    return {
      connections: reactionsCount || 0,
      requests: postsCount || 0,
      activeThisWeek: activeWeek || 0,
    }
  } catch (e) {
    console.warn('Error fetching community stats:', e)
    return { connections: 0, requests: 0, activeThisWeek: 0 }
  }
}

export const getAdminStats = async () => {
  try {
    const base = await getCommunityStats()

    const { count: usersTotal } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    const { data: byDept } = await supabase.from('profiles').select('city')
    const deptCount = {}
    ;(byDept || []).forEach(p => { if (p.city) deptCount[p.city] = (deptCount[p.city] || 0) + 1 })
    const topDepartments = Object.entries(deptCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

    const { data: byDomain } = await supabase.from('profiles').select('email_domain, email')
    const domainCount = {}
    ;(byDomain || []).forEach(p => {
      const d = p.email_domain || (p.email ? '@' + p.email.split('@')[1] : null)
      if (d) domainCount[d] = (domainCount[d] || 0) + 1
    })
    const topDomains = Object.entries(domainCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

    return { ...base, usersTotal: usersTotal || 0, topDepartments, topDomains }
  } catch (e) {
    console.warn('Error fetching admin stats:', e)
    return { connections: 0, requests: 0, activeThisWeek: 0, usersTotal: 0, topDepartments: [], topDomains: [] }
  }
}
