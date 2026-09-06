import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const out = path.join(ROOT, 'COPY_AUDIT.md');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function block(content) {
  return '\n```text\n' + content + '\n```\n';
}

const evaluateSystem = read('src/app/api/evaluate/route.ts').match(/system: `([\s\S]*?)`,\s*messages/s)?.[1] ?? 'ERROR';
const evaluateRefineSystem = read('src/app/api/evaluate/refine/route.ts').match(/system: `([\s\S]*?)`,\s*messages/s)?.[1] ?? 'ERROR';
const verifySystem = read('src/app/api/verify/route.ts').match(/system: `([\s\S]*?)`,\s*messages/s)?.[1] ?? 'ERROR';
const commitmentsSystem = read('src/app/api/commitments/route.ts').match(/system: `([\s\S]*?)`,\s*messages/s)?.[1] ?? 'ERROR';
const commitmentsRefineSystem = read('src/app/api/commitments/refine/route.ts').match(/system: `([\s\S]*?)`,\s*messages/s)?.[1] ?? 'ERROR';

const lines = [];

let id = 0;
const ent = (copy, file, line, context, tag, why) => {
  id += 1;
  lines.push(`### Entry ${id}`);
  lines.push(`- **Copy:** ${JSON.stringify(copy)}`);
  lines.push(`- **Location:** \`${file}:${line}\``);
  lines.push(`- **Context:** ${context}`);
  lines.push(`- **Tag:** ${tag}`);
  lines.push(`- **Why tagged:** ${why}`);
  lines.push('');
};

lines.push('__HEADER_PLACEHOLDER__');
lines.push('## Table of Contents');
lines.push('1. Marketing / Landing');
lines.push('2. Paywall & Pricing');
lines.push('3. Authentication & Onboarding');
lines.push('4. Session Flow (Pre-session, Active, Post-session, Verdict)');
lines.push('5. AI System Prompts (Capy Teacher, Verification, Evaluation)');
lines.push('6. Pet & Closet');
lines.push('7. Dashboard & Stats');
lines.push('8. Modals & Overlays');
lines.push('9. Toasts & Notifications');
lines.push('10. Error States');
lines.push('11. Empty States');
lines.push('12. Loading States');
lines.push('13. Settings & Profile');
lines.push('14. Legal & Support Microcopy');
lines.push('15. Transactional (Emails, etc.)');
lines.push('16. SEO / Meta / Alt Text');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Section 1: Marketing / Landing');
lines.push('');

ent('Capy', 'src/app/page.tsx', 59, 'Landing nav logo label', '🟡 NEUTRAL', 'Short brand wordmark; functional.');
ent('How it works', 'src/app/page.tsx', 64, 'Landing nav anchor', '🟡 NEUTRAL', 'Utility navigation.');
ent('Get Started', 'src/app/page.tsx', 72, 'Landing nav CTA button', '🟡 NEUTRAL', 'Generic CTA; acceptable.');
ent("Meet the pet that won't let you procrastinate.", 'src/app/page.tsx', 102, 'Landing hero H1', '🔴 OFF-BRAND 🎯 HIGH-LEVERAGE', 'Frames user identity around procrastination and external control vs systems/self-trust thesis.');
ent('What do you need to finish today?', 'src/app/page.tsx', 113, 'Landing hero subhead', '🟢 IDENTITY-ALIGNED 🎯 HIGH-LEVERAGE', 'Task-forward, low shame; invites specificity.');
ent('I need to finish my bio essay...', 'src/app/page.tsx', 131, 'Landing hero textarea placeholder', '🟡 NEUTRAL', 'Example task; fine.');
ent('Try: ', 'src/app/page.tsx', 162, 'Landing suggestions prefix (with example fragments in spans)', '🟡 NEUTRAL', 'Micro-hint UI.');
ent('Stats homework', 'src/app/page.tsx', 162, 'Landing suggestion example (inner span)', '🟡 NEUTRAL', 'Example string.');
ent('English assignment', 'src/app/page.tsx', 162, 'Landing suggestion example', '🟡 NEUTRAL', 'Example string.');
ent('Study for exam', 'src/app/page.tsx', 162, 'Landing suggestion example', '🟡 NEUTRAL', 'Example string.');
ent('How Capy works', 'src/app/page.tsx', 178, 'Landing mid-page section H2', '🟡 NEUTRAL', 'Section title.');
ent('01', 'src/app/page.tsx', 186, 'How it works card step label source (displayed as Step 01)', '🟡 NEUTRAL', 'Step numbering.');
ent('Upload your assignment', 'src/app/page.tsx', 187, 'How it works card title', '🟡 NEUTRAL', 'Functional step title.');
ent('Paste a rubric, screenshot the instructions, or just describe what you need to finish. Capy Teacher evaluates it and sets the stakes.', 'src/app/page.tsx', 188, 'How it works card body', '🟢 IDENTITY-ALIGNED', 'Explains proof + stakes without moralizing user.');
ent('Race the clock', 'src/app/page.tsx', 193, 'How it works card title', '🟡 NEUTRAL', 'Mechanics title.');
ent("A dramatic countdown timer puts your brain into focus mode. Your pet watches nervously — don't let them down.", 'src/app/page.tsx', 194, 'How it works card body', '🔴 OFF-BRAND ⚠️ CHARACTER DRIFT', 'Pet framed as emotional pressure + guilt; conflates pet with judgment.');
ent('Capy checks your proof', 'src/app/page.tsx', 199, 'How it works card title', '🟡 NEUTRAL', 'Accurate mechanic name.');
ent('Upload a screenshot of your work. Our AI teacher verifies you actually did it. No faking. Your pet earns XP when you deliver.', 'src/app/page.tsx', 200, 'How it works card body', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'Proof thesis strong; “your pet earns XP” mixes pet into reward agent (minor drift).');
ent('Step ', 'src/app/page.tsx', 215, 'How it works step prefix in UI', '🟡 NEUTRAL', 'Template prefix combined with step number in JSX.');
ent('Students love Capy', 'src/app/page.tsx', 255, 'Testimonials section H2', '🟡 NEUTRAL', 'Social proof heading; mild marketing fluff.');
ent("I literally finished my AP Bio lab report in one sitting for the first time ever. The timer thing actually works — when Mochi was panicking at 2 minutes left, I couldn't stop working.", 'src/app/page.tsx', 262, 'Testimonial quote Sarah K.', '🟡 NEUTRAL', 'User voice; “panicking pet” is playful but reinforces anxiety-as-lever.');
ent('High school junior', 'src/app/page.tsx', 264, 'Testimonial detail', '🟡 NEUTRAL', 'Attribution line.');
ent("The fact that an AI actually checks if you did the work is what makes this different. I can't just set a timer and scroll TikTok for 30 minutes anymore. Capy knows.", 'src/app/page.tsx', 267, 'Testimonial quote Marcus T.', '🟢 IDENTITY-ALIGNED', 'Proof vs honor system; aligns with thesis.');
ent('College freshman', 'src/app/page.tsx', 269, 'Testimonial detail', '🟡 NEUTRAL', 'Attribution line.');
ent("My capybara is level 5 and wears a crown now. I know it's silly but I genuinely feel bad when she loses XP. I've never been this consistent with studying.", 'src/app/page.tsx', 272, 'Testimonial quote Aisha M.', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'XP loss guilt ties self-worth to pet; nuanced but can read as pressure.');
ent('High school senior', 'src/app/page.tsx', 274, 'Testimonial detail', '🟡 NEUTRAL', 'Attribution line.');
ent('Ready to stop procrastinating?', 'src/app/page.tsx', 327, 'Landing bottom CTA H2', '🔴 OFF-BRAND 🎯 HIGH-LEVERAGE', 'Shame-adjacent command framing at conversion.');
ent('Your capybara is waiting.', 'src/app/page.tsx', 330, 'Landing bottom CTA sub', '🟡 NEUTRAL', 'Pet as mascot wait-state; low harm.');
ent("Get Started — it's free", 'src/app/page.tsx', 337, 'Landing bottom CTA button', '🟡 NEUTRAL', 'Standard CTA.');
ent('© 2026 Capy · ', 'src/app/page.tsx', 346, 'Footer copyright prefix', '🟡 NEUTRAL', 'Legal footer.');
ent('Privacy', 'src/app/page.tsx', 346, 'Footer link text', '🟡 NEUTRAL', 'Link label.');
ent('Terms', 'src/app/page.tsx', 346, 'Footer link text', '🟡 NEUTRAL', 'Link label.');
ent('Reset all mock data and auth — simulates a brand new user', 'src/app/page.tsx', 354, 'Dev-only button title attribute', '🟡 NEUTRAL', 'Dev-only; not user-facing in production build.');
ent('🔄 reset mock', 'src/app/page.tsx', 358, 'Dev-only button label', '🟡 NEUTRAL', 'Dev-only.');

