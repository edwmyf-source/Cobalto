import { supabase } from './supabase'

export const getCommunityStats = async () => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [
      { count: postsCount },
      { count: reactionsCount },
      { count: commentsCount },
      { count: activeWeek },
      { count: membersCount },
    ] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('reactions').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', weekAgo),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ])

    // Interacciones = todo lo que la comunidad "hace", no solo cuánta gente
    // hay. NO se incluyen los mensajes de chat a propósito: su política RLS
    // solo deja leerlos a los participantes de cada conversación, así que un
    // visitante sin sesión (que es justamente quien ve la pantalla de
    // bienvenida) siempre contaría 0 y el total saldría mal.
    const interactions = (postsCount || 0) + (reactionsCount || 0) + (commentsCount || 0)

    // Empresas y ciudades distintas: se cuentan en la base de datos (devuelve
    // un solo número) en vez de traer todas las filas de profiles al navegador.
    const { data: distinct } = await supabase.rpc('community_distinct_counts')
    const companies = distinct?.[0]?.companies || 0
    const cities = distinct?.[0]?.cities || 0

    return {
      connections: reactionsCount || 0,
      requests: postsCount || 0,
      posts: postsCount || 0,
      comments: commentsCount || 0,
      members: membersCount || 0,
      activeThisWeek: activeWeek || 0,
      companies,
      cities,
      interactions,
    }
  } catch (e) {
    console.warn('Error fetching community stats:', e)
    return { connections: 0, requests: 0, posts: 0, comments: 0, members: 0, activeThisWeek: 0, companies: 0, cities: 0, interactions: 0 }
  }
}

export const getAdminStats = async () => {
  try {
    const base = await getCommunityStats()

    const { count: usersTotal } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    const [{ data: deptRows }, { data: domainRows }] = await Promise.all([
      supabase.rpc('top_departments', { lim: 5 }),
      supabase.rpc('top_domains', { lim: 5 }),
    ])
    const topDepartments = (deptRows || []).map(r => ({ name: r.name, count: Number(r.count) }))
    const topDomains = (domainRows || []).map(r => ({ name: r.name, count: Number(r.count) }))

    return { ...base, usersTotal: usersTotal || 0, topDepartments, topDomains }
  } catch (e) {
    console.warn('Error fetching admin stats:', e)
    return { connections: 0, requests: 0, activeThisWeek: 0, usersTotal: 0, topDepartments: [], topDomains: [] }
  }
}
