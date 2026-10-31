import { PuppyProfile, TaskItem, PottyLog, SleepLog, WalkLog, TrainingLesson, JournalEntry } from '../types';
import { storage } from './storage';

export interface DayRhythm {
  dateStr: string;
  dayLabel: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  isToday: boolean;
}

export interface RecapBadge {
  title: string;
  emoji: string;
  description: string;
}

export type ScoreGrade = 'critical' | 'needs_work' | 'fair' | 'great' | 'stellar';

export interface ScoreBreakdown {
  score: number; // 0.0 - 10.0
  maxScore: number;
  grade: ScoreGrade;
  gradeLabel: string;
  badgeColor: string;
  summary: string;
  habitsScore: number; // out of 4.0
  pottyScore: number; // out of 3.0
  activityScore: number; // out of 1.5
  restScore: number; // out of 1.5
}

export interface WeeklyRecapData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  displayRange: string;
  isCompletedWeek: boolean;
  daysRemainingInWeek: number;
  scoreBreakdown: ScoreBreakdown;
  tasks: {
    total: number;
    completed: number;
    skipped: number;
    completionRate: number;
    bestStreakDays: number;
    dailyRhythm: DayRhythm[];
    topCategory: string;
  };
  potty: {
    totalLogs: number;
    outdoor: number;
    accidents: number;
    reliabilityRate: number;
    status: 'untracked' | 'legendary' | 'great' | 'needs_work';
  };
  sleep: {
    totalHours: number;
    dailyAverageHours: number;
    napsCount: number;
  };
  walks: {
    totalWalks: number;
    totalMinutes: number;
    totalMiles: number;
  };
  training: {
    lessonsPracticed: number;
    lessonsMastered: number;
  };
  photos: string[];
  badge: RecapBadge;
  insightSummary: string;
}

export interface MonthlyRecapData {
  monthName: string;
  monthNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  displayRange: string;
  isCompletedMonth: boolean;
  scoreBreakdown: ScoreBreakdown;
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    activeDays: number;
  };
  potty: {
    totalLogs: number;
    outdoor: number;
    accidents: number;
    reliabilityRate: number;
    status: 'untracked' | 'legendary' | 'great' | 'needs_work';
  };
  sleep: {
    totalHours: number;
    dailyAverageHours: number;
  };
  walks: {
    totalWalks: number;
    totalMinutes: number;
    totalMiles: number;
  };
  training: {
    lessonsCompleted: number;
  };
  expenses: {
    totalSpent: number;
  };
  photos: string[];
  badge: RecapBadge;
  insightSummary: string;
}