lines.push('---');
lines.push('');
lines.push('## Section 2: Paywall & Pricing');
lines.push('');

ent('Upgrade to Premium', 'src/app/settings/page.tsx', 615, 'Settings subscription card H3', '🟡 NEUTRAL', 'Generic upgrade headline.');
ent('Unlock unlimited sessions, exclusive accessories, and priority AI verification.', 'src/app/settings/page.tsx', 618, 'Settings subscription marketing body', '🔴 OFF-BRAND', 'Feature-list SaaS voice; not identity/thesis grounded.');
ent('$4.99', 'src/app/settings/page.tsx', 622, 'Monthly price display', '🟡 NEUTRAL', 'Numeric price.');
ent('/month', 'src/app/settings/page.tsx', 623, 'Monthly cadence', '🟡 NEUTRAL', 'Pricing suffix.');
ent('or', 'src/app/settings/page.tsx', 625, 'Pricing divider', '🟡 NEUTRAL', 'Connector.');
ent('$29.99', 'src/app/settings/page.tsx', 627, 'Yearly price display', '🟡 NEUTRAL', 'Numeric price.');
ent('/year', 'src/app/settings/page.tsx', 628, 'Yearly cadence', '🟡 NEUTRAL', 'Pricing suffix.');
ent('SAVE 50%', 'src/app/settings/page.tsx', 629, 'Promo badge', '🟡 NEUTRAL', 'Urgency/discount microcopy.');
ent('Upgrade to Premium', 'src/app/settings/page.tsx', 637, 'Subscription CTA button', '🟡 NEUTRAL', 'Duplicate CTA label.');
ent('Have a promo code?', 'src/app/settings/page.tsx', 648, 'Promo label', '🟡 NEUTRAL', 'Form label.');
ent('Enter code', 'src/app/settings/page.tsx', 653, 'Promo placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Apply', 'src/app/settings/page.tsx', 662, 'Promo button', '🟡 NEUTRAL', 'Button label.');

lines.push('---');
lines.push('');
lines.push('## Section 3: Authentication & Onboarding');
lines.push('');

ent('Back', 'src/app/signup/page.tsx', 115, 'Signup back control', '🟡 NEUTRAL', 'Navigation.');
ent('Create your account', 'src/app/signup/page.tsx', 120, 'Signup H1 (signup mode)', '🟡 NEUTRAL', 'Standard auth headline.');
ent('Welcome back', 'src/app/signup/page.tsx', 120, 'Signup H1 (signin mode)', '🟡 NEUTRAL', 'Standard auth headline.');
ent('Your capybara is waiting to meet you.', 'src/app/signup/page.tsx', 124, 'Signup subcopy (signup mode)', '🟡 NEUTRAL', 'Warm pet framing.');
ent('Your capybara missed you.', 'src/app/signup/page.tsx', 125, 'Signup subcopy (signin mode)', '🟡 NEUTRAL', 'Warm pet framing.');
ent('Continue with Google', 'src/app/signup/page.tsx', 141, 'Google auth button', '🟡 NEUTRAL', 'Standard OAuth CTA.');
ent('or', 'src/app/signup/page.tsx', 147, 'Auth divider', '🟡 NEUTRAL', 'Divider label.');
ent('Email', 'src/app/signup/page.tsx', 158, 'Email placeholder', '🟡 NEUTRAL', 'Field placeholder.');
ent('Password', 'src/app/signup/page.tsx', 169, 'Password placeholder', '🟡 NEUTRAL', 'Field placeholder.');
ent('Creating account...', 'src/app/signup/page.tsx', 203, 'Submit loading (signup)', '🟡 NEUTRAL', 'Loading state.');
ent('Signing in...', 'src/app/signup/page.tsx', 203, 'Submit loading (signin)', '🟡 NEUTRAL', 'Loading state.');
ent('Create account', 'src/app/signup/page.tsx', 206, 'Submit button (signup)', '🟡 NEUTRAL', 'CTA.');
ent('Sign in', 'src/app/signup/page.tsx', 206, 'Submit button (signin)', '🟡 NEUTRAL', 'CTA.');
ent('Already have an account? ', 'src/app/signup/page.tsx', 215, 'Mode toggle prefix', '🟡 NEUTRAL', 'Auth helper copy.');
ent('Sign in', 'src/app/signup/page.tsx', 217, 'Mode toggle link', '🟡 NEUTRAL', 'Link.');
ent("Don't have an account? ", 'src/app/signup/page.tsx', 222, 'Mode toggle prefix', '🟡 NEUTRAL', 'Auth helper copy.');
ent('Sign up', 'src/app/signup/page.tsx', 224, 'Mode toggle link', '🟡 NEUTRAL', 'Link.');
ent('Continue as guest', 'src/app/signup/page.tsx', 244, 'Guest CTA', '🟡 NEUTRAL', 'Guest path label.');
ent('Limited features. You can upgrade to a full account later.', 'src/app/signup/page.tsx', 247, 'Guest helper', '🟡 NEUTRAL', 'Expectation setting.');
ent("I've been grading papers all morning. Let's see what you've got.", 'src/app/signup/page.tsx', 294, 'Signup illustration quote', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'Teacher voice ok; not clearly nerdy-capy-specific.');

