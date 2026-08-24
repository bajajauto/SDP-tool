export interface ChecklistSection {
  heading: string;
  items: { id: string; text: string }[];
}

export const growthChecklist: ChecklistSection[] = [
  {
    heading: '1. Before the Conversation',
    items: [
      { id: 'before-1', text: 'I have set aside quiet time to reflect before this meeting, I am not rushing straight from another task.' },
      { id: 'before-2', text: 'I have written down 2-3 specific moments from the past few months where I felt I did my best work.' },
      { id: 'before-3', text: 'I have written down 1-2 moments where things did not go as planned, and what I learned from each one.' },
      { id: 'before-4', text: 'I have thought honestly about what kind of support I actually need, not just what sounds good to ask for.' },
      { id: 'before-5', text: 'I have asked myself: am I going into this wanting to be heard, or wanting to grow?' },
    ],
  },
  {
    heading: '2. Checking My Blind Spots',
    items: [
      { id: 'blind-1', text: 'I am not only thinking about the last few weeks. I have looked at the full shape of my work.' },
      { id: 'blind-2', text: 'I have prepared to share context for my goals and reflections, not assume that my manager would know the full extent.' },
      { id: 'blind-3', text: 'I am actively considering if I am comparing myself to colleagues as I discuss my growth, and not my own goals and previous progress.' },
      { id: 'blind-4', text: 'I have asked myself honestly if I am downplaying my wins, or glossing over the places I have genuinely struggled.' },
    ],
  },
  {
    heading: '3. What to Bring Up',
    items: [
      { id: 'bringup-1', text: 'I have one clear question I want to ask about where I am headed and I have written it down before the meeting.' },
      { id: 'bringup-2', text: 'I have thought about the skills I want to build, not just the proficiency or level I want to reach.' },
      { id: 'bringup-3', text: 'I have been honest with myself about what has been holding me back, so I can name it out loud.' },
      { id: 'bringup-4', text: 'I have thought about what growth means to me right now, even if it may be different from what my manager assumes.' },
      { id: 'bringup-5', text: 'I have reflected on what is working well in the way my manager and I communicate, and what I would like to see more of going forward.' },
    ],
  },
  {
    heading: '4. During the Conversation',
    items: [
      { id: 'during-1', text: 'I have reminded myself to listen more than I speak.' },
      { id: 'during-2', text: 'I have given myself permission to say: "I would like to think about that before I answer."' },
      { id: 'during-3', text: 'I am open to asking follow-up questions to understand more deeply, not to argue or justify myself.' },
    ],
  },
  {
    heading: '5. After the Conversation',
    items: [
      { id: 'after-1', text: 'I have written down the key things that were said, before the clarity fades.' },
      { id: 'after-2', text: 'I have identified one concrete action I will take before we next meet.' },
      { id: 'after-3', text: 'I have asked myself honestly: did I show up the way I wanted to?' },
      { id: 'after-4', text: 'I have noted anything that felt unresolved, so I can bring it up next time.' },
    ],
  },
];

export interface FaqSection {
  heading: string;
  questions: { q: string; a: string }[];
}

export const faq: FaqSection[] = [
  {
    heading: 'About the SDP',
    questions: [
      { q: 'How is the SDP different from what we have done before?', a: 'Previous processes focused primarily on performance targets, KRAs, and business outcomes. The SDP is entirely about your personal development. It is employee-owned and the quality of it depends entirely on how honestly you engage with it.' },
      { q: 'Who is responsible for my development plan?', a: 'You are. Your manager, the organisation, and development champions can provide support, guidance, and resources, but the ownership of your reflection, goals, and growth journey remains with you.' },
      { q: 'What mindset should I bring to this exercise?', a: 'Approach it with curiosity, honesty, and ownership. This is an opportunity to better understand yourself, identify meaningful areas for growth, and create a development plan that genuinely supports the professional you want to become.' },
      { q: 'Can my manager see my reflection answers?', a: 'Your reflection responses remain private and in draft mode until you choose to share them. You may share either your full reflection and goals or only the development goals and action plan during your growth conversation.' },
      { q: 'What support is available to help me?', a: 'You have access to an SDP workbook with reflection questions and goal-setting frameworks, good versus weak answer examples for questions, a goal-setting guide, and a growth conversation checklist. Your manager is also available to support you through the process.' },
    ],
  },
  {
    heading: 'About the Reflection',
    questions: [
      { q: 'How much time should I set aside for this exercise?', a: 'Set aside at least 30 uninterrupted minutes in a quiet and comfortable space where you will not be disturbed. All responses on the tool are automatically saved, so you can return to your reflection at any time and continue where you left off.' },
      { q: 'What should I do if I feel stuck or uncomfortable while reflecting?', a: 'Feeling stuck or uncomfortable is a normal part of reflection. Often, the thoughts and questions that are hardest to explore provide the most valuable insights. Give yourself time and continue exploring those areas thoughtfully.' },
      { q: 'How specific should my answers be?', a: 'Be as specific as possible. Instead of making broad statements, think about real situations, experiences, and moments. Specific examples lead to clearer insights and more meaningful development goals.' },
      { q: 'How can I get more value from my responses?', a: 'Try reviewing each answer as if you were advising a colleague. Ask yourself: what advice would I give them? What might they be avoiding? What important point remains unsaid?' },
    ],
  },
  {
    heading: 'About Development Goals',
    questions: [
      { q: 'What is the difference between a functional, behavioural, and leadership goal?', a: 'A functional goal is about building a specific skill or knowledge area in your field of work. A behavioural goal is about how you show up and work with people. A leadership goal is about how you influence, develop, and create clarity for others.' },
      { q: 'What is the difference between a development goal and a KRA?', a: 'A development goal focuses on building capabilities, behaviours, skills, or mindsets that support your long-term growth. A KRA focuses on business deliverables or performance outcomes.' },
      { q: 'What if I do not know what my development goals should be?', a: 'That is exactly what the reflection is for. Go through the questions honestly and read your answers back. The goal usually becomes visible in the gap between who you are today and who you want to become.' },
      { q: 'How do I identify the right development goal?', a: 'Look for the common thread across your reflection responses. The development goal should emerge naturally from the patterns you observe rather than being chosen independently of your reflections.' },
    ],
  },
  {
    heading: 'The Manager Conversation',
    questions: [
      { q: 'What role does my manager play in the SDP?', a: 'Your manager is a development partner, not an evaluator. Their role is to listen to the goals you share, align on what support they can provide, and commit to specific actions that will help you grow.' },
      { q: 'What happens during the growth conversation with my manager?', a: 'The growth conversation is a structured discussion where you walk your manager through the development goals you want to share, discuss what support or opportunities you need, and agree on a concrete action plan together.' },
    ],
  },
  {
    heading: 'The Timeline',
    questions: [
      { q: 'What is the timeline for the SDP cycle?', a: 'The cycle begins with an annual reflection and goal-setting at the start of the year. A quarterly pulse check follows to help you stay honest with yourself about progress. A mid-year review with your manager allows for adjustments if needed. A year-end assessment closes the cycle and feeds into the next year’s plan.' },
    ],
  },
];
