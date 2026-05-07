import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const hierarchy = [
  { role:'Admin',   icon:'📊', color:'#0040df', desc:'Full system control · Creates Staff' },
  { role:'Staff',   icon:'🧑‍💼', color:'#4959a3', desc:'Creates Coaches · Oversees operations' },
  { role:'Coach',   icon:'🏋️', color:'#993100', desc:'Guides Athletes · Assigns workout plans' },
  { role:'Athlete', icon:'🏃', color:'#2e7d32', desc:'Logs workouts · Tracks personal goals' },
];

const features = [
  { icon:'💪', title:'Workout Tracking',    desc:'Log every exercise, set, rep and weight with precision.' },
  { icon:'🎯', title:'Goal Setting',        desc:'Visual milestones and progress tracking for every goal.' },
  { icon:'📊', title:'Analytics Engine',    desc:'Beautiful charts for weekly and monthly performance stats.' },
  { icon:'🏋️', title:'Coach Integration',   desc:'Get assigned to a personal coach who guides your journey.' },
  { icon:'🧑‍💼', title:'Staff Management',    desc:'Staff create and oversee coaches across the organization.' },
  { icon:'🛠️', title:'Admin Control',        desc:'Full executive view of the entire fitness hierarchy.' },
];

export default function Home() {
  const { user } = useAuth();
  const dashLink = user
    ? (user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : user.role === 'coach' ? '/coach' : '/dashboard')
    : null;

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar-pub">
        <a href="/" className="navbar-brand">Kinetic <span>Pro</span></a>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          {user ? (
            <Link to={dashLink} className="btn-primary" style={{ textDecoration:'none' }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ textDecoration:'none' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration:'none' }}>Get Started →</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-orb" style={{ top:'-20%', right:'-10%', width:600, height:600 }} />
        <div className="hero-orb" style={{ bottom:'-20%', left:'-10%', width:400, height:400, background:'radial-gradient(circle, rgba(73,89,163,.08), transparent 70%)' }} />
        <div className="container" style={{ position:'relative', zIndex:1, padding:'0 3rem', width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-block', background:'rgba(0,64,223,.08)', color:'var(--primary)', padding:'.35rem 1rem', borderRadius:99, fontSize:'.78rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:'1.5rem' }}>
                🔥 Role-Based Fitness SaaS
              </div>
              <h1 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'clamp(3rem,6vw,5rem)', lineHeight:.95, letterSpacing:'-2px', marginBottom:'1.5rem', color:'var(--on-surface)' }}>
                The Performance<br/>
                <span style={{ color:'var(--primary)' }}>Engine</span> for<br/>
                Elite Teams
              </h1>
              <p style={{ fontSize:'1.05rem', color:'var(--on-surface-variant)', lineHeight:1.75, maxWidth:440, marginBottom:'2rem' }}>
                A structured 4-role hierarchy — Admin, Staff, Coach, and Athlete — built for serious fitness organizations.
              </p>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                {user ? (
                  <Link to={dashLink} className="btn-primary" style={{ textDecoration:'none', fontSize:'1rem', padding:'.85rem 2rem' }}>
                    Open Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary" style={{ textDecoration:'none', fontSize:'1rem', padding:'.85rem 2rem' }}>
                      Join as Athlete →
                    </Link>
                    <Link to="/login" className="btn-secondary" style={{ textDecoration:'none', fontSize:'1rem', padding:'.85rem 2rem' }}>
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
              {hierarchy.map((r, i) => (
                <div key={r.role} className="floating-card">
                  <div style={{ width:44, height:44, borderRadius:12, background:`${r.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                    {r.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'.95rem', color:r.color }}>{r.role}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--on-surface-variant)', marginTop:2 }}>{r.desc}</div>
                  </div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2rem', color:`${r.color}20`, lineHeight:1 }}>0{i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background:'var(--surface-container-low)', borderTop:'1px solid var(--outline-variant)', borderBottom:'1px solid var(--outline-variant)', padding:'2.5rem 3rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          {[['10K+','Active Athletes'],['500K+','Workouts Logged'],['4','Role Hierarchy'],['99.9%','Uptime SLA']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2.5rem', letterSpacing:'-1px', color:'var(--primary)' }}>{v}</div>
              <div style={{ fontSize:'.78rem', fontWeight:600, color:'var(--on-surface-variant)', textTransform:'uppercase', letterSpacing:'1px', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'6rem 3rem', background:'var(--background)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <div style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--outline)', marginBottom:'.75rem' }}>Platform Features</div>
            <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2.5rem', letterSpacing:'-1px' }}>Built for the Entire Hierarchy</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem' }}>
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3 style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:'1rem', marginBottom:'.5rem' }}>{f.title}</h3>
                <p style={{ fontSize:'.875rem', color:'var(--on-surface-variant)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'5rem 3rem', background:'var(--surface-container-low)', borderTop:'1px solid var(--outline-variant)' }}>
        <div style={{ maxWidth:560, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:'2.5rem', letterSpacing:'-1px', marginBottom:'1rem' }}>Ready to Level Up?</h2>
          <p style={{ color:'var(--on-surface-variant)', lineHeight:1.7, marginBottom:'2rem' }}>
            Register as an athlete and get matched with a coach who will push you beyond your limits.
          </p>
          {!user && (
            <Link to="/register" className="btn-primary" style={{ textDecoration:'none', fontSize:'1rem', padding:'1rem 2.5rem' }}>
              Create Free Account →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'var(--inverse-surface)', padding:'2rem 3rem', textAlign:'center' }}>
        <div style={{ color:'#4b5563', fontSize:'.82rem', letterSpacing:'1px', textTransform:'uppercase', fontFamily:'Inter,sans-serif' }}>
          © 2025 Kinetic Pro · Fitness Hierarchy SaaS
        </div>
      </footer>
    </div>
  );
}