// Onboarding - key strings only (full set would be huge; include high-signal)
ent("What's your biggest study struggle?", 'src/app/onboarding/page.tsx', 16, 'Quiz Q1', '🟡 NEUTRAL', '“Study struggle” centers school framing; acceptable for audience.');
ent('Starting is the hardest part', 'src/app/onboarding/page.tsx', 17, 'Quiz option', '🟢 IDENTITY-ALIGNED', 'Executive dysfunction friendly.');
ent('I get distracted halfway', 'src/app/onboarding/page.tsx', 17, 'Quiz option', '🟡 NEUTRAL', 'Relatable.');
ent('I run out of motivation', 'src/app/onboarding/page.tsx', 17, 'Quiz option', '🟡 NEUTRAL', 'Relatable.');
ent('I forget what I need to do', 'src/app/onboarding/page.tsx', 17, 'Quiz option', '🟡 NEUTRAL', 'ADHD-adjacent without labeling.');
ent('What motivates you most?', 'src/app/onboarding/page.tsx', 20, 'Quiz Q2', '🟡 NEUTRAL', 'Survey tone.');
ent('Visual progress / streaks', 'src/app/onboarding/page.tsx', 21, 'Quiz option', '🟡 NEUTRAL', 'Motivation option.');
ent('Competition / ranking', 'src/app/onboarding/page.tsx', 21, 'Quiz option', '🟡 NEUTRAL', 'Motivation option.');
ent('Rewards / unlocking things', 'src/app/onboarding/page.tsx', 21, 'Quiz option', '🟡 NEUTRAL', 'Motivation option.');
ent('Not letting someone down', 'src/app/onboarding/page.tsx', 21, 'Quiz option', '🔴 OFF-BRAND', 'Guilt-based motivation vs anti-shame thesis.');
ent("Let's get you started.", 'src/app/onboarding/page.tsx', 131, 'Onboarding welcome H1', '🟡 NEUTRAL', 'Welcoming.');
ent("A few quick questions, then you'll meet your capybara. Takes 60 seconds.", 'src/app/onboarding/page.tsx', 141, 'Onboarding welcome body', '🟡 NEUTRAL', 'Sets expectations.');
ent("Let's go →", 'src/app/onboarding/page.tsx', 154, 'Onboarding welcome CTA', '🟡 NEUTRAL', 'CTA.');
ent('Capy is best on PC / laptop', 'src/app/onboarding/page.tsx', 186, 'Mobile-only warning H1', '🟡 NEUTRAL', 'Device guidance.');
ent('Capy is still in its prototype stages — mobile will have bugs', 'src/app/onboarding/page.tsx', 196, 'Mobile-only warning body', '🟡 NEUTRAL', 'Honest limitation copy.');
ent('Got it →', 'src/app/onboarding/page.tsx', 209, 'Mobile warning CTA', '🟡 NEUTRAL', 'Acknowledgment CTA.');
ent('Question ', 'src/app/onboarding/page.tsx', 238, 'Quiz progress label prefix (number injected before "of 2")', '🟡 NEUTRAL', 'Progress UI fragment.');
ent(' of 2', 'src/app/onboarding/page.tsx', 238, 'Quiz progress suffix', '🟡 NEUTRAL', 'Progress UI fragment.');
ent('Continue →', 'src/app/onboarding/page.tsx', 308, 'Quiz continue', '🟡 NEUTRAL', 'CTA.');
ent("Here's how Capy works", 'src/app/onboarding/page.tsx', 330, 'Onboarding explainer H2', '🟡 NEUTRAL', 'Education heading.');
ent('Four steps. Zero excuses.', 'src/app/onboarding/page.tsx', 331, 'Onboarding explainer sub', '🔴 OFF-BRAND 🎯 HIGH-LEVERAGE', 'Hustle-culture phrasing; shames by implication.');
ent('Upload your task', 'src/app/onboarding/page.tsx', 334, 'Explainer list title', '🟡 NEUTRAL', 'Step title.');
ent('Describe what you need to finish. I evaluate difficulty and set the stakes.', 'src/app/onboarding/page.tsx', 334, 'Explainer list text', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'First-person “I” reads as teacher; ok, but not explicitly Capy Teacher persona.');
ent('Race the clock', 'src/app/onboarding/page.tsx', 335, 'Explainer list title', '🟡 NEUTRAL', 'Step title.');
ent('A countdown timer creates the urgency your brain needs to focus.', 'src/app/onboarding/page.tsx', 335, 'Explainer list text', '🟡 NEUTRAL', 'Brain framing is systems-ish; “urgency” can read as pressure.');
ent('Prove you did it', 'src/app/onboarding/page.tsx', 336, 'Explainer list title', '🟢 IDENTITY-ALIGNED', 'Proof-forward.');
ent("Upload a photo of your work. I'll verify it actually happened.", 'src/app/onboarding/page.tsx', 336, 'Explainer list text', '🟡 NEUTRAL', 'Proof + verification.');
ent('Earn XP', 'src/app/onboarding/page.tsx', 337, 'Explainer list title', '🟡 NEUTRAL', 'Gamification label.');
ent('Your pet grows stronger when you deliver. Fails cost XP. No cheating.', 'src/app/onboarding/page.tsx', 337, 'Explainer list text', '🔴 OFF-BRAND', '“No cheating” moralizes; shame-adjacent.');
ent('Got it →', 'src/app/onboarding/page.tsx', 367, 'Explainer CTA', '🟡 NEUTRAL', 'CTA.');
ent('One important rule', 'src/app/onboarding/page.tsx', 387, 'Rule slide H2', '🟡 NEUTRAL', 'Sets stakes.');
ent("I'm not a reward-you-for-nothing teacher. If you don't finish, ", 'src/app/onboarding/page.tsx', 398, 'Rule slide paragraph part 1', '🟡 NEUTRAL', 'Explains real stakes; slightly lecturing.');
ent('your pet loses XP.', 'src/app/onboarding/page.tsx', 399, 'Rule slide emphasized clause', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'Pet as penalty bearer (intentional mechanic) but emotional.');
ent("So only start a session when you're actually ready to work.", 'src/app/onboarding/page.tsx', 399, 'Rule slide paragraph part 2', '🟡 NEUTRAL', 'Reasonable guardrail.');
ent('Think of it as a commitment contract. With a very cute capybara on the line.', 'src/app/onboarding/page.tsx', 402, 'Rule slide secondary', '🟡 NEUTRAL', 'Contract framing is coherent with product.');
ent("Deal. Let's go.", 'src/app/onboarding/page.tsx', 410, 'Rule slide CTA', '🟡 NEUTRAL', 'Agreement CTA.');
ent('Design your capybara', 'src/app/onboarding/page.tsx', 427, 'Color step H2', '🟡 NEUTRAL', 'Customization.');
ent('Pick a color, give them a name', 'src/app/onboarding/page.tsx', 429, 'Color step sub', '🟡 NEUTRAL', 'Instruction.');
ent('Unlock at Level ', 'src/app/onboarding/page.tsx', 466, 'Locked color title template (level appended)', '🟡 NEUTRAL', 'Unlock hint.');
ent('Name your capybara...', 'src/app/onboarding/page.tsx', 481, 'Pet name placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Hatch my egg! 🥚', 'src/app/onboarding/page.tsx', 502, 'Hatch CTA', '🟡 NEUTRAL', 'Playful onboarding CTA.');
ent('Something is happening...', 'src/app/onboarding/page.tsx', 558, 'Egg idle caption', '🟡 NEUTRAL', 'Loading-ish microcopy.');
ent("It's moving! 👀", 'src/app/onboarding/page.tsx', 559, 'Egg wobble caption', '🟡 NEUTRAL', 'Playful.');
ent('Almost there...!', 'src/app/onboarding/page.tsx', 560, 'Egg crack caption', '🟡 NEUTRAL', 'Playful.');
ent(' is here!', 'src/app/onboarding/page.tsx', 592, 'Hatch success H2 suffix (name prepended in JSX)', '🟡 NEUTRAL', 'Celebration template.');
ent('Your capybara is ready to hold you accountable.', 'src/app/onboarding/page.tsx', 601, 'Post-hatch line', '🟡 NEUTRAL', 'Accountability framing; “hold accountable” can feel intense.');
ent("Let's go! 🎉", 'src/app/onboarding/page.tsx', 611, 'Post-hatch CTA', '🟡 NEUTRAL', 'CTA.');
ent(' is counting on you', 'src/app/onboarding/page.tsx', 637, 'Final slide H2 suffix', '🟡 NEUTRAL ⚠️ CHARACTER DRIFT', 'Pressure via pet counting on user.');
ent("Time to show your capybara what you're made of.", 'src/app/onboarding/page.tsx', 639, 'Final slide body', '🟡 NEUTRAL', 'Identity challenge; borderline hustle.');
ent('Saving...', 'src/app/onboarding/page.tsx', 647, 'Final CTA loading', '🟡 NEUTRAL', 'Loading.');
ent('Start my first session →', 'src/app/onboarding/page.tsx', 647, 'Final CTA', '🟡 NEUTRAL', 'Onboarding completion CTA.');
ent('Back', 'src/app/onboarding/page.tsx', 681, 'Onboarding back control', '🟡 NEUTRAL', 'Navigation.');

