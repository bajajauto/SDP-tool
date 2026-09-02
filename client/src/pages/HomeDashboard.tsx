import { Link } from 'react-router-dom';
import type { Role } from '@sdp/shared';
import { useSdp } from '../state/SdpContext';
import teamIcon from '../assets/team.png';

export function HomeDashboard({ roles }: { roles: Role[] }) {
  const { state } = useSdp();
  const reflectionComplete = (state.reflection.q1Words.length > 0 || state.reflection.q1Text.trim().length > 0)
    && [state.reflection.q2Text, state.reflection.q3Text, state.reflection.q4Text, state.reflection.q5Text, state.reflection.q6Text].every((answer) => answer.trim().length >= 80);
  const goalsComplete = state.goals.length >= 2 && state.goals.every((goal) => goal.title && goal.domain && goal.whyItMatters && goal.grownWhen && goal.actionDo && goal.actionLearn && goal.actionConnect && goal.supportNeeded);
  const submitted = state.status !== 'NOT_STARTED' && state.status !== 'DRAFT';
  const conversationComplete = !!state.conversationConfirmedAt;
  const reflectionDone = reflectionComplete || submitted;
  const goalsDone = goalsComplete || submitted;

  const journey = [
    { title: 'Self Reflection', detail: 'Reflect on who you are and who you want to become', to: '/reflect', done: reflectionDone, available: true },
    { title: 'Development Goals', detail: 'Set 2-3 meaningful goals and build your action plan', to: '/goals', done: goalsDone, available: reflectionDone },
    { title: 'Review and Submit', detail: 'Review your SDP and choose what to share', to: '/submit', done: submitted, available: goalsDone },
    { title: 'Growth Conversation', detail: 'Prepare, meet your manager, and confirm the conversation', to: '/growth-conversation', done: conversationComplete, available: submitted },
    { title: 'Manager Feedback', detail: 'Receive feedback on your submitted development plan', to: '/manager-feedback', done: false, available: conversationComplete },
  ];
  const currentIndex = journey.findIndex((step) => step.available && !step.done);
  const nextStep = journey[currentIndex];
  const completedCount = journey.filter((step) => step.done).length;

  return <div className="screen-inner wide home-dashboard">
    <div className="home-dashboard-heading"><div><h1 className="page-title">Your SDP workspace</h1><p className="page-sub">See where you are and continue from the next step.</p></div></div>

    {nextStep && <section className="next-step-card" aria-label="Your next step">
      <div className="next-step-marker">{currentIndex + 1}</div>
      <div className="next-step-copy"><small>Your next step &middot; {completedCount} of {journey.length} complete</small><h2>{nextStep.title}</h2><p>{nextStep.detail}</p></div>
      <Link to={nextStep.to} className="btn btn-primary">Continue &rarr;</Link>
    </section>}

    {roles.includes('MANAGER') && <div className="workspace-tiles">
      <section className="workspace-tile manager-tile manager-workspace-card"><span className="workspace-tile-icon team-workspace-icon"><img src={teamIcon} alt="" aria-hidden="true" /></span><div className="manager-workspace-copy"><small>For your team</small><h2>Submit feedback for your team</h2><p>Review submitted plans and share thoughtful, actionable feedback.</p></div><Link to="/team" className="btn manager-team-action">View my team &rarr;</Link></section>
    </div>}

    <div className="journey-title">Journey steps</div>
    <section className="journey-status-card">
      {journey.map((step, index) => {
        const current = index === currentIndex;
        const status = step.title === 'Manager Feedback' && step.available
          ? 'Awaited'
          : step.done ? 'Submitted' : current ? 'In progress' : step.available ? 'Ready' : 'Locked';
        return <div className={`journey-status-row${step.done ? ' done' : ''}${current ? ' current' : ''}${!step.available ? ' locked' : ''}`} key={step.title}>
          <div className="journey-marker">{step.done ? '✓' : index + 1}</div>
          <div className="journey-copy"><h3>{step.title}</h3><p>{step.detail}</p></div>
          <span className={`journey-status ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
          {step.available ? <Link to={step.to}>{step.done ? 'View' : 'Open'} &rarr;</Link> : <span className="journey-locked">&#128274;</span>}
        </div>;
      })}
    </section>
  </div>;
}