export function calculatePawgressScore(params: {
  tasksTotal: number;
  tasksCompleted: number;
  pottyTotal: number;
  outdoorPotty: number;
  walkMinutes: number;
  sleepHours: number;
}): ScoreBreakdown {
  const { tasksTotal, tasksCompleted, pottyTotal, outdoorPotty, walkMinutes, sleepHours } = params;

  // 1. Habit Rhythm Score (up to 4.0 pts)
  let habitsScore = 0;
  if (tasksTotal > 0) {
    habitsScore = Math.min(4.0, (tasksCompleted / tasksTotal) * 4.0);
  }

  // 2. Potty Reliability Score (up to 3.0 pts)
  let pottyScore = 0;
  if (pottyTotal > 0) {
    const accuracy = outdoorPotty / pottyTotal;
    const volumeCredit = Math.min(1.0, pottyTotal / 7.0); // Expect ~1-2 logged breaks per day
    pottyScore = Math.min(3.0, (volumeCredit * 1.0) + (accuracy * 2.0));
  }

  // 3. Activity / Walks (up to 1.5 pts)
  let activityScore = 0;
  if (walkMinutes > 0) {
    activityScore = Math.min(1.5, (walkMinutes / 60) * 1.5);
  }

  // 4. Sleep & Rest (up to 1.5 pts)
  let restScore = 0;
  if (sleepHours > 0) {
    restScore = Math.min(1.5, (sleepHours / 50) * 1.5);
  }

  const rawScore = habitsScore + pottyScore + activityScore + restScore;
  const score = Math.round(rawScore * 10) / 10;

  let grade: ScoreGrade = 'critical';
  let gradeLabel = 'Off Track';
  let badgeColor = 'bg-[#F6E8E2] text-[#8C3F24] border-[#EACEC3]';
  let summary = 'No regular daily habits or care logs recorded this week.';

  if (score >= 8.5) {
    grade = 'stellar';
    gradeLabel = 'Stellar Rhythm';
    badgeColor = 'bg-[#EEF6EC] text-[#245C1E] border-[#C8DEC3]';
    summary = 'Exceptional habit consistency, healthy walks, and reliable routines!';
  } else if (score >= 6.5) {
    grade = 'great';
    gradeLabel = 'Solid Progress';
    badgeColor = 'bg-[#F3E7DA] text-[#5F3E29] border-[#E8DDD3]';
    summary = 'Consistent routine with regular potty breaks and habit completions.';
  } else if (score >= 4.0) {
    grade = 'fair';
    gradeLabel = 'Building Momentum';
    badgeColor = 'bg-[#FAF2E4] text-[#8C4E28] border-[#EBD6C4]';
    summary = 'Some habits recorded, but routines are inconsistent across days.';
  } else if (score >= 2.0) {
    grade = 'needs_work';
    gradeLabel = 'Needs Attention';
    badgeColor = 'bg-[#F8EBE3] text-[#934326] border-[#EBCEBF]';
    summary = 'Low habit engagement. Consistent schedule needed to prevent regression.';
  } else {
    grade = 'critical';
    gradeLabel = 'Off Track';
    badgeColor = 'bg-[#F6E8E2] text-[#8C3F24] border-[#EACEC3]';
    summary = 'Routine not yet started. Zero or near-zero habits completed.';
  }

  return {
    score,
    maxScore: 10.0,
    grade,
    gradeLabel,
    badgeColor,
    summary,
    habitsScore: Math.round(habitsScore * 10) / 10,
    pottyScore: Math.round(pottyScore * 10) / 10,
    activityScore: Math.round(activityScore * 10) / 10,
    restScore: Math.round(restScore * 10) / 10,
  };
}

