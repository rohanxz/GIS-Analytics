import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Treemap, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ClimbingBoxLoader } from 'react-spinners';

// --- Helper constant for colors ---
const categoryInfo = {
    Tickets: { icon: '🎟️', color: '#8ab4f8' },
    Food: { icon: '🍔', color: '#fdd663' },
    Attraction: { icon: '🏛️', color: '#c58af9' },
    Shopping: { icon: '🛍️', color: '#ff8bcb' },
    Transport: { icon: '🚇', color: '#54d2d2' },
    Default: { icon: '💰', color: '#aab0b8' }
};
const COLORS = Object.values(categoryInfo).map(c => c.color);

// --- Custom Tooltip for Charts ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="label">{`${label}`}</p>
                {payload.map((p, i) => (
                     <p key={i} className="intro" style={{color: p.color || p.fill}}>{`${p.name}: $${p.value.toFixed(2)}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom component for Treemap to have different colors
const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
      >
        {name}
      </text>
    </g>
  );
};


// --- Main Component ---
const BudgetDashboardView = ({ payload }) => {
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/itinerary');
                const itineraryData = await response.json();
                
                const allActivities = itineraryData.itinerary.flatMap(day => day.activities);

                // --- Calculations ---
                const totalCost = allActivities.reduce((sum, act) => sum + (act.cost?.estimatedAmount || 0), 0);

                const costsByCategory = allActivities.reduce((acc, act) => {
                    const category = act.cost?.category || 'Default';
                    const amount = act.cost?.estimatedAmount || 0;
                    if (!acc[category]) {
                        acc[category] = { name: category, value: 0, size: 0 };
                    }
                    acc[category].value += amount;
                    acc[category].size += amount; // For Treemap
                    return acc;
                }, {});

                const costsByDay = itineraryData.itinerary.map(day => {
                    const dayTotal = day.activities.reduce((sum, act) => sum + (act.cost?.estimatedAmount || 0), 0);
                    return { name: `Day ${day.day}`, value: dayTotal };
                });
                
                const maxDailySpend = Math.max(...costsByDay.map(d => d.value), 0);
                const radarData = costsByDay.map(day => ({
                    subject: day.name,
                    cost: day.value,
                    fullMark: maxDailySpend * 1.1 
                }));

                const topExpensiveActivities = [...allActivities]
                    .sort((a, b) => (b.cost?.estimatedAmount || 0) - (a.cost?.estimatedAmount || 0))
                    .slice(0, 5)
                    .map(act => ({ name: act.name, value: act.cost?.estimatedAmount || 0 }));
                
                let cumulativeTotal = 0;
                const cumulativeSpend = costsByDay.map(day => {
                    cumulativeTotal += day.value;
                    return { name: day.name, value: cumulativeTotal };
                });

                setBudgetData({
                    totalCost,
                    costsByCategory: Object.values(costsByCategory),
                    costsByDay,
                    radarData,
                    topExpensiveActivities,
                    cumulativeSpend,
                    currency: 'SGD'
                });

            } catch (error) {
                console.error("Failed to fetch or process budget data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessData();
    }, []);

    if (loading) {
        return <div className="main-spinner-container"><ClimbingBoxLoader color="#ff4081" /></div>;
    }

    if (!budgetData) {
        return <div>Could not load budget data.</div>;
    }

    const { totalCost, costsByCategory, radarData, topExpensiveActivities, cumulativeSpend, currency } = budgetData;

    return (
        <div className="budget-dashboard-view">
            <div className="dashboard-card full-width" style={{ animation: 'card-fade-in 0.5s ease 0.1s forwards' }}>
                 <h3>Daily Spending Overview</h3>
                 <ResponsiveContainer width="100%" height={350}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)"/>
                        <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)"/>
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} stroke="var(--text-secondary)"/>
                        <Radar name="Spend" dataKey="cost" stroke="#f06292" fill="#f06292" fillOpacity={0.6} />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="dashboard-card total-cost-card-small" style={{ animation: 'card-fade-in 0.5s ease 0.2s forwards' }}>
                <p>Total Trip Cost</p>
                <h2>${totalCost.toFixed(2)}</h2>
                <span>{currency}</span>
            </div>

            <div className="dashboard-card" style={{ animation: 'card-fade-in 0.5s ease 0.3s forwards' }}>
                <h3>Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={costsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                             {costsByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={categoryInfo[entry.name]?.color || categoryInfo.Default.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="dashboard-card full-width" style={{ animation: 'card-fade-in 0.5s ease 0.4s forwards' }}>
                <h3>Cumulative Spend</h3>
                 <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={cumulativeSpend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                        <XAxis dataKey="name" stroke="var(--text-secondary)"/>
                        <YAxis stroke="var(--text-secondary)"/>
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" name="Total Spend" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard-card" style={{ animation: 'card-fade-in 0.5s ease 0.5s forwards' }}>
                <h3>Top 5 Expenses</h3>
                <ResponsiveContainer width="100%" height={250}>
                     <BarChart data={topExpensiveActivities} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} stroke="var(--text-secondary)" tick={{fontSize: 12}}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Cost" fill="rgba(84, 210, 210, 0.7)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="dashboard-card" style={{ animation: 'card-fade-in 0.5s ease 0.6s forwards' }}>
                <h3>Category Proportions</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                        data={costsByCategory}
                        dataKey="size"
                        ratio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent colors={COLORS} />}
                    >
                    </Treemap>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BudgetDashboardView;