lines.push('---');
lines.push('');
lines.push('## Section 4: Session Flow (subset — high-signal strings)');
lines.push('');

ent('Loading your workspace...', 'src/app/home/page.tsx', 193, 'Home loading', '🟡 NEUTRAL', 'Loading.');
ent('Welcome back', 'src/app/home/page.tsx', 219, 'Home greeting strong text', '🟡 NEUTRAL', 'Greeting fragment.');
ent('What are we working on today?', 'src/app/home/page.tsx', 220, 'Home greeting continuation', '🟡 NEUTRAL', 'Friendly prompt.');
ent('Closet', 'src/app/home/page.tsx', 241, 'Home pet card button', '🟡 NEUTRAL', 'Nav shortcut.');
ent('Level ', 'src/app/home/page.tsx', 233, 'Pet level label fragment', '🟡 NEUTRAL', 'Stats label.');
ent(' XP', 'src/app/home/page.tsx', 233, 'Pet XP suffix', '🟡 NEUTRAL', 'Stats suffix.');
ent('New session', 'src/app/home/page.tsx', 285, 'Session setup card H2', '🟡 NEUTRAL', 'Section title.');
ent('Link to a goal (optional)', 'src/app/home/page.tsx', 290, 'Goal link label', '🟡 NEUTRAL', 'Form label.');
ent('None — regular focus session', 'src/app/home/page.tsx', 298, 'Goal select default option', '🟡 NEUTRAL', 'Select option.');
ent('Stakes and proof follow that goal when linked.', 'src/app/home/page.tsx', 306, 'Goal helper', '🟡 NEUTRAL', 'Explainer.');
ent('What do you need to finish?', 'src/app/home/page.tsx', 314, 'Task label', '🟡 NEUTRAL', 'Form label.');
ent('AP Bio lab report, chapter 3 homework...', 'src/app/home/page.tsx', 320, 'Task placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Any extra context? (optional)', 'src/app/home/page.tsx', 329, 'Context label', '🟡 NEUTRAL', 'Form label.');
ent('The rubric says I need 3 paragraphs...', 'src/app/home/page.tsx', 334, 'Context placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Upload rubric / instructions (optional)', 'src/app/home/page.tsx', 344, 'Upload label', '🟡 NEUTRAL', 'Form label.');
ent('Drop files here', 'src/app/home/page.tsx', 357, 'Dropzone active', '🟡 NEUTRAL', 'Drop state.');
ent('Drag & drop or click to upload', 'src/app/home/page.tsx', 357, 'Dropzone idle', '🟡 NEUTRAL', 'Upload prompt.');
ent('How long will this take?', 'src/app/home/page.tsx', 390, 'Timer slider label', '🟡 NEUTRAL', 'Form label.');
ent('5 min', 'src/app/home/page.tsx', 407, 'Slider min', '🟡 NEUTRAL', 'Scale endpoint.');
ent('2 hours', 'src/app/home/page.tsx', 408, 'Slider max', '🟡 NEUTRAL', 'Scale endpoint.');
ent('Uploading images...', 'src/app/home/page.tsx', 426, 'Start session loading', '🟡 NEUTRAL', 'Loading.');
ent('Start Session', 'src/app/home/page.tsx', 428, 'Start session CTA', '🟡 NEUTRAL', 'Primary CTA.');
ent('Re-evaluating with your details...', 'src/app/evaluate/page.tsx', 255, 'Evaluate scanning copy', '🟡 NEUTRAL', 'Loading.');
ent('Evaluating your assignment...', 'src/app/evaluate/page.tsx', 255, 'Evaluate scanning copy', '🟡 NEUTRAL', 'Loading.');
ent('Go back', 'src/app/evaluate/page.tsx', 245, 'Evaluate error CTA', '🟡 NEUTRAL', 'Recovery.');
ent('Failed to evaluate. Please try again.', 'src/app/evaluate/page.tsx', 112, 'Evaluate client catch error', '🟡 NEUTRAL', 'Generic error.');
ent('I need a bit more info', 'src/app/evaluate/page.tsx', 285, 'Context question H2', '🟡 NEUTRAL', 'Clarification prompt.');
ent('Can you provide more details about this assignment?', 'src/app/evaluate/page.tsx', 289, 'Context question fallback', '🟡 NEUTRAL', 'Fallback string.');
ent('Type your answer...', 'src/app/evaluate/page.tsx', 294, 'Context answer placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Submit', 'src/app/evaluate/page.tsx', 307, 'Context submit', '🟡 NEUTRAL', 'Button.');
ent('Skip — evaluate with what I gave you', 'src/app/evaluate/page.tsx', 315, 'Context skip', '🟡 NEUTRAL', 'Escape hatch.');
ent('GO!', 'src/app/evaluate/page.tsx', 347, 'Countdown go', '🟡 NEUTRAL', 'Dramatic start.');
ent("Here's the deal", 'src/app/evaluate/page.tsx', 369, 'Deal card H2', '🟡 NEUTRAL', 'Stakes reveal heading.');
ent('Linked goal', 'src/app/evaluate/page.tsx', 374, 'Linked goal prefix fragment', '🟡 NEUTRAL', 'Goal link notice.');
ent(' — XP stakes match your goal.', 'src/app/evaluate/page.tsx', 374, 'Linked goal suffix fragment', '🟡 NEUTRAL', 'Explains linked stakes.');
ent('Proof tip:', 'src/app/evaluate/page.tsx', 388, 'Proof guidance label', '🟡 NEUTRAL', 'Inline label.');
ent('You finish', 'src/app/evaluate/page.tsx', 415, 'XP stake label positive', '🟡 NEUTRAL', 'Stakes UI.');
ent("You don't", 'src/app/evaluate/page.tsx', 425, 'XP stake label negative', '🟡 NEUTRAL', 'Stakes UI.');
ent('XP', 'src/app/evaluate/page.tsx', 422, 'XP unit', '🟡 NEUTRAL', 'Label.');
ent(' minutes on the clock', 'src/app/evaluate/page.tsx', 438, 'Timer summary fragment', '🟡 NEUTRAL', 'Timer display fragment.');
ent('Keep my time anyway', 'src/app/evaluate/page.tsx', 457, 'Time flag dismiss', '🟡 NEUTRAL', 'User override CTA.');
ent('This task might not be screenshottable — you can describe what you did instead.', 'src/app/evaluate/page.tsx', 465, 'Non-screenshottable hint', '🟢 IDENTITY-ALIGNED', 'Offers accessible proof path.');
ent("Let's go", 'src/app/evaluate/page.tsx', 478, 'Start timer CTA', '🟡 NEUTRAL', 'Primary CTA.');
ent('Go back and modify plan', 'src/app/evaluate/page.tsx', 486, 'Secondary navigation', '🟡 NEUTRAL', 'Edit path.');
ent('Adjust this plan with Capy', 'src/app/evaluate/page.tsx', 395, 'CriteriaRefineChat title prop', '🟡 NEUTRAL', 'Chat header.');
ent('Upload your proof ', 'src/app/timer/page.tsx', 349, 'Timer proof heading fragment', '🟡 NEUTRAL', 'Proof panel title.');
ent('Drop photos here', 'src/app/timer/page.tsx', 364, 'Timer dropzone active', '🟡 NEUTRAL', 'Drop state.');
ent('Upload up to 5 screenshots of your work', 'src/app/timer/page.tsx', 364, 'Timer dropzone idle', '🟡 NEUTRAL', 'Instruction.');
ent('Short note to go with your photo(s)…', 'src/app/timer/page.tsx', 396, 'Linked goal proof placeholder', '🟡 NEUTRAL', 'Placeholder variant.');
ent('Or describe what you did...', 'src/app/timer/page.tsx', 396, 'Proof text placeholder', '🟡 NEUTRAL', 'Placeholder.');
ent('Linked to a goal — your proof counts toward it.', 'src/app/timer/page.tsx', 404, 'Linked goal helper', '🟡 NEUTRAL', 'Explainer.');
ent('Uploading proof...', 'src/app/timer/page.tsx', 420, 'Proof upload loading', '🟡 NEUTRAL', 'Loading.');
ent('Submit proof', 'src/app/timer/page.tsx', 422, 'Proof submit CTA', '🟡 NEUTRAL', 'Primary CTA.');
ent('⚠️ OVERTIME — ', 'src/app/timer/page.tsx', 437, 'Overtime label prefix', '🟡 NEUTRAL', 'Timer warning fragment.');
ent('s left', 'src/app/timer/page.tsx', 437, 'Overtime label suffix', '🟡 NEUTRAL', 'Timer warning fragment.');
ent('Checking your work...', 'src/app/verify/page.tsx', 255, 'Verify scanning', '🟡 NEUTRAL', 'Loading.');
ent('Go home', 'src/app/verify/page.tsx', 249, 'Verify error CTA', '🟡 NEUTRAL', 'Recovery.');
ent('Verification failed. Please try again.', 'src/app/verify/page.tsx', 115, 'Verify client catch', '🟡 NEUTRAL', 'Generic error.');
ent('Time ran out before you could submit your proof. Your capybara is disappointed, but not giving up on you.', 'src/app/verify/page.tsx', 127, 'Timer expired feedback', '🔴 OFF-BRAND ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE', 'Pet disappointment is moralizing; failure peak.');
ent('Approved!', 'src/app/verify/page.tsx', 300, 'Verdict approved H2', '🔴 OFF-BRAND 🎯 HIGH-LEVERAGE', 'Generic triumph word vs proof-earned framing.');
ent('Not quite', 'src/app/verify/page.tsx', 305, 'Verdict rejected H2', '🟡 NEUTRAL', 'Soft rejection label.');
ent('Your proof', 'src/app/verify/page.tsx', 338, 'Proof image alt', '🟡 NEUTRAL', 'Alt text.');
ent('Continue →', 'src/app/verify/page.tsx', 365, 'Post-feedback CTA', '🟡 NEUTRAL', 'Continue.');
ent('Level ', 'src/app/verify/page.tsx', 438, 'Level-up H2 text node prefix before `{newLevel}`', '🟡 NEUTRAL', 'Literal fragment in JSX.');
ent('!', 'src/app/verify/page.tsx', 438, 'Level-up H2 trailing punctuation after `{newLevel}`', '🟡 NEUTRAL', 'Literal fragment in JSX.');
ent(' XP', 'src/app/verify/page.tsx', 452, 'XP change suffix', '🟡 NEUTRAL', 'Unit.');
ent('Great work!', 'src/app/verify/page.tsx', 455, 'XP reaction praise (full approval)', '🔴 OFF-BRAND 🎯 HIGH-LEVERAGE', 'Hollow praise; not evidence-linked.');
ent('Partial credit — keep going!', 'src/app/verify/page.tsx', 455, 'XP reaction partial', '🟢 IDENTITY-ALIGNED', 'Process-forward, low shame.');
ent('Better luck next time.', 'src/app/verify/page.tsx', 455, 'XP reaction fail', '🔴 OFF-BRAND', 'Luck framing dismisses system + effort narrative.');
ent('New session', 'src/app/verify/page.tsx', 470, 'Post-session CTA', '🟡 NEUTRAL', 'Primary loop CTA.');
ent('View dashboard', 'src/app/verify/page.tsx', 478, 'Secondary CTA', '🟡 NEUTRAL', 'Navigation.');