export function getPuppyAgeInfo(puppy: PuppyProfile) {
  const createdDate = puppy.createdAt ? new Date(puppy.createdAt) : new Date();
  const now = new Date();
  
  const diffTime = Math.max(0, now.getTime() - createdDate.getTime());
  const daysSinceStart = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  
  const currentWeekNumber = Math.max(1, Math.ceil(daysSinceStart / 7));
  const isFirstWeekPassed = daysSinceStart >= 7;
  const daysUntilNextWeeklyRecap = isFirstWeekPassed 
    ? (7 - (daysSinceStart % 7)) % 7 
    : Math.max(0, 7 - daysSinceStart);

  const isFirstMonthPassed = daysSinceStart >= 30;
  const daysUntilNextMonthlyRecap = isFirstMonthPassed
    ? (30 - (daysSinceStart % 30)) % 30
    : Math.max(0, 30 - daysSinceStart);

  return {
    daysSinceStart,
    currentWeekNumber,
    isFirstWeekPassed,
    daysUntilNextWeeklyRecap,
    isFirstMonthPassed,
    daysUntilNextMonthlyRecap,
  };
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getWeeklyRecapData(
  puppy: PuppyProfile,
  weekOffset: number = 0
): WeeklyRecapData {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;
  
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - distanceToMonday - (weekOffset * 7));
  currentMonday.setHours(0, 0, 0, 0);

  const weekSunday = new Date(currentMonday);
  weekSunday.setDate(currentMonday.getDate() + 6);
  weekSunday.setHours(23, 59, 59, 999);

  const startDateStr = formatDate(currentMonday);
  const endDateStr = formatDate(weekSunday);

  const isCompletedWeek = now.getTime() > weekSunday.getTime();
  const daysRemainingInWeek = isCompletedWeek
    ? 0
    : Math.max(0, Math.ceil((weekSunday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Fetch all records from storage
  const allTasks: TaskItem[] = storage.getTasks(puppy.id);
  const allPotty: PottyLog[] = storage.getPottyLogs(puppy.id);
  const allSleep: SleepLog[] = storage.getSleepLogs(puppy.id);
  const allWalks: WalkLog[] = storage.getWalkLogs(puppy.id);
  const allLessons: TrainingLesson[] = storage.getTrainingLessons();
  const allJournal: JournalEntry[] = storage.getJournal(puppy.id);

  // Filter tasks for this 7-day window
  const weekTasks = allTasks.filter((t) => t.date >= startDateStr && t.date <= endDateStr);
  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter((t) => t.completed).length;
  const skippedTasks = weekTasks.filter((t) => t.skipped).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Daily Rhythm for all 7 days of this week
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyRhythm: DayRhythm[] = [];
  const todayStr = formatDate(now);

  for (let i = 0; i < 7; i++) {
    const loopDay = new Date(currentMonday);
    loopDay.setDate(currentMonday.getDate() + i);
    const dStr = formatDate(loopDay);
    const dayTasks = weekTasks.filter((t) => t.date === dStr);
    const dayCompleted = dayTasks.filter((t) => t.completed).length;
    const dayTotal = dayTasks.length;

    dailyRhythm.push({
      dateStr: dStr,
      dayLabel: dayLabels[i],
      totalTasks: dayTotal,
      completedTasks: dayCompleted,
      completionRate: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0,
      isToday: dStr === todayStr,
    });
  }

  // Calculate streak
  let bestStreakDays = 0;
  let currentStreak = 0;
  for (const day of dailyRhythm) {
    if (day.completedTasks > 0) {
      currentStreak++;
      if (currentStreak > bestStreakDays) bestStreakDays = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Category Breakdown
  const catCount: Record<string, number> = {};
  for (const t of weekTasks) {
    if (t.completed) {
      catCount[t.category] = (catCount[t.category] || 0) + 1;
    }
  }
  let topCategory = 'routine';
  let maxCat = 0;
  for (const [cat, count] of Object.entries(catCount)) {
    if (count > maxCat) {
      maxCat = count;
      topCategory = cat;
    }
  }

  // Filter Potty Logs
  const weekPotty = allPotty.filter((p) => {
    const pDate = p.timestamp ? p.timestamp.split('T')[0] : '';
    return pDate >= startDateStr && pDate <= endDateStr;
  });
  const outdoorPotty = weekPotty.filter((p) => p.location === 'outdoor' || p.location === 'pad').length;
  const accidentsPotty = weekPotty.filter((p) => p.location === 'indoor_accident' || p.type === 'accident').length;
  const pottyTotal = weekPotty.length;
  const pottyRate = pottyTotal > 0 ? Math.round((outdoorPotty / pottyTotal) * 100) : 0;
  const pottyStatus: 'untracked' | 'legendary' | 'great' | 'needs_work' = 
    pottyTotal === 0 ? 'untracked' : pottyRate >= 90 ? 'legendary' : pottyRate >= 75 ? 'great' : 'needs_work';

  // Filter Sleep Logs
  const weekSleep = allSleep.filter((s) => {
    const sDate = s.startTime ? s.startTime.split('T')[0] : '';
    return sDate >= startDateStr && sDate <= endDateStr;
  });
  const totalSleepMinutes = weekSleep.reduce((acc, s) => acc + (s.durationMin || 0), 0);
  const totalSleepHours = Math.round((totalSleepMinutes / 60) * 10) / 10;
  const dailyAverageSleepHours = Math.round((totalSleepHours / 7) * 10) / 10;

  // Filter Walks
  const weekWalks = allWalks.filter((w) => {
    const wDate = w.startTime ? w.startTime.split('T')[0] : '';
    return wDate >= startDateStr && wDate <= endDateStr;
  });
  const totalWalkMinutes = weekWalks.reduce((acc, w) => acc + (w.durationMin || 0), 0);
  const totalWalkMiles = Math.round(weekWalks.reduce((acc, w) => acc + (w.distanceMiles || 0), 0) * 10) / 10;

  // Training
  const masteredLessons = allLessons.filter((l) => l.mastered).length;
  const practicedLessons = allLessons.filter((l) => l.completed).length;

  // Photos from Journal
  const weekJournal = allJournal.filter((j) => {
    const jDate = j.date;
    return jDate;
  });
  const photos = weekJournal
    .map((j) => j.mediaUrl)
    .filter((url): url is string => Boolean(url));
  if (photos.length === 0 && puppy.photoUrl) {
    photos.push(puppy.photoUrl);
  }

  // Calculate Real Paw-gress Score
  const scoreBreakdown = calculatePawgressScore({
    tasksTotal: totalTasks,
    tasksCompleted: completedTasks,
    pottyTotal,
    outdoorPotty,
    walkMinutes: totalWalkMinutes,
    sleepHours: totalSleepHours,
  });

  // Award Real Honest Badge & Insight
  let badge: RecapBadge;
  let insightSummary = '';

  if (scoreBreakdown.score < 3.5) {
    badge = {
      title: 'Routine Needs Focus',
      emoji: '🐾',
      description: `${completedTasks} of ${totalTasks} habits completed this week. Puppies require predictable schedules to build confidence and housebreaking stability.`,
    };
    insightSummary = `${puppy.name} currently has zero consistent daily habits logged this week (${completedTasks}/${totalTasks} completed). Without a steady schedule, potty accidents and boundary confusion increase. Tap "+" to start logging meals and outdoor breaks!`;
  } else if (scoreBreakdown.score < 6.0) {
    badge = {
      title: 'Building Early Habits',
      emoji: '🌱',
      description: `Starting to build daily habits, but routine consistency is slipping (${scoreBreakdown.score}/10).`,
    };
    insightSummary = `Routine is starting to take shape with ${completedTasks} completed tasks, but key potty and rest habits are missing. Setting alarms for consistent crate naps and potty breaks will fast-track progress.`;
  } else if (pottyRate >= 85 && pottyTotal >= 5) {
    badge = {
      title: 'Potty Pioneer',
      emoji: '🚽',
      description: `Incredible housebreaking accuracy (${pottyRate}%) with ${outdoorPotty} outdoor successes!`,
    };
    insightSummary = `${puppy.name} crushed housebreaking this week with a ${pottyRate}% outdoor success rate across ${pottyTotal} breaks! Keep praising immediately after outdoor eliminations.`;
  } else if (taskCompletionRate >= 80 && completedTasks >= 7) {
    badge = {
      title: 'Rhythm Master',
      emoji: '🎯',
      description: `Rock-solid consistency with an ${taskCompletionRate}% daily habit completion rate!`,
    };
    insightSummary = `Outstanding consistency! Following a steady rhythm of meals, potty breaks, and rest gives ${puppy.name} the security needed to thrive.`;
  } else if (totalWalkMinutes >= 60) {
    badge = {
      title: 'Trail Explorer',
      emoji: '🌲',
      description: `Logged ${totalWalkMinutes} minutes of active exploration and healthy exercise!`,
    };
    insightSummary = `Great physical stimulation with ${totalWalkMinutes} minutes of outdoor sniffing walks. Well-exercised puppies sleep better and chew less!`;
  } else if (masteredLessons >= 1 && practicedLessons >= 2) {
    badge = {
      title: 'Brainiac Pup',
      emoji: '🧠',
      description: `Mastered critical foundation skills in the Puppy Academy!`,
    };
    insightSummary = `Excellent cognitive work! Mental enrichment and impulse control drills are key to calm puppyhood behavior.`;
  } else {
    badge = {
      title: 'Making Progress',
      emoji: '🐾',
      description: `Steady foundation being laid with ${completedTasks} habits tracked for ${puppy.name}.`,
    };
    insightSummary = `${puppy.name} is making steady progress! Continuing to log daily habits will build long-term behavioral predictability.`;
  }

  return {
    weekNumber: weekOffset + 1,
    startDate: startDateStr,
    endDate: endDateStr,
    displayRange: `${formatDisplayDate(startDateStr)} – ${formatDisplayDate(endDateStr)}`,
    isCompletedWeek,
    daysRemainingInWeek,
    scoreBreakdown,
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      skipped: skippedTasks,
      completionRate: taskCompletionRate,
      bestStreakDays,
      dailyRhythm,
      topCategory,
    },
    potty: {
      totalLogs: pottyTotal,
      outdoor: outdoorPotty,
      accidents: accidentsPotty,
      reliabilityRate: pottyRate,
      status: pottyStatus,
    },
    sleep: {
      totalHours: totalSleepHours,
      dailyAverageHours: dailyAverageSleepHours,
      napsCount: weekSleep.filter((s) => s.type === 'nap').length,
    },
    walks: {
      totalWalks: weekWalks.length,
      totalMinutes: totalWalkMinutes,
      totalMiles: totalWalkMiles,
    },
    training: {
      lessonsPracticed: practicedLessons,
      lessonsMastered: masteredLessons,
    },
    photos,
    badge,
    insightSummary,
  };
}

export function getMonthlyRecapData(
  puppy: PuppyProfile,
  monthOffset: number = 0
): MonthlyRecapData {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const year = targetDate.getFullYear();
  const monthNumber = targetDate.getMonth() + 1;
  const monthName = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, targetDate.getMonth(), 1);
  const lastDay = new Date(year, targetDate.getMonth() + 1, 0);

  const startDateStr = formatDate(firstDay);
  const endDateStr = formatDate(lastDay);
  const isCompletedMonth = now.getTime() > lastDay.getTime();

  // Storage data
  const allTasks: TaskItem[] = storage.getTasks(puppy.id);
  const allPotty: PottyLog[] = storage.getPottyLogs(puppy.id);
  const allSleep: SleepLog[] = storage.getSleepLogs(puppy.id);
  const allWalks: WalkLog[] = storage.getWalkLogs(puppy.id);
  const allLessons: TrainingLesson[] = storage.getTrainingLessons();
  const allExpenses = storage.getExpenses(puppy.id);
  const allJournal: JournalEntry[] = storage.getJournal(puppy.id);

  // Filter tasks
  const monthTasks = allTasks.filter((t) => t.date >= startDateStr && t.date <= endDateStr);
  const completedTasks = monthTasks.filter((t) => t.completed).length;
  const totalTasks = monthTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active days with at least 1 completed task
  const activeDates = new Set(monthTasks.filter((t) => t.completed).map((t) => t.date));

  // Potty
  const monthPotty = allPotty.filter((p) => {
    const pDate = p.timestamp ? p.timestamp.split('T')[0] : '';
    return pDate >= startDateStr && pDate <= endDateStr;
  });
  const outdoorPotty = monthPotty.filter((p) => p.location === 'outdoor' || p.location === 'pad').length;
  const accidentsPotty = monthPotty.filter((p) => p.location === 'indoor_accident' || p.type === 'accident').length;
  const pottyRate = monthPotty.length > 0 ? Math.round((outdoorPotty / monthPotty.length) * 100) : 0;
  const pottyStatus: 'untracked' | 'legendary' | 'great' | 'needs_work' = 
    monthPotty.length === 0 ? 'untracked' : pottyRate >= 85 ? 'legendary' : pottyRate >= 70 ? 'great' : 'needs_work';

  // Sleep
  const monthSleep = allSleep.filter((s) => {
    const sDate = s.startTime ? s.startTime.split('T')[0] : '';
    return sDate >= startDateStr && sDate <= endDateStr;
  });
  const totalSleepMinutes = monthSleep.reduce((acc, s) => acc + (s.durationMin || 0), 0);
  const totalSleepHours = Math.round((totalSleepMinutes / 60) * 10) / 10;
  const daysInMonth = lastDay.getDate();
  const dailyAverageSleepHours = Math.round((totalSleepHours / daysInMonth) * 10) / 10;

  // Walks
  const monthWalks = allWalks.filter((w) => {
    const wDate = w.startTime ? w.startTime.split('T')[0] : '';
    return wDate >= startDateStr && wDate <= endDateStr;
  });
  const totalWalkMinutes = monthWalks.reduce((acc, w) => acc + (w.durationMin || 0), 0);
  const totalWalkMiles = Math.round(monthWalks.reduce((acc, w) => acc + (w.distanceMiles || 0), 0) * 10) / 10;

  // Lessons
  const lessonsCompleted = allLessons.filter((l) => l.completed).length;

  // Expenses
  const monthExpenses = allExpenses.filter((e) => e.date >= startDateStr && e.date <= endDateStr);
  const totalSpent = monthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Photos
  const photos = allJournal
    .map((j) => j.mediaUrl)
    .filter((url): url is string => Boolean(url));
  if (photos.length === 0 && puppy.photoUrl) {
    photos.push(puppy.photoUrl);
  }

  // Calculate Real Paw-gress Score
  const scoreBreakdown = calculatePawgressScore({
    tasksTotal: totalTasks,
    tasksCompleted: completedTasks,
    pottyTotal: monthPotty.length,
    outdoorPotty,
    walkMinutes: totalWalkMinutes,
    sleepHours: totalSleepHours,
  });

  // Monthly Badge
  let badge: RecapBadge;
  let insightSummary = '';

  if (scoreBreakdown.score < 3.5) {
    badge = {
      title: 'Routine Inactive',
      emoji: '🐾',
      description: `Only ${completedTasks} habits recorded for ${puppy.name} across ${monthName}.`,
    };
    insightSummary = `Very few habits or care events were tracked for ${puppy.name} this month. Regular logging is critical for detecting health changes, tracking growth, and maintaining housebreaking.`;
  } else if (scoreBreakdown.score < 6.0) {
    badge = {
      title: 'Sporadic Habits',
      emoji: '🌱',
      description: `Habits were logged inconsistently (${completedTasks} habits across ${activeDates.size} active days).`,
    };
    insightSummary = `Inconsistent tracking pattern this month. Building a set morning and evening routine will help ${puppy.name} settle with fewer accidents.`;
  } else if (pottyRate >= 80 && monthPotty.length >= 10) {
    badge = {
      title: 'Housebreaking Royalty',
      emoji: '👑',
      description: `Exceptional 30-day potty mastery with ${outdoorPotty} outdoor breaks logged!`,
    };
    insightSummary = `${puppy.name} completed a phenomenal housebreaking month with ${outdoorPotty} successful outdoor breaks. Routine is well-cemented!`;
  } else if (completedTasks >= 30) {
    badge = {
      title: 'Routine Virtuoso',
      emoji: '✨',
      description: `Completed over ${completedTasks} schedule habits across ${activeDates.size} active days!`,
    };
    insightSummary = `High consistency month with ${completedTasks} completed daily rhythm habits. ${puppy.name} thrives in this environment.`;
  } else {
    badge = {
      title: 'Monthly Milestone',
      emoji: '🗓️',
      description: `Solid monthly journey with ${puppy.name} logged in PupLume.`,
    };
    insightSummary = `${puppy.name}'s month has been filled with growth. Keep up daily tracking to monitor development!`;
  }

  return {
    monthName,
    monthNumber,
    year,
    startDate: startDateStr,
    endDate: endDateStr,
    displayRange: `${formatDisplayDate(startDateStr)} – ${formatDisplayDate(endDateStr)}`,
    isCompletedMonth,
    scoreBreakdown,
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      completionRate,
      activeDays: activeDates.size,
    },
    potty: {
      totalLogs: monthPotty.length,
      outdoor: outdoorPotty,
      accidents: accidentsPotty,
      reliabilityRate: pottyRate,
      status: pottyStatus,
    },
    sleep: {
      totalHours: totalSleepHours,
      dailyAverageHours: dailyAverageSleepHours,
    },
    walks: {
      totalWalks: monthWalks.length,
      totalMinutes: totalWalkMinutes,
      totalMiles: totalWalkMiles,
    },
    training: {
      lessonsCompleted,
    },
    expenses: {
      totalSpent,
    },
    photos,
    badge,
    insightSummary,
  };
}

export function formatRecapShareText(
  type: 'weekly' | 'monthly',
  data: WeeklyRecapData | MonthlyRecapData,
  puppy: PuppyProfile
): string {
  if (type === 'weekly') {
    const w = data as WeeklyRecapData;
    return `🐾 ${puppy.name}'s Weekly Paw-gress Report (${w.displayRange})!
Score: ${w.scoreBreakdown.score}/10 (${w.scoreBreakdown.gradeLabel})
Status: ${w.badge.title}

🎯 Tasks Completed: ${w.tasks.completed}/${w.tasks.total} (${w.tasks.completionRate}%)
🚽 Potty Reliability: ${w.potty.totalLogs > 0 ? `${w.potty.reliabilityRate}% (${w.potty.outdoor} outdoor breaks)` : 'No breaks logged'}
🦮 Active Walks: ${w.walks.totalWalks} walks (${w.walks.totalMinutes} min)
💤 Sleep Average: ${w.sleep.dailyAverageHours}h/day

${w.insightSummary}
Built with PupLume 🐾 https://puplume.com`;
  } else {
    const m = data as MonthlyRecapData;
    return `🐾 ${puppy.name}'s Monthly Paw-gress Report (${m.monthName})!
Score: ${m.scoreBreakdown.score}/10 (${m.scoreBreakdown.gradeLabel})
Status: ${m.badge.title}

🎯 Monthly Habits Completed: ${m.tasks.completed} (${m.tasks.completionRate}%)
🚽 Potty Reliability: ${m.potty.totalLogs > 0 ? `${m.potty.reliabilityRate}% (${m.potty.outdoor} breaks)` : 'No breaks logged'}
🦮 Active Exercise: ${m.walks.totalMinutes} minutes logged
🎓 Academy Lessons: ${m.training.lessonsCompleted} completed

${m.insightSummary}
Built with PupLume 🐾 https://puplume.com`;
  }
}
