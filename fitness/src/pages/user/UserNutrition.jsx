import { useState } from 'react';

export default function UserNutrition() {
  const [meals, setMeals] = useState([
    { id: 1, type: 'Breakfast', name: 'Oatmeal & Berries', calories: 350, protein: 12, carbs: 60, fat: 6 },
    { id: 2, type: 'Lunch', name: 'Chicken Salad', calories: 450, protein: 35, carbs: 20, fat: 22 },
  ]);
  const [newMeal, setNewMeal] = useState({ type: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '' });

  const addMeal = (e) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.calories) return;
    setMeals([...meals, { ...newMeal, id: Date.now(), calories: Number(newMeal.calories), protein: Number(newMeal.protein) || 0, carbs: Number(newMeal.carbs) || 0, fat: Number(newMeal.fat) || 0 }]);
    setNewMeal({ type: 'Breakfast', name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="section-heading">Nutrition Tracking</div>
          <div className="section-sub">Log your meals and track macros</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'var(--primary)12' }}>🔥</div>
          <div><div className="mini-label">Calories</div><div className="mini-value" style={{ color: 'var(--primary)' }}>{totalCalories}</div><div style={{ fontSize: '.7rem', color: 'var(--outline)' }}>kcal</div></div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'var(--secondary)12' }}>🥩</div>
          <div><div className="mini-label">Protein</div><div className="mini-value" style={{ color: 'var(--secondary)' }}>{totalProtein}</div><div style={{ fontSize: '.7rem', color: 'var(--outline)' }}>grams</div></div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'var(--tertiary)12' }}>🍚</div>
          <div><div className="mini-label">Carbs</div><div className="mini-value" style={{ color: 'var(--tertiary)' }}>{totalCarbs}</div><div style={{ fontSize: '.7rem', color: 'var(--outline)' }}>grams</div></div>
        </div>
        <div className="stat-mini">
          <div className="icon-wrap" style={{ background: 'var(--success)12' }}>🥑</div>
          <div><div className="mini-label">Fat</div><div className="mini-value" style={{ color: 'var(--success)' }}>{totalFat}</div><div style={{ fontSize: '.7rem', color: 'var(--outline)' }}>grams</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Meal List */}
        <div className="tonal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'Manrope,sans-serif', fontSize: '1.2rem' }}>Today's Meals</h3>
          {meals.length === 0 ? (
            <div className="empty-state"><div className="icon">🍽️</div><p>No meals logged today</p></div>
          ) : (
            meals.map(m => (
              <div key={m.id} className="tonal-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="role-pill coach" style={{ marginBottom: '.5rem', display: 'inline-block' }}>{m.type}</span>
                  <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--on-surface-variant)' }}>
                    P: {m.protein}g | C: {m.carbs}g | F: {m.fat}g
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                  {m.calories} <span style={{ fontSize: '.7rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>kcal</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Meal Form */}
        <div className="form-card" style={{ height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>
            <div style={{ width: 4, height: '1.2rem', background: 'linear-gradient(135deg,var(--secondary),var(--primary))', borderRadius: 2, display: 'inline-block', marginRight: '.5rem' }} />
            Log a Meal
          </h3>
          <form onSubmit={addMeal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="field-label">Meal Type</label>
              <select className="field-input" value={newMeal.type} onChange={e => setNewMeal({ ...newMeal, type: e.target.value })}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="field-label">Meal Name</label>
              <input className="field-input" placeholder="e.g. Avocado Toast" value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} required />
            </div>
            <div>
              <label className="field-label">Calories</label>
              <input type="number" className="field-input" placeholder="Total kcal" value={newMeal.calories} onChange={e => setNewMeal({ ...newMeal, calories: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
              <div>
                <label className="field-label">Protein (g)</label>
                <input type="number" className="field-input" placeholder="0" value={newMeal.protein} onChange={e => setNewMeal({ ...newMeal, protein: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Carbs (g)</label>
                <input type="number" className="field-input" placeholder="0" value={newMeal.carbs} onChange={e => setNewMeal({ ...newMeal, carbs: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Fat (g)</label>
                <input type="number" className="field-input" placeholder="0" value={newMeal.fat} onChange={e => setNewMeal({ ...newMeal, fat: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '.5rem' }}>Log Meal ➕</button>
          </form>
        </div>
      </div>
    </div>
  );
}