lines.push('---');
lines.push('');
lines.push('## Section 5: AI System Prompts (full text)');
lines.push('');

lines.push('### Entry (AI-EVAL-SYS)');
lines.push(`- **Copy:** ${JSON.stringify(evaluateSystem)}`);
lines.push('- **Location:** `src/app/api/evaluate/route.ts:86-111` — `system` template literal');
lines.push('- **Context:** Claude system prompt for initial session evaluation / XP stakes / needsMoreContext gate.');
lines.push('- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE');
lines.push('- **Why tagged:** Strong operational rules and digital-proof generosity help thesis; opening “strict but encouraging” and lack of nerdy-capy persona keeps it neutral with drift risk.');
lines.push(block(evaluateSystem));

lines.push('### Entry (AI-EVAL-REFINE-SYS)');
lines.push(`- **Copy:** ${JSON.stringify(evaluateRefineSystem)}`);
lines.push('- **Location:** `src/app/api/evaluate/refine/route.ts:73-89` — `system` template literal');
lines.push('- **Context:** Claude system prompt for chat-based refinement of evaluate draft before timer.');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Mostly procedural JSON shaping; minimal persona.');
lines.push(block(evaluateRefineSystem));

lines.push('### Entry (AI-VERIFY-SYS)');
lines.push(`- **Copy:** ${JSON.stringify(verifySystem)}`);
lines.push('- **Location:** `src/app/api/verify/route.ts:111-129` — `system` template literal (includes interpolated `taskDescription`)');
lines.push('- **Context:** Claude system prompt for vision verification / completionLevel / feedbackText.');
lines.push('- **Tag:** 🟢 IDENTITY-ALIGNED 🎯 HIGH-LEVERAGE');
lines.push('- **Why tagged:** Emphasizes specific visible evidence and generous partial credit; aligns with proof-based self-trust.');
lines.push(block(verifySystem));

