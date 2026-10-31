import { TrainingLesson } from '../types';

export const INITIAL_TRAINING_CURRICULUM: TrainingLesson[] = [
  // 1. Foundation
  {
    id: 'found-1',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Name Recognition ("The Charging Game")',
    goal: 'Puppy whips their head towards you enthusiastically whenever their name is spoken once.',
    whyItMatters: 'A bulletproof name response is your emergency brake and the cornerstone of all future obedience.',
    steps: [
      'Wait for a quiet moment when puppy is looking away (not hyper-fixated).',
      'Say puppy’s name in a bright, happy tone ONE time.',
      'The split-second puppy looks towards you, mark with "Yes!" and deliver a high-value treat immediately.',
      'Repeat 8–10 times per session across different rooms.'
    ],
    durationMin: 5,
    tips: ['Never say the name 5 times in a row without a reward or it becomes background noise.', 'Use pea-sized soft treats like boiled chicken.'],
    commonMistakes: ['Using their name angrily when they do something wrong.', 'Repeating "Max! Max! Max!" before they look.'],
    completed: false,
    mastered: false
  },
  {
    id: 'found-2',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Marker Word Training ("Yes!" vs Clicker)',
    goal: 'Teach puppy that a specific sound bridges the exact split second of good behavior to an incoming reward.',
    whyItMatters: 'Dogs learn in micro-seconds. A marker bridges the gap between the action and the treat.',
    steps: [
      'Have 15 small treats ready in your pouch.',
      'Say "Yes!" clearly.',
      'Within 1 second, deliver 1 treat to puppy’s mouth.',
      'Pause 3 seconds, repeat 10 times until puppy’s eyes light up upon hearing "Yes!".'
    ],
    durationMin: 5,
    tips: ['Keep marker crisp and identical in tone.', 'Always follow the marker with a reward, even if you marked by accident.'],
    commonMistakes: ['Moving your treat hand before saying the marker word.', 'Saying "Good boyyyy" instead of a crisp marker.'],
    completed: false,
    mastered: false
  },
  {
    id: 'found-3',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Lure to "Sit"',
    goal: 'Puppy places hindquarters squarely on the ground on vocal cue or hand gesture.',
    whyItMatters: 'Sit is the default "polite request" behavior that prevents jumping and counter surfing.',
    steps: [
      'Hold a treat right at puppy’s nose level (let them smell, don’t release yet).',
      'Slowly sweep the treat up and back towards their forehead.',
      'As their head follows the lure, their bottom naturally hinges down.',
      'The millisecond bottom touches floor: mark "Yes!" and release treat.'
    ],
    durationMin: 5,
    tips: ['Don’t lift the treat too high or they will jump up instead of sitting.'],
    commonMistakes: ['Pushing down on puppy’s hips (can cause physical resistance).', 'Saying "Sit sit sit" repeatedly.'],
    completed: false,
    mastered: false
  },
  {
    id: 'found-4',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Down / Lie Down',
    goal: 'Puppy transitions from a sit or stand into elbows and belly resting on the ground.',
    whyItMatters: 'Down establishes a calm physiological state and lowers heart rate during excited moments.',
    steps: [
      'Start from a sitting position.',
      'Hold treat at nose, draw a straight vertical line straight down between their front paws.',
      'Once at floor, slide treat slightly forward along the ground like an "L" shape.',
      'Mark "Yes!" the instant elbows touch the ground.'
    ],
    durationMin: 5,
    tips: ['Practice on traction-friendly rug, not slippery hardwood floors.'],
    commonMistakes: ['Hovering the treat too high so puppy pops back up.', 'Pulling puppy’s legs.'],
    completed: false,
    mastered: false
  },
  {
    id: 'found-5',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Stay (Duration & Distance)',
    goal: 'Puppy remains in position until released with a clear "Free!" cue.',
    whyItMatters: 'Prevents bolting out of open doors, rushing traffic, or approaching unknown hazards.',
    steps: [
      'Ask for a Sit. Hold flat palm up gently: "Stay".',
      'Wait 2 seconds without moving your feet. Mark "Yes!" and treat.',
      'Gradually increase duration to 5 seconds, then take 1 half-step backwards and return before marking.'
    ],
    durationMin: 5,
    tips: ['Always return to the puppy to reward rather than calling them out of the stay.'],
    commonMistakes: ['Increasing distance and duration at the exact same time.'],
    completed: false,
    mastered: false
  },
  {
    id: 'found-6',
    moduleId: 'foundation',
    moduleTitle: 'Foundation Skills',
    title: 'Emergency Recall ("Rocket Come")',
    goal: 'Puppy sprints directly to owner from any room or yard distraction.',
    whyItMatters: 'A true life-saving command if leash breaks or a gate swings open.',
    steps: [
      'Have high-value jackpot treats (cheese, hot dog).',
      'Run backwards 5 steps while calling puppy’s name + "Come!" in a playful voice.',
      'When puppy catches up, gently hold their collar with one hand and deliver 4 treats in a row.'
    ],
    durationMin: 8,
    tips: ['Never call puppy to punish them, put them in the crate, or clip nails.'],
    commonMistakes: ['Calling the puppy and standing still or looming over them menacingly.'],
    completed: false,
    mastered: false
  },

  // 2. House Training
  {
    id: 'house-1',
    moduleId: 'house_training',
    moduleTitle: 'House Training',
    title: 'The Post-Event Potty Rhythm',
    goal: 'Take puppy out every time they wake up, 10 min after meals, and after vigorous play.',
    whyItMatters: 'Puppies under 16 weeks have limited bladder sphincter control; routine prevents indoor mistakes.',
    steps: [
      'Take puppy on leash to the same outdoor grass patch every single time.',
      'Stand still like a tree for 3 minutes. Say your cue ("Go potty") once.',
      'The moment they finish: Mark "Yes!" with enthusiastic praise and a special treat right outside.'
    ],
    durationMin: 10,
    tips: ['Throw an outdoor potty party! Give treats outside immediately, not after walking back indoors.'],
    commonMistakes: ['Playing first before pottying.', 'Waiting until puppy whines at the door (they don’t know how yet).'],
    completed: false,
    mastered: false,
  },
  {
    id: 'house-2',
    moduleId: 'house_training',
    moduleTitle: 'House Training',
    title: 'Accident Management & Zero Punishment',
    goal: 'Handle indoor slips calmly and eliminate scent markers that trigger repeat accidents.',
    whyItMatters: 'Punishing an accident teaches the puppy to hide and pee behind couches away from you.',
    steps: [
      'If caught in the act: calmly interrupt with a gentle "Oops!" and scoop outside immediately.',
      'If found after the fact: clean up in silence; puppy cannot connect retroactive scolding.',
      'Use enzymatic cleaner exclusively to break down microscopic uric acid crystals.'
    ],
    durationMin: 5,
    tips: ['Enzymatic spray needs 10 minutes of dwell time to fully neutralize odor.'],
    commonMistakes: ['Rubbing puppy’s nose in accident (cruel and medically ineffective).'],
    completed: false,
    mastered: false,
  },

  // 3. Behavior & Mouthing
  {
    id: 'behav-1',
    moduleId: 'behavior',
    moduleTitle: 'Behavior & Mouthing',
    title: 'Puppy Biting & The "Ouch" Redirection',
    goal: 'Teach bite inhibition and redirect shark-teeth onto appropriate rubber and rope toys.',
    whyItMatters: 'Puppy jaws explore the world with teeth. Teaching soft mouth prevents dangerous adult bites.',
    steps: [
      'When needle teeth touch skin: freeze immediately and say a crisp, calm "Ouch!" or "Nope".',
      'Instantly substitute skin with a cold textured chew toy (frozen Kong or nylabone).',
      'When teeth engage the toy, praise warmly: "Good puppy!"'
    ],
    durationMin: 5,
    tips: ['If puppy is in over-aroused "shark mode", they are almost always overtired and need a crate nap.'],
    commonMistakes: ['Pulling hand away fast in a game of chase.', 'Screaming high-pitched, which excites prey drive.'],
    completed: false,
    mastered: false,
  },
  {
    id: 'behav-2',
    moduleId: 'behavior',
    moduleTitle: 'Behavior & Mouthing',
    title: 'Leave It (Impulse Control)',
    goal: 'Puppy turns head away from forbidden items on the floor or sidewalk.',
    whyItMatters: 'Protects puppy from swallowing chicken bones, toxins, socks, or dropped medications.',
    steps: [
      'Place low-value kibble in closed fist. Puppy will sniff and lick.',
      'Wait silently. The instant puppy backs away or looks away: mark "Yes!" and treat from the OTHER hand.',
      'Once consistent, add verbal cue "Leave it" before showing the fist.'
    ],
    durationMin: 5,
    tips: ['Never reward with the item you told them to leave.'],
    commonMistakes: ['Pulling the item away like a game.', 'Repeating the cue when puppy is still pawing.'],
    completed: false,
    mastered: false
  },
  {
    id: 'behav-3',
    moduleId: 'behavior',
    moduleTitle: 'Behavior & Mouthing',
    title: 'Anti-Jumping "Four on the Floor"',
    goal: 'Puppy sits or keeps all four paws on the ground when greeting humans.',
    whyItMatters: 'Cute at 10 lbs, dangerous and muddy at 65 lbs.',
    steps: [
      'When approaching puppy, ignore jumping by folding arms and turning your back.',
      'The microsecond all four paws touch ground, kneel down and greet calmly.',
      'If paws leave the floor, stand straight up and disconnect attention.'
    ],
    durationMin: 5,
    tips: ['Instruct all household members and visitors to follow the exact same rule.'],
    commonMistakes: ['Petting the puppy while they are jumping up.'],
    completed: false,
    mastered: false
  },

  // 4. Crate & Independence
  {
    id: 'crate-1',
    moduleId: 'crate',
    moduleTitle: 'Crate Training & Independence',
    title: 'The Crate as a Treat Palace',
    goal: 'Puppy voluntarily walks into crate expecting wonderful treasures and calm rest.',
    whyItMatters: 'Crate provides safe den-like security, prevents destructive chewing, and accelerates potty training.',
    steps: [
      'Prop crate door wide open in living space with a comfy fleece blanket.',
      'Toss high-value treats inside without closing door. Let puppy go in and come right out freely.',
      'Feed regular meals inside the crate with the door propped open.',
      'Introduce a frozen lick mat or stuffed Kong to build 10 minutes of calm occupancy.'
    ],
    durationMin: 10,
    tips: ['Cover top and sides with a breathable blanket for dark den feel.'],
    commonMistakes: ['Using crate as a punishment or time-out.', 'Shoving puppy in by force.'],
    completed: false,
    mastered: false,
  },
  {
    id: 'crate-2',
    moduleId: 'crate',
    moduleTitle: 'Crate Training & Independence',
    title: 'Alone Time & Separation Prevention',
    goal: 'Puppy stays relaxed in designated puppy-proof room or crate for 30–60 minutes alone.',
    whyItMatters: 'Prevents severe separation anxiety as puppy grows into an adult dog.',
    steps: [
      'Exercise and potty puppy so physical needs are met.',
      'Give puppy a long-lasting chew item (yak chew or frozen lick mat).',
      'Step out of room for 2 minutes. Return quietly before they finish the chew.',
      'Gradually increase absence to 5, 15, and 30 minutes.'
    ],
    durationMin: 15,
    tips: ['Play white noise or calm dog reggae music during absences.'],
    commonMistakes: ['Making a dramatic, emotional goodbye and hello ritual.'],
    completed: false,
    mastered: false
  },

  // 5. Walking & Leash
  {
    id: 'walk-1',
    moduleId: 'walking',
    moduleTitle: 'Walking & Leash Skills',
    title: 'Harness & Leash Introduction Indoors',
    goal: 'Puppy is totally unfazed wearing harness and trailing a lightweight leash.',
    whyItMatters: 'Outdoor walks fail if the puppy is frantic trying to bite or scratch off the harness.',
    steps: [
      'Let puppy sniff harness on floor while eating treats.',
      'Slip head through harness neck loop while feeding a continuous stream of peanut butter.',
      'Buckle sides calmly, play 2 minutes of tug or fetch so they forget they are wearing it.'
    ],
    durationMin: 8,
    tips: ['Use a Y-shaped front/back clip harness to protect growing throat and trachea.'],
    commonMistakes: ['Using choke chains, prong collars, or retractable flexi-leashes on young puppies.'],
    completed: false,
    mastered: false,
  },
  {
    id: 'walk-2',
    moduleId: 'walking',
    moduleTitle: 'Walking & Leash Skills',
    title: 'Loose Leash "Be a Tree"',
    goal: 'Puppy walks on slack J-curve leash at your side without pulling.',
    whyItMatters: 'Prevents joint strain and makes daily walks a peaceful pleasure instead of a tug-of-war.',
    steps: [
      'The instant the leash tightens: freeze completely like an oak tree.',
      'Do not yank back. Wait silently until puppy turns or takes half a step back to loosen leash.',
      'Mark "Yes!" and step forward together.'
    ],
    durationMin: 10,
    tips: ['Reward by your hip seam so puppy learns the "sweet spot" is next to your leg.'],
    commonMistakes: ['Following the puppy when they pull (rewarding the pull with forward motion).'],
    completed: false,
    mastered: false
  },

  // 6. Socialization Checklist
  {
    id: 'social-1',
    moduleId: 'socialization',
    moduleTitle: 'Socialization & World Proofing',
    title: 'Novel Surfaces & Strange Sounds',
    goal: 'Expose puppy positively to grates, gravel, bubble wrap, umbrellas, sirens, and vacuum cleaners.',
    whyItMatters: 'The critical socialization window closes at ~16 weeks. Gentle exposure prevents lifelong phobias.',
    steps: [
      'Set vacuum or umbrella 15 feet away across the room.',
      'Play audio of thunderstorms or fireworks at 10% volume on phone while feeding dinner.',
      'Scatter treats across novel texture (aluminum foil, rubber mat, crunchy leaves).',
      'Observe body language: loose tail wag and soft eyes mean puppy is happy.'
    ],
    durationMin: 10,
    tips: ['Never force puppy to approach. Let them explore at their own chosen speed.'],
    commonMistakes: ['Overwhelming the puppy with too loud sounds or crowded places too early.'],
    completed: false,
    mastered: false,
  }
];
