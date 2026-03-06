import { useApp } from '../../context/AppContext';
import type { AwardsState } from '../../types';
import './AwardsView.css';

const AWARD_CATEGORIES: { key: keyof AwardsState; label: string; icon: string }[] = [
    { key: 'goldenBall', label: 'Golden Ball (MVP)', icon: '🏆' },
    { key: 'silverBall', label: 'Silver Ball', icon: '🥈' },
    { key: 'bronzeBall', label: 'Bronze Ball', icon: '🥉' },
    { key: 'goldenBoot', label: 'Golden Boot (Top Scorer)', icon: '⚽' },
    { key: 'silverBoot', label: 'Silver Boot', icon: '👟' },
    { key: 'bronzeBoot', label: 'Bronze Boot', icon: '👞' },
    { key: 'goldenGlove', label: 'Golden Glove (Best GK)', icon: '🧤' },
    { key: 'fifaYoungPlayer', label: 'Young Player Award', icon: '⭐' },
    { key: 'mostYellowCards', label: 'Most Yellow Cards (Player)', icon: '🟨' },
    { key: 'mostRedCards', label: 'Most Red Cards (Player)', icon: '🟥' },
    { key: 'fifaFairPlay', label: 'Fair Play Award (Team)', icon: '🤝' },
];

export const AwardsView: React.FC = () => {
    const { state, updateAward } = useApp();
    const { awards } = state;

    return (
        <div className="awards-view fade-in">
            <header className="awards-header glass-panel">
                <h2 className="text-gradient">Tournament Awards Forecast</h2>
                <p>Predict who will take home the individual and team accolades at the World Cup.</p>
            </header>

            <div className="awards-grid">
                {AWARD_CATEGORIES.map(({ key, label, icon }) => (
                    <div key={key} className="award-card glass-panel">
                        <div className="award-icon">{icon}</div>
                        <div className="award-info">
                            <label htmlFor={`award-${key}`} className="award-label">
                                {label}
                            </label>
                            <input
                                id={`award-${key}`}
                                type="text"
                                className="award-input"
                                placeholder={`Who wins the ${label}?`}
                                value={awards[key] || ''}
                                onChange={(e) => updateAward(key, e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