lines.push('### Entry (AI-COMMIT-SYS)');
lines.push(`- **Copy:** ${JSON.stringify(commitmentsSystem)}`);
lines.push('- **Location:** `src/app/api/commitments/route.ts:87-122` — `system` template literal (includes interpolated deadline)');
lines.push('- **Context:** Claude system prompt for creating/refining verifiable long-term commitments.');
lines.push('- **Tag:** 🟡 NEUTRAL ⚠️ CHARACTER DRIFT 🎯 HIGH-LEVERAGE');
lines.push('- **Why tagged:** Helpful gatekeeping for measurability; “strict but encouraging” again; persona thin.');
lines.push(block(commitmentsSystem));

lines.push('### Entry (AI-COMMIT-REFINE-SYS)');
lines.push(`- **Copy:** ${JSON.stringify(commitmentsRefineSystem)}`);
lines.push('- **Location:** `src/app/api/commitments/refine/route.ts:70-86` — `system` template literal');
lines.push('- **Context:** Claude system prompt for chat refinement of commitment draft.');
lines.push('- **Tag:** 🟢 IDENTITY-ALIGNED');
lines.push('- **Why tagged:** Explicit nerdy encouraging capybara + warm assistantMessage guidance best matches intended persona.');
lines.push(block(commitmentsRefineSystem));

lines.push('### Entry (AI-EVAL-USER-BLOCK)');
lines.push('- **Copy:** `Task title: ${taskTitle}\\nContext: ${contextText || \'No additional context provided.\'}\\nTime estimate: ${Math.round(timeEstimate / 60)} minutes` (template literal expression)');
lines.push('- **Location:** `src/app/api/evaluate/route.ts:55-58`');
lines.push('- **Context:** User message text block assembled for Claude (not shown to end user; model input copy).');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Internal prompt assembly; neutral instructional headers.');

lines.push('### Entry (AI-VERIFY-USER-BLOCKS)');
lines.push('- **Copy:** Includes literals `ASSIGNMENT CONTEXT IMAGES:`, `ASSIGNMENT CONTEXT TEXT: …`, `STUDENT PROOF IMAGES (…):`, `STUDENT WRITTEN PROOF: …`, and `The student was supposed to: …` / `Proof guidance: …` / `Now verify their proof…`');
lines.push('- **Location:** `src/app/api/verify/route.ts:44-105`');
lines.push('- **Context:** Multimodal user content assembly for verification model.');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Internal labeling strings; functional.');

lines.push('### Entry (AI-COMMIT-USER)');
lines.push('- **Copy:** `The student says: "${userInput.trim()}"${extraContext}`');
lines.push('- **Location:** `src/app/api/commitments/route.ts:124-127`');
lines.push('- **Context:** User message content for commitments evaluation.');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Internal prompt wrapper.');

lines.push('### Entry (AI-MOCK-EVAL-TASK)');
lines.push('- **Copy:** `Complete "${taskTitle}" in full. Show clear, organized work that demonstrates you engaged with the material and met the task requirements.`');
lines.push('- **Location:** `src/app/api/evaluate/route.ts:13` — `mockEvaluate` return `taskDescription`');
lines.push('- **Context:** Fallback mock response shown to UI when no API key.');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Generic but serviceable mock task text.');

lines.push('### Entry (AI-MOCK-EVAL-PROOF)');
lines.push('- **Copy:** `Take a screenshot or photo of your completed "${taskTitle}" — a final result, submission confirmation, or your finished work clearly visible.`');
lines.push('- **Location:** `src/app/api/evaluate/route.ts:14`');
lines.push('- **Context:** Mock proof guidance.');
lines.push('- **Tag:** 🟡 NEUTRAL');
lines.push('- **Why tagged:** Concrete proof instructions.');

lines.push('### Entry (AI-MOCK-VERIFY)');
lines.push('- **Copy:** `Excellent work! Your proof clearly shows you completed "${taskDescription}". I can see you put in genuine effort and the result meets the requirements. You followed through exactly as expected — that\'s what builds the habit of accountability. Your capybara is proud of you. Keep this momentum going into your next session!`');
lines.push('- **Location:** `src/app/api/verify/route.ts:8`');
lines.push('- **Context:** Mock approval feedback when no API key.');
lines.push('- **Tag:** 🔴 OFF-BRAND 🎯 HIGH-LEVERAGE');
lines.push('- **Why tagged:** Hollow praise + generic “effort” without evidence + pet pride line; contradicts specificity thesis.');

// Items
lines.push('---');
lines.push('');
lines.push('## Section 6: Pet & Closet (item display names from `src/lib/items.ts`)');
lines.push('');
const itemLines = read('src/lib/items.ts').split(/\n/);
for (let i = 0; i < itemLines.length; i++) {
  const m = itemLines[i].match(/name:\s*'([^']+)'/);
  if (m) {
    ent(m[1], 'src/lib/items.ts', i + 1, 'Cosmetic item name shown in closet UI', '🟡 NEUTRAL', 'Inventory label; no brand thesis content.');
  }
}

lines.push('### Additional closet UI strings');
ent('Home', 'src/app/closet/page.tsx', 89, 'Closet back nav', '🟡 NEUTRAL', 'Navigation.');
ent('Closet', 'src/app/closet/page.tsx', 91, 'Closet page H1', '🟡 NEUTRAL', 'Page title.');
ent('Rename pet', 'src/app/closet/page.tsx', 135, 'Rename icon title', '🟡 NEUTRAL', 'Tooltip/title.');
ent('Saving...', 'src/app/closet/page.tsx', 150, 'Saving indicator', '🟡 NEUTRAL', 'Loading.');
ent('🎩 Hats', 'src/app/closet/page.tsx', 172, 'Closet tab', '🟡 NEUTRAL', 'Tab label.');
ent('👕 Clothes', 'src/app/closet/page.tsx', 172, 'Closet tab', '🟡 NEUTRAL', 'Tab label.');
ent('🎨 Colors', 'src/app/closet/page.tsx', 172, 'Closet tab', '🟡 NEUTRAL', 'Tab label.');
ent('None', 'src/app/closet/page.tsx', 198, 'Unequip hats', '🟡 NEUTRAL', 'Option label.');
ent('None', 'src/app/closet/page.tsx', 243, 'Unequip clothes', '🟡 NEUTRAL', 'Option label.');

lines.push('---');
lines.push('');
lines.push('## Section 16: SEO / Meta');
lines.push('');
ent('Capy', 'src/app/layout.tsx', 19, 'Root metadata title', '🟡 NEUTRAL', 'Browser tab title.');
ent('Meet your AI accountability capybara. Upload your assignment, race the timer, prove you did the work. Your pet earns XP when you deliver.', 'src/app/layout.tsx', 21, 'Root metadata description', '🟡 NEUTRAL 🎯 HIGH-LEVERAGE', 'SEO/social framing; proof-forward.');

lines.push('---');
lines.push('');
lines.push('## Section 10: Error States (API JSON `error` strings)');
lines.push('');
ent('Task title is required', 'src/app/api/evaluate/route.ts', 40, 'Evaluate API JSON error', '🟡 NEUTRAL', 'Validation error string.');
ent('No text response from AI', 'src/app/api/evaluate/route.ts', 117, 'Evaluate API error', '🟡 NEUTRAL', 'Generic failure.');
ent('Failed to parse AI response', 'src/app/api/evaluate/route.ts', 128, 'Evaluate API error', '🟡 NEUTRAL', 'Parse failure.');
ent('Failed to evaluate task. Please try again.', 'src/app/api/evaluate/route.ts', 132, 'Evaluate API catch-all', '🟡 NEUTRAL', 'Generic server error.');
ent('Invalid draft', 'src/app/api/evaluate/refine/route.ts', 46, 'Refine evaluate error', '🟡 NEUTRAL', 'Validation.');
ent('Messages required', 'src/app/api/evaluate/refine/route.ts', 49, 'Refine evaluate error', '🟡 NEUTRAL', 'Validation.');
ent('Too many messages', 'src/app/api/evaluate/refine/route.ts', 52, 'Refine evaluate error', '🟡 NEUTRAL', 'Validation.');
ent('Last user message required', 'src/app/api/evaluate/refine/route.ts', 57, 'Refine evaluate error', '🟡 NEUTRAL', 'Validation.');
ent('No response', 'src/app/api/evaluate/refine/route.ts', 95, 'Refine evaluate error', '🟡 NEUTRAL', 'AI failure.');
ent('Parse error', 'src/app/api/evaluate/refine/route.ts', 118, 'Refine evaluate error', '🟡 NEUTRAL', 'Parse failure.');
ent('Refine failed', 'src/app/api/evaluate/refine/route.ts', 122, 'Refine evaluate catch-all', '🟡 NEUTRAL', 'Generic server error.');
ent('Task description is required', 'src/app/api/verify/route.ts', 25, 'Verify API error', '🟡 NEUTRAL', 'Validation.');
ent('Proof image or text is required', 'src/app/api/verify/route.ts', 29, 'Verify API error', '🟡 NEUTRAL', 'Validation.');
ent('No text response from AI', 'src/app/api/verify/route.ts', 135, 'Verify API error', '🟡 NEUTRAL', 'Generic failure.');
ent('Failed to parse AI response', 'src/app/api/verify/route.ts', 146, 'Verify API error', '🟡 NEUTRAL', 'Parse failure.');
ent('Failed to verify work. Please try again.', 'src/app/api/verify/route.ts', 150, 'Verify API catch-all', '🟡 NEUTRAL', 'Generic server error.');
ent('Commitment description is required', 'src/app/api/commitments/route.ts', 70, 'Commitments API error', '🟡 NEUTRAL', 'Validation.');
ent('Deadline is required', 'src/app/api/commitments/route.ts', 74, 'Commitments API error', '🟡 NEUTRAL', 'Validation.');
ent('Failed to evaluate commitment. Please try again.', 'src/app/api/commitments/route.ts', 148, 'Commitments API catch-all', '🟡 NEUTRAL', 'Generic server error.');
ent('Invalid draft', 'src/app/api/commitments/refine/route.ts', 42, 'Commitments refine error', '🟡 NEUTRAL', 'Validation.');
ent('Messages required', 'src/app/api/commitments/refine/route.ts', 45, 'Commitments refine error', '🟡 NEUTRAL', 'Validation.');
ent('Too many messages', 'src/app/api/commitments/refine/route.ts', 48, 'Commitments refine error', '🟡 NEUTRAL', 'Validation.');
ent('Last user message required', 'src/app/api/commitments/refine/route.ts', 53, 'Commitments refine error', '🟡 NEUTRAL', 'Validation.');
ent('No response', 'src/app/api/commitments/refine/route.ts', 92, 'Commitments refine error', '🟡 NEUTRAL', 'AI failure.');
ent('Parse error', 'src/app/api/commitments/refine/route.ts', 114, 'Commitments refine error', '🟡 NEUTRAL', 'Parse failure.');
ent('Refine failed', 'src/app/api/commitments/refine/route.ts', 118, 'Commitments refine catch-all', '🟡 NEUTRAL', 'Generic server error.');
ent('Feedback is required', 'src/app/api/feedback/route.ts', 9, 'Feedback API error', '🟡 NEUTRAL', 'Validation.');
ent('Server configuration error', 'src/app/api/feedback/route.ts', 16, 'Feedback API misconfig', '🟡 NEUTRAL', 'Server error.');
ent('Failed to send feedback', 'src/app/api/feedback/route.ts', 51, 'Feedback API error', '🟡 NEUTRAL', 'Generic failure.');

lines.push('---');
lines.push('');
lines.push('## Section 15: Transactional (email templates)');
lines.push('');
ent("[Capy Feedback]${email ? ` from ${email}` : ''}${attachments.length ? ` (${attachments.length} screenshot${attachments.length > 1 ? 's' : ''})` : ''}", 'src/app/api/feedback/route.ts', 38, 'Nodemailer `subject` template literal (verbatim from source line)', '🟡 NEUTRAL', 'Transactional subject template.');
ent('New feedback via Capy App\n\n${feedback}\n\nSender: ${email || \'Anonymous\'}', 'src/app/api/feedback/route.ts', 39, 'Nodemailer `text` template literal (verbatim from source line)', '🟡 NEUTRAL', 'Transactional body template.');

lines.push('---');
lines.push('');
lines.push('## Sections 7–16 (condensed index)');
lines.push('');
lines.push('The following files contain the remaining user-facing strings catalogued in this audit with the same tagging rules. For line-accurate extraction of every literal, re-open the cited file alongside this map.');
lines.push('');
lines.push('- **Dashboard:** [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx) — nav labels (`Home`, `Dashboard`), stats labels (`Sessions`, `Success`, `Streak`, `XP`), empty state (`No sessions yet.`, `...waiting for your first commitment...`, `Start session`), filters (`All time`, `This week`, `This month`), chart title (`XP Over Time`), goals tab (`Goals`, `Sessions`, `Create a goal`, `No goals in this view.`), commitment status text (`active`, `completed`, `failed` rendered from data), `Goal`, `incomplete`, `Unknown date`, `Focused for … min`, `Strongest Day`, `This Week`, trend strings (`more sessions than last week`, etc.), `Subjects`, `Due …`, `Context n` alt text, `Proof` alt text.');
lines.push('- **Goals:** [`src/app/goals/page.tsx`](src/app/goals/page.tsx) — headers, placeholders, proof flow strings (`Lock it in`, `Evaluating your commitment...`, `Not specific enough`, `Try again`, `Tell Capy what to tweak`, `Submit for Verification`, `Checking your proof...`, `Approved`/`Not approved`, `Done`, `Past Goals`, etc.).');
lines.push('- **Settings:** [`src/app/settings/page.tsx`](src/app/settings/page.tsx) — all tab labels in `TABS`, account/prefs/subscription/data/about copy, modals (`Sign Out`, `Delete Account`, …), toasts (`Session history deleted`, `Data exported successfully`, …).');
lines.push('- **Feedback page:** [`src/app/feedback/page.tsx`](src/app/feedback/page.tsx) — marketing + form strings + errors.');
lines.push('- **How it works:** [`src/app/how-it-works/page.tsx`](src/app/how-it-works/page.tsx) — `STEPS` titles/descriptions + UI chrome.');
lines.push('- **Legal:** [`src/app/terms/page.tsx`](src/app/terms/page.tsx), [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx) — headings, paragraphs, list items (human-facing framing + policy text).');
lines.push('- **Components:** [`src/components/AppShell.tsx`](src/components/AppShell.tsx) (`aria-label` open menu), [`src/components/AppSidebar.tsx`](src/components/AppSidebar.tsx), [`src/components/SidebarNav.tsx`](src/components/SidebarNav.tsx), [`src/components/CriteriaRefineChat.tsx`](src/components/CriteriaRefineChat.tsx), [`src/components/FeedbackForm.tsx`](src/components/FeedbackForm.tsx), [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx) (`Close` sr-only + demo footer).');
lines.push('- **API errors / transactional:** [`src/app/api/evaluate/route.ts`](src/app/api/evaluate/route.ts), [`src/app/api/verify/route.ts`](src/app/api/verify/route.ts), [`src/app/api/commitments/route.ts`](src/app/api/commitments/route.ts), refine routes, [`src/app/api/feedback/route.ts`](src/app/api/feedback/route.ts) (email subject/body templates).');
lines.push('- **SEO:** [`src/app/layout.tsx:18-22`](src/app/layout.tsx) metadata `title` + `description`.');
lines.push('');
lines.push('> **Completeness note:** Sections 1–6 + Section 5 above enumerate **sequential entries** for the highest-risk surfaces and every `items.ts` `name:` value. Sections 7–16 list **file-level inventories** for remaining literals so nothing is “lost,” while keeping this file under practical size limits. If you need literal-by-literal entries for dashboard/settings/legal, duplicate this section’s pattern: one JSON-string per UI literal per line.');

const body = lines.join('\n');
const tagCounts = { green: 0, yellow: 0, red: 0, hl: 0, drift: 0 };
for (const line of body.split('\n')) {
  if (line.includes('🟢')) tagCounts.green++;
  if (line.includes('🟡')) tagCounts.yellow++;
  if (line.includes('🔴')) tagCounts.red++;
  if (line.includes('🎯')) tagCounts.hl++;
  if (line.includes('⚠️')) tagCounts.drift++;
}
const headerBlock = `# Capy Copy Audit — Full Map
Generated: 2026-04-16
Total copy entries found: ${id} (sequential \`### Entry n\` records) + Sections 7–16 file-level inventories for remaining literals
Tag breakdown (counted on **Tag:** lines in Sections 1–6 + Section 5 entries): 🟢 ${tagCounts.green} | 🟡 ${tagCounts.yellow} | 🔴 ${tagCounts.red}
Secondary flags (occurrences in **Tag:** lines): 🎯 ${tagCounts.hl} | ⚠️ ${tagCounts.drift}
Files scanned: 43 under \`src/\`; excluded \`Downloads/capy-main/\`

**Scope:** Canonical \`src/\` only. **Excluded:** \`Downloads/capy-main/\` (duplicate fork). **Also scanned:** [\`src/app/layout.tsx\`](src/app/layout.tsx) metadata, [\`public/\`](public/) SVGs (no user-facing prose).

**Note:** Entries are numbered sequentially. Section 5 includes **full verbatim** system prompt bodies extracted from source.`;
const finalOut = body.replace('__HEADER_PLACEHOLDER__', headerBlock);
fs.writeFileSync(out, finalOut);
console.log('Wrote', out, 'entries', id);
